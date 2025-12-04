'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical, Download, Maximize2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ClusterData {
  name: string;
  color: string;
  data: number[];
  avg: number;
  min: number;
  max: number;
  current: number;
  timestamp: string;
}

interface ClusterMetricsChartProps {
  title: string;
  clusters: ClusterData[];
  timeLabels: string[];
  metricType: 'cpu' | 'memory' | 'pod';
  unit?: string;
  tabs?: Array<{ label: string; value: string }>;
  className?: string;
}

export default function ClusterMetricsChart({
  title,
  clusters,
  timeLabels,
  metricType,
  unit = '%',
  tabs = [],
  className
}: ClusterMetricsChartProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || 'usage');
  const [visibleClusters, setVisibleClusters] = useState<Record<string, boolean>>(
    clusters.reduce((acc, cluster) => ({ ...acc, [cluster.name]: true }), {})
  );

  const chartData = timeLabels.map((time, index) => {
    const dataPoint: any = { time };
    clusters.forEach(cluster => {
      if (visibleClusters[cluster.name]) {
        dataPoint[cluster.name] = cluster.data[index] || 0;
      }
    });
    return dataPoint;
  });

  const toggleCluster = (clusterName: string) => {
    setVisibleClusters(prev => ({
      ...prev,
      [clusterName]: !prev[clusterName]
    }));
  };

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {tabs.length > 0 && (
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {tabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    activeTab === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
                ticks={[0, 50, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              {clusters.map(cluster => (
                visibleClusters[cluster.name] && (
                  <Line
                    key={cluster.name}
                    type="monotone"
                    dataKey={cluster.name}
                    stroke={cluster.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-6 grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
              <div className="flex items-center gap-1">
                <input type="checkbox" className="w-3 h-3" />
              </div>
              <div>Cluster Name</div>
              <div className="text-right">Avg</div>
              <div className="text-right">Min</div>
              <div className="text-right">Max</div>
              <div className="text-right">Current</div>
            </div>

            {clusters.map(cluster => (
              <div key={cluster.name} className="col-span-6 grid grid-cols-6 gap-2 items-center py-1 hover:bg-muted/50 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visibleClusters[cluster.name]}
                    onChange={() => toggleCluster(cluster.name)}
                    className="w-3 h-3"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cluster.color }}
                  />
                </div>
                <div className="text-sm font-medium text-foreground truncate">
                  {cluster.name}
                </div>
                <div className="text-sm text-right">{cluster.avg.toFixed(2)}</div>
                <div className="text-sm text-right">{cluster.min.toFixed(2)}</div>
                <div className="text-sm text-right">{cluster.max.toFixed(2)}</div>
                <div className="text-sm font-semibold text-right text-primary">
                  {cluster.current.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
