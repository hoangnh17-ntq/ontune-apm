'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { generateDBTransactions } from '@/lib/mockData';
import { Database, Search } from 'lucide-react';

export default function DBTransactionView() {
  const [dbTransactions, setDbTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const txs = generateDBTransactions('current-transaction', 50);
    // Map to expected format
    const mappedTxs = txs.map(tx => ({
      ...tx,
      query: tx.sqlText || '',
      duration: tx.executionTime || 0,
      rows: tx.rowsAffected || 0,
      status: tx.status === 'rollback' ? 'rolledback' : tx.status || 'committed'
    }));
    setDbTransactions(mappedTxs);
    
    // Refresh every 3 seconds
    const interval = setInterval(() => {
      const newTxs = generateDBTransactions('current-transaction', 50);
      const mappedNewTxs = newTxs.map(tx => ({
        ...tx,
        query: tx.sqlText || '',
        duration: tx.executionTime || 0,
        rows: tx.rowsAffected || 0,
        status: tx.status === 'rollback' ? 'rolledback' : tx.status || 'committed'
      }));
      setDbTransactions(mappedNewTxs);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = dbTransactions.filter(tx => {
    if (!tx || !tx.query) return false;
    const query = typeof tx.query === 'string' ? tx.query : String(tx.query || '');
    if (!query) return false;
    return query.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = {
    total: filteredTransactions.length,
    committed: filteredTransactions.filter(t => t?.status === 'committed').length,
    rolledback: filteredTransactions.filter(t => t?.status === 'rolledback').length,
    avgDuration: filteredTransactions.length > 0 
      ? filteredTransactions.reduce((sum, t) => sum + (t?.duration || 0), 0) / filteredTransactions.length 
      : 0
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Queries</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{stats.committed}</div>
              <div className="text-xs text-muted-foreground mt-1">Committed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{stats.rolledback}</div>
              <div className="text-xs text-muted-foreground mt-1">Rolled Back</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.avgDuration.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-1">Avg Duration (ms)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DB Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Database Transaction List (Java Context)</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <CardDescription>
            Database interactions captured within the current transaction context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Query</th>
                  <th className="py-3 px-4 font-medium text-right">Duration (ms)</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Rows</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No database transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((dbTx, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs max-w-[400px] truncate" title={String(dbTx.query || '')}>
                          {String(dbTx.query || 'N/A')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs">
                        <span className={(dbTx.duration || 0) > 100 ? 'text-orange-400' : (dbTx.duration || 0) > 200 ? 'text-red-400' : ''}>
                          {dbTx.duration ? Number(dbTx.duration).toFixed(2) : '0.00'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {dbTx.query && typeof dbTx.query === 'string' && dbTx.query.length > 0 
                            ? dbTx.query.split(' ')[0].toUpperCase() 
                            : 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={dbTx.status === 'committed' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {String(dbTx.status || 'unknown')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs">
                        {String(dbTx.rows || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <div className="font-semibold mb-2">About DB Transaction Monitoring:</div>
            <div>• Captures all database queries executed within the transaction scope</div>
            <div>• Shows query duration, type (SELECT, INSERT, UPDATE, DELETE), and status</div>
            <div>• Queries over 100ms are highlighted as potentially slow</div>
            <div>• Use this data to identify slow queries and optimize database performance</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

