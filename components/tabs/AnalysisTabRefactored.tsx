'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  BarChart3,
  TrendingUp,
  GitCompare,
  Info,
  AlertCircle,
  Settings,
  Layers
} from 'lucide-react';
import TransactionListTable from '@/components/widgets/TransactionListTable';
import DistributedTraceView from '@/components/monitor/DistributedTraceView';
import SlidePanel from '@/components/ui/SlidePanel';
import TransactionDetailPanel from '@/components/monitor/TransactionDetailPanel';
import FilterSidebar, { FilterState } from '@/components/ui/FilterSidebar';
import ZoomableTimeSeriesChart from '@/components/charts/ZoomableTimeSeriesChart';
import { generateTransactionHistory } from '@/lib/mockData';
import { Transaction } from '@/types/apm';

type AnalysisSubTab = 'single' | 'multi' | 'performance-pattern' | 'long-term-trend' | 'comparison' | 'information' | 'event' | 'user-defined';

interface AnalysisTabRefactoredProps {
  activeAction?: string;
  onNavigate?: (tab: string, action: string) => void;
}

export default function AnalysisTabRefactored({ activeAction, onNavigate }: AnalysisTabRefactoredProps) {
  const [activeSubTab, setActiveSubTab] = useState<AnalysisSubTab>('single');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelInitialTab, setPanelInitialTab] = useState<string>('details');
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const txs = generateTransactionHistory(200, 30);
    setTransactions(txs);
  }, []);

  // Generate chart data
  useEffect(() => {
    const generateData = () => {
      const data = [];
      const now = Date.now();
      for (let i = 0; i < 24; i++) {
        const time = new Date(now - (23 - i) * 60 * 60 * 1000);
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          cpu: Math.floor(Math.random() * 40) + 30,
          memory: Math.floor(Math.random() * 30) + 40,
          responseTime: Math.floor(Math.random() * 200) + 100,
          tps: Math.floor(Math.random() * 50) + 20,
          errorRate: (Math.random() * 2).toFixed(2),
        });
      }
      return data;
    };
    setChartData(generateData());
  }, []);

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Applied filters:', newFilters);
  };

  // Handle activeAction from context menu
  useEffect(() => {
    if (!activeAction) return;

    const storedTx = sessionStorage.getItem('selectedTransaction');
    if (!storedTx) return;

    try {
      const transaction = JSON.parse(storedTx);
      setSelectedTransaction(transaction);

      // Map actions to panel tabs
      const actionToTabMap: Record<string, string> = {
        'transaction-details': 'details',
        'timeline': 'timeline',
        'sql-queries': 'dbqueries',
        'bullet-view': 'trace',
        'java-source': 'source',
        'create-alert': 'alert',
      };

      const targetTab = actionToTabMap[activeAction] || 'details';
      setPanelInitialTab(targetTab);
      setIsPanelOpen(true);

      // Clear the stored transaction after opening
      sessionStorage.removeItem('selectedTransaction');
    } catch (error) {
      console.error('Failed to parse transaction from sessionStorage:', error);
    }
  }, [activeAction]);

  const subTabs = [
    { id: 'single' as AnalysisSubTab, label: 'Single', icon: Activity, description: 'Single transaction detailed analysis' },
    { id: 'multi' as AnalysisSubTab, label: 'Multi', icon: Layers, description: 'Multiple transaction comparison' },
    { id: 'performance-pattern' as AnalysisSubTab, label: 'Performance Pattern', icon: BarChart3, description: 'Performance pattern analysis' },
    { id: 'long-term-trend' as AnalysisSubTab, label: 'Long Term Trend', icon: TrendingUp, description: 'Long-term performance trends' },
    { id: 'comparison' as AnalysisSubTab, label: 'Comparison', icon: GitCompare, description: 'Compare transaction performance' },
    { id: 'information' as AnalysisSubTab, label: 'Information', icon: Info, description: 'Transaction information summary' },
    { id: 'event' as AnalysisSubTab, label: 'Event', icon: AlertCircle, description: 'Transaction event analysis' },
    { id: 'user-defined' as AnalysisSubTab, label: 'User Defined', icon: Settings, description: 'Custom analysis views' },
  ];

  const handleViewTrace = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPanelInitialTab('trace');
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedTransaction(null);
  };

  const renderSingleAnalysis = () => (
    <div className="space-y-4">
      {/* Performance Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ZoomableTimeSeriesChart
          title="CPU Usage (User+Sys %)"
          data={chartData}
          dataKeys={[{ key: 'cpu', name: 'CPU (%)', color: '#22c55e' }]}
          yAxisLabel="CPU %"
          chartType="area"
        />
        <ZoomableTimeSeriesChart
          title="Memory Used (%)"
          data={chartData}
          dataKeys={[{ key: 'memory', name: 'Memory (%)', color: '#3b82f6' }]}
          yAxisLabel="Memory %"
          chartType="area"
        />
        <ZoomableTimeSeriesChart
          title="Response Time (ms)"
          data={chartData}
          dataKeys={[{ key: 'responseTime', name: 'Response Time (ms)', color: '#f59e0b' }]}
          yAxisLabel="ms"
          chartType="line"
        />
        <ZoomableTimeSeriesChart
          title="TPS (Transactions Per Second)"
          data={chartData}
          dataKeys={[{ key: 'tps', name: 'TPS', color: '#8b5cf6' }]}
          yAxisLabel="TPS"
          chartType="area"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Single Transaction Analysis</CardTitle>
          <CardDescription>
            Select a transaction from the list below to view detailed analysis including call stack, timeline, resources, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionListTable
            transactions={transactions.slice(-100)}
            onNavigate={onNavigate}
            onViewTrace={handleViewTrace}
          />
        </CardContent>
      </Card>

      {/* Bullet View - Waterfall Chart */}
      {transactions.length > 0 && (
        <DistributedTraceView
          transaction={transactions[0]}
          onViewSource={(span) => {
            sessionStorage.setItem('selectedSpan', JSON.stringify(span));
            setSelectedTransaction(transactions[0]);
            setPanelInitialTab('source');
            setIsPanelOpen(true);
          }}
        />
      )}
    </div>
  );

  const renderMultiAnalysis = () => {
    const selectedTransactions = transactions.slice(0, 5);

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Multi Transaction Analysis</CardTitle>
            <CardDescription>
              Compare and analyze multiple transactions simultaneously to identify patterns and anomalies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Transaction Selection */}
            <div className="mb-4">
              <div className="text-sm font-semibold mb-2">Selected Transactions ({selectedTransactions.length})</div>
              <div className="space-y-2">
                {selectedTransactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">{idx + 1}</Badge>
                      <div>
                        <div className="font-mono text-xs">{tx.id}</div>
                        <div className="text-xs text-muted-foreground">{tx.endpoint}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-sm ${tx.responseTime > 500 ? 'text-red-400' : tx.responseTime > 200 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {tx.responseTime}ms
                      </span>
                      <Badge variant={tx.status === 'error' ? 'destructive' : 'default'}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-2">
                <Layers className="h-4 w-4 mr-2" />
                Select More Transactions
              </Button>
            </div>

            {/* Comparison Table */}
            <div>
              <div className="text-sm font-semibold mb-2">Performance Comparison</div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">#</th>
                      <th className="text-left p-3 font-medium">Endpoint</th>
                      <th className="text-right p-3 font-medium">Response Time</th>
                      <th className="text-right p-3 font-medium">SQL Queries</th>
                      <th className="text-right p-3 font-medium">HTTP Calls</th>
                      <th className="text-right p-3 font-medium">CPU Time</th>
                      <th className="text-right p-3 font-medium">Memory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransactions.map((tx, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/50">
                        <td className="p-3 font-mono">{idx + 1}</td>
                        <td className="p-3 font-mono text-xs">{tx.endpoint}</td>
                        <td className={`p-3 text-right font-mono ${tx.responseTime > 500 ? 'text-red-400' : tx.responseTime > 200 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {tx.responseTime}ms
                        </td>
                        <td className="p-3 text-right font-mono">{Math.floor(Math.random() * 10) + 1}</td>
                        <td className="p-3 text-right font-mono">{Math.floor(Math.random() * 5)}</td>
                        <td className="p-3 text-right font-mono">{Math.floor(tx.responseTime * 0.7)}ms</td>
                        <td className="p-3 text-right font-mono">{(Math.random() * 50 + 10).toFixed(1)}MB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Common Patterns Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Similar SQL Query Pattern</div>
                  <div className="text-xs text-muted-foreground">All transactions execute SELECT queries on users table</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded border border-orange-500/20">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Performance Variation</div>
                  <div className="text-xs text-muted-foreground">Response time varies by 300ms - may indicate inconsistent load</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPerformancePattern = () => {
    const patterns = [
      { name: 'Normal Load', percentage: 85, color: 'blue', description: 'Standard transaction processing', avgTime: 180, count: 28500 },
      { name: 'Slow Query Pattern', percentage: 12, color: 'orange', description: 'Database query optimization needed', avgTime: 850, count: 4020 },
      { name: 'High Memory Usage', percentage: 3, color: 'red', description: 'Memory leak suspected', avgTime: 320, count: 1005 },
    ];

    const timeDistribution = [
      { range: '0-100ms', count: 12400, percentage: 37 },
      { range: '100-200ms', count: 10200, percentage: 30.5 },
      { range: '200-300ms', count: 5800, percentage: 17.3 },
      { range: '300-500ms', count: 3200, percentage: 9.5 },
      { range: '500-1000ms', count: 1400, percentage: 4.2 },
      { range: '>1000ms', count: 525, percentage: 1.5 },
    ];

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Performance Pattern Analysis</CardTitle>
            <CardDescription>
              Identify recurring performance patterns and anomalies across transaction data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {patterns.map((pattern, idx) => (
                <Card key={idx} className={`border-l-4 border-l-${pattern.color}-500`}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">{pattern.name}</div>
                        <Badge variant={pattern.color === 'red' ? 'destructive' : pattern.color === 'orange' ? 'secondary' : 'default'}>
                          {pattern.percentage}%
                        </Badge>
                      </div>
                      <div className="text-xl font-bold">{pattern.count.toLocaleString()} TX</div>
                      <div className="text-xs text-muted-foreground">{pattern.description}</div>
                      <div className="text-sm font-semibold mt-2">Avg: {pattern.avgTime}ms</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
            <CardDescription>Transaction count by response time range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeDistribution.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">{item.range}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.count.toLocaleString()}</span>
                      <span className="text-muted-foreground">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${idx === 0 ? 'bg-green-500' : idx < 3 ? 'bg-blue-500' : idx < 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detected Anomalies (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { time: '14:32', endpoint: '/api/orders/process', issue: 'Response time spike', severity: 'high', duration: '450ms → 1200ms' },
                { time: '12:18', endpoint: '/api/users/search', issue: 'Slow SQL query', severity: 'medium', duration: 'Query took 850ms' },
                { time: '09:45', endpoint: '/api/products/list', issue: 'High memory usage', severity: 'medium', duration: 'Memory: 450MB' },
              ].map((anomaly, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${anomaly.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{anomaly.issue}</span>
                      <span className="text-xs text-muted-foreground">{anomaly.time}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{anomaly.endpoint}</div>
                    <div className="text-xs text-orange-400">{anomaly.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderLongTermTrend = () => {
    const trendData = [
      { period: 'Week 1', avgResponse: 220, tps: 145, errorRate: 0.9, transactions: 2850000 },
      { period: 'Week 2', avgResponse: 235, tps: 152, errorRate: 1.1, transactions: 3020000 },
      { period: 'Week 3', avgResponse: 280, tps: 168, errorRate: 1.4, transactions: 3350000 },
      { period: 'Week 4', avgResponse: 245, tps: 156, errorRate: 0.8, transactions: 3120000 },
    ];

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Long Term Trend Analysis</CardTitle>
            <CardDescription>
              Analyze performance trends over extended periods to identify long-term patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">30 Day Avg Response</div>
                  <div className="text-2xl font-bold">245ms</div>
                  <div className="text-xs text-green-500">↓ 12% vs previous period</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">30 Day Error Rate</div>
                  <div className="text-2xl font-bold">0.8%</div>
                  <div className="text-xs text-green-500">↓ 0.3% vs previous period</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">30 Day Total TX</div>
                  <div className="text-2xl font-bold">12.5M</div>
                  <div className="text-xs text-blue-500">↑ 8% vs previous period</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Avg TPS</div>
                  <div className="text-2xl font-bold">156.2</div>
                  <div className="text-xs text-green-500">↑ 5.2% vs previous period</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend Table */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Period</th>
                    <th className="text-right p-3 font-medium">Transactions</th>
                    <th className="text-right p-3 font-medium">Avg TPS</th>
                    <th className="text-right p-3 font-medium">Avg Response (ms)</th>
                    <th className="text-right p-3 font-medium">Error Rate (%)</th>
                    <th className="text-right p-3 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((row, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-semibold">{row.period}</td>
                      <td className="p-3 text-right font-mono">{row.transactions.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono">{row.tps}</td>
                      <td className={`p-3 text-right font-mono ${row.avgResponse > 250 ? 'text-orange-400' : 'text-green-400'}`}>
                        {row.avgResponse}
                      </td>
                      <td className={`p-3 text-right font-mono ${row.errorRate > 1 ? 'text-orange-400' : 'text-green-400'}`}>
                        {row.errorRate.toFixed(1)}
                      </td>
                      <td className="p-3 text-right">
                        {idx === trendData.length - 1 ? (
                          <Badge variant="default" className="bg-green-500">Improving</Badge>
                        ) : idx === 2 ? (
                          <Badge variant="destructive">Degrading</Badge>
                        ) : (
                          <Badge variant="secondary">Stable</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Trend Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded border border-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Positive Trend: Performance Recovery</div>
                  <div className="text-xs text-muted-foreground">Response time improved by 12% in Week 4 after optimization efforts</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                <Activity className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Steady Growth: Transaction Volume</div>
                  <div className="text-xs text-muted-foreground">Transaction volume increased steadily, +18% over 30 days</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded border border-orange-500/20">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Watch: Error Rate Fluctuation</div>
                  <div className="text-xs text-muted-foreground">Error rate peaked in Week 3 at 1.4% - monitor for recurring patterns</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderComparison = () => {
    const comparisonData = [
      { metric: 'Total Transactions', periodA: '285,400', periodB: '312,850', diff: '+9.6%', better: 'B' },
      { metric: 'Avg Response Time', periodA: '245ms', periodB: '198ms', diff: '-19.2%', better: 'B' },
      { metric: 'P95 Response Time', periodA: '850ms', periodB: '680ms', diff: '-20.0%', better: 'B' },
      { metric: 'P99 Response Time', periodA: '1,450ms', periodB: '1,120ms', diff: '-22.8%', better: 'B' },
      { metric: 'Error Rate', periodA: '1.2%', periodB: '0.8%', diff: '-33.3%', better: 'B' },
      { metric: 'Avg TPS', periodA: '145.2', periodB: '158.7', diff: '+9.3%', better: 'B' },
      { metric: 'Peak TPS', periodA: '385', periodB: '420', diff: '+9.1%', better: 'B' },
      { metric: 'CPU Usage', periodA: '58%', periodB: '52%', diff: '-10.3%', better: 'B' },
      { metric: 'Memory Usage', periodA: '72%', periodB: '68%', diff: '-5.6%', better: 'B' },
    ];

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Performance Comparison</CardTitle>
            <CardDescription>
              Compare transaction performance across different time periods, endpoints, or configurations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Period Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Period A (Baseline)</div>
                    <div className="font-semibold">Nov 1-7, 2024</div>
                    <div className="text-xs text-muted-foreground">Before optimization</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Period B (Comparison)</div>
                    <div className="font-semibold">Nov 8-14, 2024</div>
                    <div className="text-xs text-muted-foreground">After optimization</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Metric</th>
                    <th className="text-right p-3 font-medium">Period A</th>
                    <th className="text-right p-3 font-medium">Period B</th>
                    <th className="text-right p-3 font-medium">Difference</th>
                    <th className="text-center p-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-semibold">{row.metric}</td>
                      <td className="p-3 text-right font-mono">{row.periodA}</td>
                      <td className="p-3 text-right font-mono font-semibold">{row.periodB}</td>
                      <td className={`p-3 text-right font-mono ${row.better === 'B' ? 'text-green-400' : 'text-orange-400'}`}>
                        {row.diff}
                      </td>
                      <td className="p-3 text-center">
                        {row.better === 'B' ? (
                          <Badge variant="default" className="bg-green-500">Improved</Badge>
                        ) : (
                          <Badge variant="secondary">Same</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Improved Metrics</div>
                    <div className="text-3xl font-bold text-green-500">9</div>
                    <div className="text-xs text-muted-foreground">Out of 9 total metrics</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Avg Improvement</div>
                    <div className="text-3xl font-bold text-blue-500">15.4%</div>
                    <div className="text-xs text-muted-foreground">Across all metrics</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Best Improvement</div>
                    <div className="text-3xl font-bold text-purple-500">33.3%</div>
                    <div className="text-xs text-muted-foreground">Error Rate reduction</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 p-4 bg-green-500/10 rounded border border-green-500/20">
              <div className="flex items-start gap-3">
                <GitCompare className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-green-500">Overall Assessment: Significant Improvement</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Period B shows marked improvements across all key performance metrics. Optimization efforts were highly effective,
                    with particular success in reducing error rate (-33.3%) and response times (-19.2% avg, -20-22% for P95/P99).
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInformation = () => (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Information Summary</CardTitle>
        <CardDescription>
          Comprehensive information about transaction processing and system health.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold">Transaction Statistics</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Transactions (24h):</span>
                  <span className="font-mono font-semibold">425,380</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unique Endpoints:</span>
                  <span className="font-mono font-semibold">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average TPS:</span>
                  <span className="font-mono font-semibold">156.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak TPS:</span>
                  <span className="font-mono font-semibold">420.5</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">System Health</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Applications:</span>
                  <span className="font-mono font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Agents:</span>
                  <span className="font-mono font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg CPU Usage:</span>
                  <span className="font-mono font-semibold">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Memory Usage:</span>
                  <span className="font-mono font-semibold">68%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm font-semibold mb-2">Top 5 Slowest Endpoints (24h)</div>
            <div className="space-y-1">
              {[
                { endpoint: '/api/orders/process', avgTime: 1250 },
                { endpoint: '/api/payments/authorize', avgTime: 980 },
                { endpoint: '/api/users/search', avgTime: 750 },
                { endpoint: '/api/inventory/update', avgTime: 620 },
                { endpoint: '/api/reports/generate', avgTime: 580 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-1 px-2 bg-muted/50 rounded">
                  <span className="font-mono text-xs">{item.endpoint}</span>
                  <span className="font-semibold text-orange-400">{item.avgTime}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEvent = () => {
    const events = [
      { id: 1, time: '15:42:33', level: 5, type: 'Error', message: 'Database connection timeout', transaction: '/api/orders/create', agent: 'demo-8103' },
      { id: 2, time: '15:38:12', level: 4, type: 'Warning', message: 'Slow query detected (>500ms)', transaction: '/api/users/search', agent: 'demo-8102' },
      { id: 3, time: '15:22:45', level: 5, type: 'Error', message: 'NullPointerException in OrderService', transaction: '/api/orders/process', agent: 'demo-8101' },
      { id: 4, time: '14:58:20', level: 3, type: 'Info', message: 'High memory usage (>80%)', transaction: '/api/products/list', agent: 'demo-8104' },
      { id: 5, time: '14:32:10', level: 4, type: 'Warning', message: 'Response time spike detected', transaction: '/api/payments/authorize', agent: 'demo-8103' },
      { id: 6, time: '13:45:55', level: 5, type: 'Error', message: 'HTTP 500: Internal Server Error', transaction: '/api/cart/update', agent: 'demo-8102' },
      { id: 7, time: '12:18:33', level: 2, type: 'Debug', message: 'Cache miss - rebuilding', transaction: '/api/products/search', agent: 'demo-8104' },
      { id: 8, time: '11:52:15', level: 4, type: 'Warning', message: 'Thread pool exhaustion', transaction: '/api/reports/generate', agent: 'demo-8101' },
    ];

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Event Analysis</CardTitle>
            <CardDescription>
              Monitor and analyze transaction-related events and alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Event Summary */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[
                { level: 'Level 1', count: 0, color: 'bg-blue-500', label: 'Info' },
                { level: 'Level 2', count: 1, color: 'bg-cyan-500', label: 'Debug' },
                { level: 'Level 3', count: 1, color: 'bg-yellow-500', label: 'Notice' },
                { level: 'Level 4', count: 3, color: 'bg-orange-500', label: 'Warning' },
                { level: 'Level 5', count: 3, color: 'bg-red-500', label: 'Error' },
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <div className="text-xs text-muted-foreground">{item.level}</div>
                    </div>
                    <div className="text-2xl font-bold">{item.count}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Event List */}
            <div>
              <div className="text-sm font-semibold mb-2">Recent Events (Last 4 hours)</div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Time</th>
                      <th className="text-left p-3 font-medium">Level</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Message</th>
                      <th className="text-left p-3 font-medium">Transaction</th>
                      <th className="text-left p-3 font-medium">Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-t hover:bg-muted/50">
                        <td className="p-3 font-mono text-xs">{event.time}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${event.level === 5 ? 'bg-red-500' :
                                event.level === 4 ? 'bg-orange-500' :
                                  event.level === 3 ? 'bg-yellow-500' :
                                    event.level === 2 ? 'bg-cyan-500' :
                                      'bg-blue-500'
                              }`} />
                            <span className="font-mono text-xs">{event.level}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={event.type === 'Error' ? 'destructive' : event.type === 'Warning' ? 'secondary' : 'outline'}>
                            {event.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs">{event.message}</td>
                        <td className="p-3 font-mono text-xs">{event.transaction}</td>
                        <td className="p-3 font-mono text-xs">{event.agent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Common Event Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { pattern: 'Database Timeout', occurrences: 3, severity: 'high', trend: 'increasing' },
                { pattern: 'Slow Query', occurrences: 5, severity: 'medium', trend: 'stable' },
                { pattern: 'Memory Warning', occurrences: 2, severity: 'medium', trend: 'decreasing' },
              ].map((pattern, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${pattern.severity === 'high' ? 'bg-red-500' : 'bg-orange-500'}`} />
                    <div>
                      <div className="text-sm font-semibold">{pattern.pattern}</div>
                      <div className="text-xs text-muted-foreground">{pattern.occurrences} occurrences in last 4h</div>
                    </div>
                  </div>
                  <Badge variant={pattern.trend === 'increasing' ? 'destructive' : pattern.trend === 'decreasing' ? 'default' : 'secondary'}>
                    {pattern.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUserDefined = () => {
    const savedViews = [
      { id: 1, name: 'Payment API Analysis', description: 'Custom view for payment transaction analysis', created: '2024-11-03', widgets: 5 },
      { id: 2, name: 'Error Investigation Dashboard', description: 'Focus on error tracking and root cause', created: '2024-10-28', widgets: 7 },
      { id: 3, name: 'Performance Optimization', description: 'Track optimization efforts and improvements', created: '2024-10-15', widgets: 6 },
    ];

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Defined Analysis Views</CardTitle>
                <CardDescription>
                  Create custom analysis views and dashboards tailored to your needs.
                </CardDescription>
              </div>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Create New View
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedViews.map((view) => (
                <Card key={view.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{view.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{view.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px]">{view.widgets} widgets</Badge>
                        </div>
                        <div>Created: {view.created}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                        <Button size="sm" className="flex-1">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Widgets */}
        <Card>
          <CardHeader>
            <CardTitle>Available Widgets</CardTitle>
            <CardDescription>Drag and drop widgets to create your custom view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: 'Transaction List', icon: Activity },
                { name: 'Performance Chart', icon: TrendingUp },
                { name: 'Error Summary', icon: AlertCircle },
                { name: 'Resource Usage', icon: BarChart3 },
                { name: 'SQL Query List', icon: Info },
                { name: 'Call Stack View', icon: Layers },
                { name: 'Timeline View', icon: Activity },
                { name: 'Comparison Table', icon: GitCompare },
              ].map((widget, idx) => (
                <Card key={idx} className="cursor-move hover:border-primary transition-colors">
                  <CardContent className="pt-4 pb-3">
                    <div className="text-center space-y-1">
                      <widget.icon className="h-6 w-6 mx-auto text-muted-foreground" />
                      <div className="text-xs font-semibold">{widget.name}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSubTab) {
      case 'single':
        return renderSingleAnalysis();
      case 'multi':
        return renderMultiAnalysis();
      case 'performance-pattern':
        return renderPerformancePattern();
      case 'long-term-trend':
        return renderLongTermTrend();
      case 'comparison':
        return renderComparison();
      case 'information':
        return renderInformation();
      case 'event':
        return renderEvent();
      case 'user-defined':
        return renderUserDefined();
      default:
        return renderSingleAnalysis();
    }
  };

  return (
    <>
      <div className="flex h-[calc(100vh-180px)]">
        {/* Filter Sidebar */}
        <FilterSidebar onApplyFilters={handleApplyFilters} />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4 space-y-4">
            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-2">
              {subTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeSubTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveSubTab(tab.id)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Active Tab Description */}
            <div className="bg-muted/30 px-4 py-2 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {subTabs.find(t => t.id === activeSubTab)?.description}
              </p>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </div>
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

