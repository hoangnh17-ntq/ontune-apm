'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Clock, Zap, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ActiveTransactionSpeedChart from '@/components/charts/ActiveTransactionSpeedChart';
import HitmapScatterPlot from '@/components/charts/HitmapScatterPlot';
import TransactionListTable from '@/components/widgets/TransactionListTable';
import ActiveStatusTable from '@/components/widgets/ActiveStatusTable';
import TransactionDonutChart from '@/components/charts/TransactionDonutChart';
import TPSChart from '@/components/charts/TPSChart';
import SystemMetricChart from '@/components/charts/SystemMetricChart';
import ApdexGauge from '@/components/charts/ApdexGauge';
import MetricCard from '@/components/widgets/MetricCard';
import TodayVisitsChart from '@/components/charts/TodayVisitsChart';
import ConcurrentUsersChart from '@/components/charts/ConcurrentUsersChart';
import BrowserMetricsWidget from '@/components/widgets/BrowserMetricsWidget';
import { 
  generateTransactionHistory, 
  generateActiveStatus, 
  generateAPMMetrics,
  generateTransaction 
} from '@/lib/mockData';
import { Transaction, ActiveStatus, APMMetrics } from '@/types/apm';

interface MonitorTabProps {
  onNavigate?: (tab: string, action: string) => void;
  selectedApp?: string;
  selectedAgent?: string;
  activeFilters?: {
    methods?: string[];
    status?: string[];
  };
  onChartFilter?: (filterType: string, value: string) => void;
}

export default function MonitorTab({ 
  onNavigate, 
  selectedApp = 'demo-8104',
  selectedAgent = 'all',
  activeFilters = {},
  onChartFilter
}: MonitorTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeStatus, setActiveStatus] = useState<ActiveStatus[]>([]);
  const [metrics, setMetrics] = useState<APMMetrics | null>(null);
  const [tpsHistory, setTpsHistory] = useState<number[]>([]);
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);

  // Initialize data
  useEffect(() => {
    const initialTransactions = generateTransactionHistory(1000, 15); // Reduced for better performance
    setTransactions(initialTransactions);
    setActiveStatus(generateActiveStatus());
    setMetrics(generateAPMMetrics());
    setTpsHistory(Array.from({ length: 24 }, () => 100 + Math.random() * 80));
    setCpuHistory(Array.from({ length: 30 }, () => 40 + Math.random() * 40));
    setMemoryHistory(Array.from({ length: 30 }, () => 35 + Math.random() * 25));
  }, []);

  // Real-time updates - optimized interval
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate moderate number of transactions to balance visual effect and performance
      const newTransactions = Array.from({ length: 3 }, () => generateTransaction());
      setTransactions(prev => {
        const updated = [...prev, ...newTransactions];
        const now = Date.now();
        return updated.filter(tx => now - tx.timestamp <= 15 * 60 * 1000);
      });

      if (Math.random() > 0.7) {
        setActiveStatus(generateActiveStatus());
      }

      if (Math.random() > 0.5) {
        setMetrics(generateAPMMetrics());
      }

      setTpsHistory(prev => [...prev.slice(-23), 100 + Math.random() * 80]);
      
      if (Math.random() > 0.6) {
        setCpuHistory(prev => {
          const newCpu = Math.max(0, Math.min(100, prev[prev.length - 1] + (Math.random() - 0.5) * 10));
          return [...prev.slice(-29), newCpu];
        });
        setMemoryHistory(prev => {
          const newMem = Math.max(0, Math.min(80, prev[prev.length - 1] + (Math.random() - 0.5) * 5));
          return [...prev.slice(-29), newMem];
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading Monitor...</div>
      </div>
    );
  }

  const totalActive = activeStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-4">
      {/* Compact Top Metrics - Always Visible */}
      <div className="grid grid-cols-6 gap-3">
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Active TX</div>
              <div className="text-xl font-bold text-blue-500">{totalActive}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">TPS</div>
              <div className="text-xl font-bold text-green-500">{metrics.tps.toFixed(0)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Resp Time</div>
              <div className="text-xl font-bold text-yellow-500">{metrics.avgResponseTime.toFixed(0)}ms</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Error Rate</div>
              <div className="text-xl font-bold text-red-500">{metrics.errorRate.toFixed(2)}%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">CPU</div>
              <div className="text-xl font-bold text-purple-500">{cpuHistory[cpuHistory.length - 1]?.toFixed(0) || 0}%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Memory</div>
              <div className="text-xl font-bold text-orange-500">{memoryHistory[memoryHistory.length - 1]?.toFixed(0) || 0}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Transaction Speed - Real-time Processing Visualization */}
      <ActiveTransactionSpeedChart transactions={transactions} />

      {/* Main X-View / Hitmap - Large Center Focus */}
      <HitmapScatterPlot transactions={transactions} onNavigate={onNavigate} />

      {/* Active Transaction Table - Real-time List */}
      <TransactionListTable 
        transactions={transactions.slice(-50)} 
        onNavigate={onNavigate} 
      />

      {/* Browser Monitoring & User Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayVisitsChart />
        <ConcurrentUsersChart />
      </div>

      <BrowserMetricsWidget />

      {/* Active Status & TPS */}
      <div className="grid grid-cols-3 gap-6">
        <ActiveStatusTable activeStatus={activeStatus} />
        <TransactionDonutChart 
          activeStatus={activeStatus} 
          totalActive={totalActive}
          activeFilters={activeFilters.status || []}
          onFilter={(category) => onChartFilter?.('status', category)}
        />
        <TPSChart data={tpsHistory} title="TPS" height={200} />
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <ApdexGauge value={metrics.apdex} />
        <SystemMetricChart
          title="System CPU"
          data={cpuHistory}
          unit="%"
          maxValue={100}
          color="rgba(249, 115, 22, 1)"
          height={180}
        />
        <SystemMetricChart
          title="Heap Memory"
          data={memoryHistory}
          unit="MiB"
          maxValue={80}
          color="rgba(139, 92, 246, 1)"
          height={180}
        />
      </div>
    </div>
  );
}
