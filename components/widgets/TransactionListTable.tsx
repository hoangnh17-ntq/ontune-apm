'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '@/types/apm';
import { formatTime, formatDuration } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight, MoreVertical, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContextMenu from '@/components/ui/ContextMenu';

interface TransactionListTableProps {
  transactions: Transaction[];
  onNavigate?: (tab: string, action: string) => void;
  onViewTrace?: (transaction: Transaction) => void;
  onSelectTransaction?: (transaction: Transaction) => void;
}

export default function TransactionListTable({ transactions, onNavigate, onViewTrace, onSelectTransaction }: TransactionListTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    transaction: Transaction;
  } | null>(null);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => {
      const matchesSearch =
        tx.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.traceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.agentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatusFilter =
        filterStatus === 'all' ||
        tx.status === filterStatus;

      const matchesMethodFilter =
        filterMethod === 'all' ||
        tx.method === filterMethod;

      return matchesSearch && matchesStatusFilter && matchesMethodFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortColumn as keyof Transaction];
      let bVal: any = b[sortColumn as keyof Transaction];

      if (sortColumn === 'timestamp' || sortColumn === 'responseTime') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, searchTerm, filterStatus, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fast': return 'text-green-400 bg-green-500/20';
      case 'normal': return 'text-blue-400 bg-blue-500/20';
      case 'slow': return 'text-orange-400 bg-orange-500/20';
      case 'very_slow': return 'text-red-400 bg-red-500/20';
      case 'error': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const handleRowClick = (e: React.MouseEvent, transaction: Transaction) => {
    e.preventDefault();
    if (onSelectTransaction) {
      onSelectTransaction(transaction);
    } else {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        transaction
      });
    }
  };

  const handleRowRightClick = (e: React.MouseEvent, transaction: Transaction) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      transaction
    });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <span className="text-muted-foreground ml-1">⇅</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Transaction List</h3>
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length}
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by endpoint, trace ID, or agent..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <select
            value={filterMethod}
            onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 pr-8 bg-background border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="all">All Methods</option>
            <option value="METHOD">METHOD</option>
            <option value="SQL">SQL</option>
            <option value="HTTPC">HTTPC</option>
            <option value="DBC">DBC</option>
            <option value="SOCKET">SOCKET</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 pr-8 bg-background border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="all">All Status</option>
            <option value="fast">Fast</option>
            <option value="normal">Normal</option>
            <option value="slow">Slow</option>
            <option value="very_slow">Very Slow</option>
            <option value="error">Error</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="px-4 py-2 bg-background border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>

        {/* Guide Message */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded border border-border/50">
          <Info className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Click on any row to view transaction details, or right-click for more options. Use the <MoreVertical className="inline h-3 w-3 mx-0.5" /> button for quick actions.</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted text-xs text-muted-foreground font-medium">
            <tr>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-accent"
                onClick={() => handleSort('timestamp')}
              >
                Time <SortIcon column="timestamp" />
              </th>
              <th className="px-4 py-3 text-left">Transaction ID</th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-accent"
                onClick={() => handleSort('endpoint')}
              >
                Endpoint <SortIcon column="endpoint" />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-accent"
                onClick={() => handleSort('method')}
              >
                Method <SortIcon column="method" />
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:bg-accent"
                onClick={() => handleSort('responseTime')}
              >
                Response Time <SortIcon column="responseTime" />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-accent"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon column="status" />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-accent"
                onClick={() => handleSort('agentName')}
              >
                Agent <SortIcon column="agentName" />
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {paginatedTransactions.map((tx) => (
              <tr
                key={tx.id}
                onClick={(e) => handleRowClick(e, tx)}
                onContextMenu={(e) => handleRowRightClick(e, tx)}
                className="group border-t border-border hover:bg-muted cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-foreground font-mono text-xs">
                  {formatTime(tx.timestamp)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-blue-400">
                  <div className="flex items-center gap-2">
                    <span className="flex-1">{tx.traceId.substring(0, 16)}...</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          transaction: tx
                        });
                      }}
                      className="p-1 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="View options"
                    >
                      <MoreVertical className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {tx.endpoint}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                    {tx.method}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  <span className={`
                    font-semibold
                    ${tx.responseTime < 100 ? 'text-green-400' :
                      tx.responseTime < 500 ? 'text-blue-400' :
                        tx.responseTime < 2000 ? 'text-orange-400' :
                          'text-red-400'}
                  `}>
                    {formatDuration(tx.responseTime)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground text-xs">
                  {tx.agentName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={i}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          transaction={contextMenu.transaction}
          onClose={() => setContextMenu(null)}
          onNavigate={onNavigate}
          onViewTrace={onViewTrace}
          onSelectTransaction={onSelectTransaction}
        />
      )}
    </div>
  );
}
