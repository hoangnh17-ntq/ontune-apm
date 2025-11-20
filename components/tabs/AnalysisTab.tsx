'use client';

import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/apm';
import { generateTransactionHistory, generateJVMMetrics, generateWorkerThreadState, generateDBTransactions } from '@/lib/mockData';
import TransactionListTable from '@/components/widgets/TransactionListTable';
import DistributedTraceView from '@/components/monitor/DistributedTraceView';
import ServiceTopologyMap from '@/components/monitor/ServiceTopologyMap';
import JavaSourceViewer from '@/components/monitor/JavaSourceViewer';
import TransactionTimelineView from '@/components/monitor/TransactionTimelineView';
import TransactionDetailsView from '@/components/monitor/TransactionDetailsView';
import CreateAlertRuleDialog from '@/components/config/CreateAlertRuleDialog';
import SlidePanel from '@/components/ui/SlidePanel';
import TransactionDetailPanel from '@/components/monitor/TransactionDetailPanel';

interface AnalysisTabProps {
  activeAction?: string;
  onNavigate?: (tab: string, action: string) => void;
}

export default function AnalysisTab({ activeAction, onNavigate }: AnalysisTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [queryText, setQueryText] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelInitialTab, setPanelInitialTab] = useState<string>('details');
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string } | null>(null);
  const jvmMetrics = generateJVMMetrics();
  const threadState = generateWorkerThreadState();

  useEffect(() => {
    const txs = generateTransactionHistory(200, 30);
    setTransactions(txs);
    setFilteredTransactions(txs);
  }, []);

  // Handle activeAction from context menu
  useEffect(() => {
    const storedTx = sessionStorage.getItem('selectedTransaction');
    if (storedTx && activeAction) {
      const tx = JSON.parse(storedTx);
      setSelectedTransaction(tx);

      // Map action to panel tab
      let initialTab = 'details';
      let shouldOpenPanel = false;

      switch (activeAction) {
        case 'transaction-details':
          initialTab = 'details';
          shouldOpenPanel = true;
          break;
        case 'bullet-view':
          initialTab = 'trace';
          shouldOpenPanel = true;
          break;
        case 'timeline':
          initialTab = 'timeline';
          shouldOpenPanel = true;
          break;
        case 'java-source':
          initialTab = 'source';
          shouldOpenPanel = true;
          break;
        case 'create-alert':
          initialTab = 'alert';
          shouldOpenPanel = true;
          break;
        case 'view-topology':
          initialTab = 'topology';
          shouldOpenPanel = true;
          break;
        case 'sql-queries':
          // Show transaction resources tab with SQL queries
          initialTab = 'resources';
          shouldOpenPanel = true;
          break;
        case 'user-session':
          // Apply user filter
          const userFilter = sessionStorage.getItem('userIdFilter');
          if (userFilter) {
            const filtered = transactions.filter(t => t.userId === userFilter);
            setFilteredTransactions(filtered);
            setActiveFilter({ type: 'User Session', value: `User: ${userFilter}` });
            sessionStorage.removeItem('userIdFilter');
          }
          break;
        case 'similar-transactions':
          // Apply endpoint filter
          const endpoint = sessionStorage.getItem('similarEndpoint');
          if (endpoint) {
            const filtered = transactions.filter(t => t.endpoint === endpoint);
            setFilteredTransactions(filtered);
            setActiveFilter({ type: 'Similar Transactions', value: endpoint });
            sessionStorage.removeItem('similarEndpoint');
          }
          break;
      }

      if (shouldOpenPanel) {
        setPanelInitialTab(initialTab);
        setIsPanelOpen(true);
      }
    }
  }, [activeAction, transactions]);

  const handleSearch = () => {
    if (!queryText) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter(tx =>
      tx.endpoint.toLowerCase().includes(queryText.toLowerCase()) ||
      tx.traceId.toLowerCase().includes(queryText.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  const handleViewTrace = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPanelInitialTab('trace');
    setIsPanelOpen(true);
  };

  const handleTransactionClick = (transaction: Transaction, tab: string = 'details') => {
    setSelectedTransaction(transaction);
    setPanelInitialTab(tab);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedTransaction(null);
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
    setFilteredTransactions(transactions);
    setQueryText('');
  };

  const avgResponseTime = filteredTransactions.length > 0
    ? (filteredTransactions.reduce((sum, tx) => sum + tx.responseTime, 0) / filteredTransactions.length).toFixed(0)
    : '0';

  const errorCount = filteredTransactions.filter(tx => tx.status === 'error').length;

  // Main List View
  return (
    <>
      <div className="space-y-6">
        <Alert>
          <Search className="h-4 w-4" />
          <AlertDescription>
            <strong>Analysis - Deep Dive:</strong> Advanced transaction analysis and filtering. Query transactions, view distributed traces, and analyze system metrics.
          </AlertDescription>
        </Alert>

        {/* Active Filter Alert */}
        {activeFilter && (
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Search className="h-4 w-4 text-blue-400" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong className="text-blue-400">{activeFilter.type}:</strong>{' '}
                <span className="text-foreground">{activeFilter.value}</span>
                <span className="text-muted-foreground ml-2">
                  ({filteredTransactions.length} results)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilter}
                className="text-blue-400 hover:text-blue-300"
              >
                Clear Filter
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Advanced Query Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Query Builder</CardTitle>
            <CardDescription>Filter transactions using advanced queries (e.g., transaction_time &gt; 3s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter query (e.g., transaction_time > 3s, status = error)"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>Search</Button>
              <Button variant="outline" onClick={() => { setQueryText(''); setFilteredTransactions(transactions); }}>Clear</Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing <strong className="text-2xl text-foreground">{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> transactions
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  Avg Response: <Badge variant="outline">{avgResponseTime}ms</Badge>
                </div>
                <div>
                  Errors: <Badge variant={errorCount > 0 ? 'destructive' : 'secondary'}>{errorCount}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <TransactionListTable
          transactions={filteredTransactions.slice(-100)}
          onNavigate={onNavigate}
          onViewTrace={handleViewTrace}
        />

        {/* Bullet View - Waterfall Chart */}
        {filteredTransactions.length > 0 && (
          <DistributedTraceView
            transaction={filteredTransactions[0]}
            onViewSource={(span) => {
              sessionStorage.setItem('selectedSpan', JSON.stringify(span));
              setSelectedTransaction(filteredTransactions[0]);
              setPanelInitialTab('source');
              setIsPanelOpen(true);
            }}
          />
        )}

        {/* JVM Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>JVM Metrics Summary</CardTitle>
            <CardDescription>Real-time Java Virtual Machine performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Heap Memory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-500">{jvmMetrics.heapUsed.toFixed(0)}MB</div>
                  <p className="text-sm text-muted-foreground">Used of {jvmMetrics.heapMax}MB</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thread Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-500">{jvmMetrics.threadCount}</div>
                  <p className="text-sm text-muted-foreground">Peak: {jvmMetrics.threadPeakCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">GC Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-500">{jvmMetrics.gcCollectionCount}</div>
                  <p className="text-sm text-muted-foreground">{jvmMetrics.gcCollectionTime.toFixed(0)}ms total time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Non-Heap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-500">{jvmMetrics.nonHeapUsed.toFixed(0)}MB</div>
                  <p className="text-sm text-muted-foreground">Non-heap memory</p>
                </CardContent>
              </Card>
            </div>

            <Alert className="mt-4">
              <Monitor className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> For detailed thread state and database query analysis, right-click on any transaction in the list above and select the appropriate menu item.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Slide Panel for Transaction Details */}
      <SlidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title="Transaction Analysis"
        width="w-[85vw]"
      >
        {selectedTransaction && (
          <TransactionDetailPanel
            transaction={selectedTransaction}
          />
        )}
      </SlidePanel>
    </>
  );
}
