'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle, Cpu, HardDrive, Server, X, Network } from 'lucide-react';
import LineChartWidget from '@/components/charts/LineChartWidget';
import { Transaction, WasMetrics, WasSummary } from '@/types/apm';
import { generateTransactionHistory, generateWasMetrics } from '@/lib/mockData';
import ServiceTopologyMap from './ServiceTopologyMap';
import TransactionDetailPanel from './TransactionDetailPanel';

interface WasDetailSliderProps {
  was: WasSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WasDetailSlider({ was, isOpen, onClose }: WasDetailSliderProps) {
  const [metrics, setMetrics] = useState<WasMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showTxPanel, setShowTxPanel] = useState(false);

  useEffect(() => {
    if (!was) return;
    setMetrics(generateWasMetrics(was.id));
    const tx = generateTransactionHistory(25, 60).map(t => ({ ...t, agentId: was.id, agentName: was.name }));
    setTransactions(tx);
    setSelectedTx(null);
    setShowTxPanel(false);
  }, [was]);

  const statusIcon = useMemo(() => {
    switch (was?.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  }, [was]);

  if (!was || !isOpen) return null;

  const renderMainContent = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">P95 / P99</div>
            <div className="text-lg font-bold text-blue-400">{was.p95Latency.toFixed(0)} / {was.p99Latency.toFixed(0)}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">TPS</div>
            <div className="text-lg font-bold text-green-400">{was.tps.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">Throughput</div>
            <div className="text-lg font-bold text-orange-400">{was.throughput.toFixed(0)} rps</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">Error Rate</div>
            <div className="text-lg font-bold text-red-400">{was.errorRate}%</div>
          </CardContent>
        </Card>
      </div>

          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartWidget
                title="Latency (P95/P99)"
                data={metrics.latencySeries}
                dataKeys={[
                  { key: 'p95', color: '#3b82f6', name: 'P95' },
                  { key: 'p99', color: '#f97316', name: 'P99' }
                ]}
                height={260}
              />
              <LineChartWidget
                title="Transaction Rate"
                data={metrics.transactionRate}
                dataKeys={[{ key: 'tps', color: '#22c55e', name: 'TPS' }]}
                height={260}
              />
            </div>
          )}

          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LineChartWidget
                title="Thread Monitoring"
                data={metrics.threadSeries}
                dataKeys={[
                  { key: 'active', color: '#8b5cf6', name: 'Active' },
                  { key: 'queue', color: '#f59e0b', name: 'Queue' }
                ]}
                height={220}
              />
              <LineChartWidget
                title="GC Monitoring"
                data={metrics.gcSeries}
                dataKeys={[{ key: 'ms', color: '#ef4444', name: 'GC (ms)' }]}
                height={220}
              />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    Resource Panel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics.resourceUsage.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold">{item.value}{item.unit}</span>
                      </div>
                      <div className="h-1.5 rounded bg-muted">
                        <div
                          className="h-1.5 rounded"
                          style={{ width: `${Math.min(100, Number(item.value))}%`, backgroundColor: '#3b82f6' }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Heap & Thread Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs text-muted-foreground font-medium">
                  <tr>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.heapThreads.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        {row.type === 'heap' ? <HardDrive className="h-4 w-4 text-blue-400" /> : <Cpu className="h-4 w-4 text-orange-400" />} 
                        {row.type === 'heap' ? 'Heap' : 'Thread'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{row.description}</td>
                      <td className="px-4 py-3">
                        <Badge variant={row.severity === 'warn' ? 'secondary' : 'outline'} className="text-xs">
                          {row.severity.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

          <div className="max-h-[70vh] overflow-hidden">
            <ServiceTopologyMap selectedApp={was.id} />
          </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Endpoint</th>
                  <th className="px-4 py-3 text-right">Resp</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 12).map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-t border-border hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setSelectedTx(tx);
                      setShowTxPanel(true);
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                    <td className="px-4 py-3">{tx.endpoint}</td>
                    <td className="px-4 py-3 text-right font-mono">{tx.responseTime.toFixed(0)}ms</td>
                    <td className="px-4 py-3">
                      <Badge variant={tx.status === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showTxPanel && selectedTx && (
        <Card className="border-primary/40">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Transaction Detail</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => {
              setSelectedTx(null);
              setShowTxPanel(false);
            }}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 h-[70vh]">
            <TransactionDetailPanel transaction={selectedTx} />
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTransactionDetailOnly = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowTxPanel(false);
          }}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Back to WAS Detail
        </Button>
        <h3 className="text-lg font-semibold">Transaction Detail</h3>
      </div>
      {selectedTx && (
        <div className="border rounded-lg overflow-hidden bg-background">
          <TransactionDetailPanel transaction={selectedTx} />
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative ml-auto h-full w-[90vw] max-w-6xl bg-background shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            {statusIcon}
            <div>
              <h2 className="text-xl font-semibold">{was.name}</h2>
              <p className="text-sm text-muted-foreground">WAS Detail • {was.project}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {showTxPanel && selectedTx ? renderTransactionDetailOnly() : renderMainContent()}
      </div>
    </div>
  );
}
