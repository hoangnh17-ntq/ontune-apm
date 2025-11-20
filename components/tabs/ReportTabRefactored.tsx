'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  BarChart3,
  Activity,
  Settings,
  Mail,
  Download,
  Calendar
} from 'lucide-react';
import FilterSidebar, { FilterState } from '@/components/ui/FilterSidebar';
import ZoomableTimeSeriesChart from '@/components/charts/ZoomableTimeSeriesChart';

type ReportSubTab = 'summary' | 'performance' | 'event' | 'perf-trend' | 'perf-analysis' | 'user-defined' | 'mailing';

interface ReportTabRefactoredProps {
  activeAction?: string;
}

export default function ReportTabRefactored({ activeAction }: ReportTabRefactoredProps) {
  const [activeSubTab, setActiveSubTab] = useState<ReportSubTab>('summary');
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

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
    // Here you would typically fetch new data based on filters
    console.log('Applied filters:', newFilters);
  };

  const subTabs = [
    { id: 'summary' as ReportSubTab, label: 'Summary Report', icon: FileText, description: 'Overall system performance summary' },
    { id: 'performance' as ReportSubTab, label: 'Performance Report', icon: BarChart3, description: 'Detailed performance metrics' },
    { id: 'event' as ReportSubTab, label: 'Event Report', icon: AlertCircle, description: 'System events and alerts' },
    { id: 'perf-trend' as ReportSubTab, label: 'Performance Trend Analysis', icon: TrendingUp, description: 'Performance trend over time' },
    { id: 'perf-analysis' as ReportSubTab, label: 'Performance Analysis', icon: Activity, description: 'In-depth performance analysis' },
    { id: 'user-defined' as ReportSubTab, label: 'User Defined', icon: Settings, description: 'Custom report templates' },
    { id: 'mailing' as ReportSubTab, label: 'Mailing', icon: Mail, description: 'Scheduled report delivery' },
  ];

  const renderSummaryReport = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Summary Report</CardTitle>
            <CardDescription>Overall system performance summary with key metrics</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Select Period
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats Table */}
          <div>
            <div className="text-sm font-semibold mb-3">Performance Overview</div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Application</th>
                    <th className="text-right p-3 font-medium">Total TX</th>
                    <th className="text-right p-3 font-medium">Avg Response (ms)</th>
                    <th className="text-right p-3 font-medium">Error Rate</th>
                    <th className="text-right p-3 font-medium">CPU Usage (%)</th>
                    <th className="text-right p-3 font-medium">Memory (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { app: 'demo-8101', tx: 12450, resp: 245, error: 0.2, cpu: 42, mem: 65 },
                    { app: 'demo-8102', tx: 45200, resp: 180, error: 0.1, cpu: 38, mem: 58 },
                    { app: 'demo-8103', tx: 32800, resp: 520, error: 2.5, cpu: 75, mem: 82 },
                    { app: 'demo-8104', tx: 156050, resp: 125, error: 0.3, cpu: 52, mem: 68 },
                    { app: 'demo-8105', tx: 89300, resp: 95, error: 0.5, cpu: 28, mem: 45 },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-mono font-semibold">{row.app}</td>
                      <td className="p-3 text-right font-mono">{row.tx.toLocaleString()}</td>
                      <td className={`p-3 text-right font-mono ${row.resp > 500 ? 'text-red-400' : row.resp > 200 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {row.resp}
                      </td>
                      <td className={`p-3 text-right font-mono ${row.error > 1 ? 'text-red-400' : 'text-green-400'}`}>
                        {row.error.toFixed(1)}%
                      </td>
                      <td className={`p-3 text-right font-mono ${row.cpu > 70 ? 'text-red-400' : row.cpu > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {row.cpu}
                      </td>
                      <td className={`p-3 text-right font-mono ${row.mem > 80 ? 'text-red-400' : row.mem > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {row.mem}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Findings */}
          <div>
            <div className="text-sm font-semibold mb-3">Key Findings</div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500/10 p-2 rounded">
                      <Activity className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">Overall Performance: Good</div>
                      <div className="text-xs text-muted-foreground">
                        4 out of 5 applications performing within normal parameters
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-500/10 p-2 rounded">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">Attention Required</div>
                      <div className="text-xs text-muted-foreground">
                        demo-8103 showing elevated response time and error rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPerformanceReport = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Report</CardTitle>
            <CardDescription>Detailed performance metrics and analysis</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Select Period
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div>
            <div className="text-sm font-semibold mb-3">Transaction Performance Metrics</div>
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground mb-1">Total Transactions</div>
                  <div className="text-2xl font-bold">335.8k</div>
                  <div className="text-xs text-green-500 mt-1">↑ 8.2% from last period</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground mb-1">Avg Response Time</div>
                  <div className="text-2xl font-bold">233ms</div>
                  <div className="text-xs text-green-500 mt-1">↓ 12% from last period</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground mb-1">P95 Response Time</div>
                  <div className="text-2xl font-bold">850ms</div>
                  <div className="text-xs text-yellow-500 mt-1">↑ 5% from last period</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground mb-1">Error Rate</div>
                  <div className="text-2xl font-bold">0.72%</div>
                  <div className="text-xs text-green-500 mt-1">↓ 0.3% from last period</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div>
            <div className="text-sm font-semibold mb-3">Performance by Endpoint</div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Endpoint</th>
                    <th className="text-right p-3 font-medium">Calls</th>
                    <th className="text-right p-3 font-medium">Avg (ms)</th>
                    <th className="text-right p-3 font-medium">P95 (ms)</th>
                    <th className="text-right p-3 font-medium">P99 (ms)</th>
                    <th className="text-right p-3 font-medium">Error %</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { endpoint: '/api/users', calls: 125420, avg: 85, p95: 180, p99: 320, error: 0.1 },
                    { endpoint: '/api/orders', calls: 89300, avg: 245, p95: 520, p99: 880, error: 0.3 },
                    { endpoint: '/api/products', calls: 67200, avg: 120, p95: 280, p99: 450, error: 0.2 },
                    { endpoint: '/api/payments', calls: 32100, avg: 620, p95: 1250, p99: 2100, error: 1.5 },
                    { endpoint: '/api/search', calls: 21880, avg: 380, p95: 780, p99: 1200, error: 0.8 },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{row.endpoint}</td>
                      <td className="p-3 text-right font-mono">{row.calls.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono">{row.avg}</td>
                      <td className="p-3 text-right font-mono">{row.p95}</td>
                      <td className="p-3 text-right font-mono">{row.p99}</td>
                      <td className={`p-3 text-right font-mono ${row.error > 1 ? 'text-red-400' : 'text-green-400'}`}>
                        {row.error.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEventReport = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Event Report</CardTitle>
            <CardDescription>System events, alerts, and error analysis</CardDescription>
          </div>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Event Statistics */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { level: 'Level 1', count: 0, color: 'bg-blue-500' },
              { level: 'Level 2', count: 0, color: 'bg-cyan-500' },
              { level: 'Level 3', count: 0, color: 'bg-yellow-500' },
              { level: 'Level 4', count: 0, color: 'bg-orange-500' },
              { level: 'Level 5', count: 0, color: 'bg-red-500' },
            ].map((item, idx) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <div className="text-xs text-muted-foreground">{item.level}</div>
                  </div>
                  <div className="text-2xl font-bold">{item.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center text-muted-foreground py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events recorded in the selected period</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPerfTrendAnalysis = () => {
    const trendData = Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      transactions: Math.floor(280000 + Math.random() * 50000),
      avgResponse: Math.floor(180 + Math.random() * 80),
      errorRate: (Math.random() * 1.5).toFixed(2),
      tps: Math.floor(140 + Math.random() * 30),
    }));

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Trend Analysis</CardTitle>
              <CardDescription>Long-term performance trend visualization and insights</CardDescription>
            </div>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Trend Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Trend Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground mb-1">30-Day Avg Response</div>
                  <div className="text-2xl font-bold">225ms</div>
                  <div className="text-xs text-green-500 mt-1">↓ 8.5% from previous</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground mb-1">30-Day Total TX</div>
                  <div className="text-2xl font-bold">9.2M</div>
                  <div className="text-xs text-blue-500 mt-1">↑ 12.3% from previous</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground mb-1">30-Day Error Rate</div>
                  <div className="text-2xl font-bold">0.75%</div>
                  <div className="text-xs text-green-500 mt-1">↓ 0.25% from previous</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground mb-1">30-Day Avg TPS</div>
                  <div className="text-2xl font-bold">155</div>
                  <div className="text-xs text-green-500 mt-1">↑ 6.2% from previous</div>
                </CardContent>
              </Card>
            </div>

            {/* Trend Insights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold">Positive Trends</div>
                {[
                  { metric: 'Response Time', improvement: '8.5%', icon: '↓' },
                  { metric: 'TPS Growth', improvement: '6.2%', icon: '↑' },
                  { metric: 'Error Reduction', improvement: '25%', icon: '↓' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                    <span className="text-sm">{item.metric}</span>
                    <Badge className="bg-green-500">{item.icon} {item.improvement}</Badge>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Areas to Monitor</div>
                {[
                  { metric: 'Peak Load Handling', concern: 'Occasional spikes', severity: 'medium' },
                  { metric: 'Memory Usage', concern: 'Gradual increase', severity: 'low' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-orange-500/10 rounded">
                    <span className="text-sm">{item.metric}</span>
                    <Badge variant="secondary">{item.concern}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts with Zoom/Brush */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ZoomableTimeSeriesChart
                title="CPU Usage Trend"
                data={chartData}
                dataKeys={[{ key: 'cpu', name: 'CPU (%)', color: '#22c55e' }]}
                yAxisLabel="CPU %"
                chartType="area"
              />
              <ZoomableTimeSeriesChart
                title="Memory Usage Trend"
                data={chartData}
                dataKeys={[{ key: 'memory', name: 'Memory (%)', color: '#3b82f6' }]}
                yAxisLabel="Memory %"
                chartType="area"
              />
              <ZoomableTimeSeriesChart
                title="Response Time Trend"
                data={chartData}
                dataKeys={[{ key: 'responseTime', name: 'Response Time (ms)', color: '#f59e0b' }]}
                yAxisLabel="ms"
                chartType="line"
              />
              <ZoomableTimeSeriesChart
                title="TPS Trend"
                data={chartData}
                dataKeys={[{ key: 'tps', name: 'TPS', color: '#8b5cf6' }]}
                yAxisLabel="TPS"
                chartType="area"
              />
            </div>

            {/* Daily Trend Table */}
            <div>
              <div className="text-sm font-semibold mb-2">Daily Performance Trend (Last 30 Days)</div>
              <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium">Day</th>
                      <th className="text-right p-3 font-medium">Transactions</th>
                      <th className="text-right p-3 font-medium">Avg Response</th>
                      <th className="text-right p-3 font-medium">TPS</th>
                      <th className="text-right p-3 font-medium">Error Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/50">
                        <td className="p-3 font-semibold">{row.day}</td>
                        <td className="p-3 text-right font-mono">{row.transactions.toLocaleString()}</td>
                        <td className={`p-3 text-right font-mono ${row.avgResponse > 250 ? 'text-orange-400' : 'text-green-400'}`}>
                          {row.avgResponse}ms
                        </td>
                        <td className="p-3 text-right font-mono">{row.tps}</td>
                        <td className={`p-3 text-right font-mono ${Number(row.errorRate) > 1 ? 'text-orange-400' : 'text-green-400'}`}>
                          {row.errorRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPerfAnalysis = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>In-depth performance analysis and diagnostics with root cause identification</CardDescription>
            </div>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Performance Score */}
            <div className="grid grid-cols-5 gap-3">
              {[
                { metric: 'Overall Score', value: 85, color: 'green', status: 'Good' },
                { metric: 'Response Time', value: 78, color: 'yellow', status: 'Fair' },
                { metric: 'Throughput', value: 92, color: 'green', status: 'Excellent' },
                { metric: 'Error Rate', value: 88, color: 'green', status: 'Good' },
                { metric: 'Resource Usage', value: 75, color: 'yellow', status: 'Fair' },
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">{item.metric}</div>
                      <div className={`text-3xl font-bold ${item.color === 'green' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {item.value}
                      </div>
                      <Badge variant={item.color === 'green' ? 'default' : 'secondary'}>{item.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Root Cause Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Root Cause Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      issue: 'Slow Database Queries', 
                      impact: 'High', 
                      affected: '12% of transactions', 
                      rootCause: 'Missing indexes on users table', 
                      recommendation: 'Add composite index on (user_id, created_at)'
                    },
                    { 
                      issue: 'Memory Pressure', 
                      impact: 'Medium', 
                      affected: '8% of requests', 
                      rootCause: 'Large object allocations in OrderService', 
                      recommendation: 'Implement object pooling for frequently used objects'
                    },
                    { 
                      issue: 'Thread Pool Saturation', 
                      impact: 'Low', 
                      affected: '3% during peak hours', 
                      rootCause: 'Insufficient thread pool size', 
                      recommendation: 'Increase core pool size from 50 to 80'
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold">{item.issue}</div>
                        <Badge variant={item.impact === 'High' ? 'destructive' : item.impact === 'Medium' ? 'secondary' : 'outline'}>
                          {item.impact} Impact
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-[100px]">Affected:</span>
                          <span>{item.affected}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-[100px]">Root Cause:</span>
                          <span>{item.rootCause}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-[100px]">Recommendation:</span>
                          <span className="text-blue-400">{item.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Bottlenecks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performance Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Component</th>
                        <th className="text-left p-3 font-medium">Bottleneck</th>
                        <th className="text-right p-3 font-medium">Avg Time</th>
                        <th className="text-right p-3 font-medium">% of Total</th>
                        <th className="text-center p-3 font-medium">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { component: 'Database', bottleneck: 'Query Execution', time: '285ms', percent: '42%', priority: 'High' },
                        { component: 'External API', bottleneck: 'Payment Gateway', time: '180ms', percent: '28%', priority: 'Medium' },
                        { component: 'Application', bottleneck: 'Business Logic', time: '120ms', percent: '18%', priority: 'Low' },
                        { component: 'Network', bottleneck: 'Data Transfer', time: '80ms', percent: '12%', priority: 'Low' },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-t hover:bg-muted/50">
                          <td className="p-3 font-semibold">{row.component}</td>
                          <td className="p-3">{row.bottleneck}</td>
                          <td className="p-3 text-right font-mono text-orange-400">{row.time}</td>
                          <td className="p-3 text-right font-mono">{row.percent}</td>
                          <td className="p-3 text-center">
                            <Badge variant={row.priority === 'High' ? 'destructive' : row.priority === 'Medium' ? 'secondary' : 'outline'}>
                              {row.priority}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderUserDefined = () => {
    const savedTemplates = [
      { id: 1, name: 'Weekly Executive Summary', type: 'Email', schedule: 'Weekly', lastRun: '2024-11-04' },
      { id: 2, name: 'Daily Operations Report', type: 'PDF', schedule: 'Daily', lastRun: '2024-11-05' },
      { id: 3, name: 'Monthly SLA Report', type: 'Excel', schedule: 'Monthly', lastRun: '2024-11-01' },
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Defined Reports</CardTitle>
              <CardDescription>Custom report templates and configurations</CardDescription>
            </div>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Saved Templates */}
            <div>
              <div className="text-sm font-semibold mb-3">Saved Report Templates</div>
              <div className="space-y-2">
                {savedTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-semibold">{template.name}</div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Type: {template.type}</span>
                            <span>•</span>
                            <span>Schedule: {template.schedule}</span>
                            <span>•</span>
                            <span>Last Run: {template.lastRun}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm">Generate</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Template Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Report Builder Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Summary Table', icon: BarChart3 },
                    { name: 'Performance Chart', icon: TrendingUp },
                    { name: 'Event List', icon: AlertCircle },
                    { name: 'Transaction Table', icon: Activity },
                    { name: 'Error Summary', icon: AlertCircle },
                    { name: 'Resource Usage', icon: Activity },
                    { name: 'Comparison View', icon: BarChart3 },
                    { name: 'Custom Metrics', icon: Settings },
                  ].map((component, idx) => (
                    <Card key={idx} className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="pt-4 pb-3">
                        <div className="text-center space-y-1">
                          <component.icon className="h-6 w-6 mx-auto text-muted-foreground" />
                          <div className="text-xs font-semibold">{component.name}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeSubTab) {
      case 'summary':
        return renderSummaryReport();
      case 'performance':
        return renderPerformanceReport();
      case 'event':
        return renderEventReport();
      case 'perf-trend':
        return renderPerfTrendAnalysis();
      case 'perf-analysis':
        return renderPerfAnalysis();
      case 'user-defined':
        return renderUserDefined();
      case 'mailing':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Report Mailing</CardTitle>
              <CardDescription>Configure scheduled report delivery via email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-3">Scheduled Reports</div>
                  <div className="space-y-2">
                    {[
                      { name: 'Daily Summary', schedule: 'Daily at 00:00', recipients: 'admin@ontune.com', enabled: true },
                      { name: 'Weekly Performance', schedule: 'Weekly on Monday', recipients: 'team@ontune.com', enabled: true },
                      { name: 'Monthly SLA Report', schedule: 'Monthly on 1st', recipients: 'management@ontune.com', enabled: false },
                    ].map((report, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-semibold">{report.name}</div>
                              <div className="text-xs text-muted-foreground">{report.schedule}</div>
                              <div className="text-xs">📧 {report.recipients}</div>
                            </div>
                            <Badge variant={report.enabled ? 'default' : 'secondary'}>
                              {report.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Create New Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return renderSummaryReport();
    }
  };

  return (
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
  );
}

