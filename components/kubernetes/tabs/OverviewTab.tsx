'use client';

import React from 'react';
import ClusterSummaryCard from '../ClusterSummaryCard';
import Top5RankingWidget from '../Top5RankingWidget';
import StatusVisualization from '../StatusVisualization';
import ClusterMetricsChart from '../ClusterMetricsChart';

export default function OverviewTab() {
  // Mock data
  const summaryData = [
    {
      title: 'Cluster',
      count: 6,
      errorCount: 2,
      tags: [
        { label: 'K8s', color: 'bg-blue-500' },
        { label: 'K3s', color: 'bg-green-500' }
      ]
    },
    {
      title: 'Node',
      count: 8,
      errorCount: 3,
      tags: [
        { label: 'Master', color: 'bg-purple-500' },
        { label: 'Worker', color: 'bg-cyan-500' }
      ]
    },
    {
      title: 'Pod',
      count: 386,
      errorCount: 102,
      tags: [
        { label: 'Running', color: 'bg-green-500' },
        { label: 'Pending', color: 'bg-yellow-500' }
      ]
    },
    {
      title: 'Namespace',
      count: 21,
      errorCount: 0
    }
  ];

  const nodeCpuTop5 = [
    { rank: 1, name: 'kube-node02', value: 10.75 },
    { rank: 2, name: 'kube-master', value: 10.09 },
    { rank: 3, name: 'kube-node03', value: 7.27 },
    { rank: 4, name: 'instance-20240403-1007', value: 6.83 },
    { rank: 5, name: 'k8s-worker2', value: 4.93 }
  ];

  const nodeStatusItems = Array.from({ length: 8 }, (_, i) => ({
    id: `node-${i}`,
    status: i < 3 ? 'running' : i < 5 ? 'error' : 'offline',
    name: `node-${i}`
  })) as any;

  const clusterCpuData: any[] = [
    {
      name: 'kubernetes-211-2',
      color: '#7837b9',
      data: [1.55, 1.58, 1.60, 1.62, 1.65, 1.67, 1.69],
      avg: 1.62,
      min: 1.55,
      max: 1.69,
      current: 1.69,
      timestamp: '2025-12-04 21:29:51'
    }
  ];

  const timeLabels = ['21:21', '21:23', '21:25', '21:27', '21:29', '21:31', '21:33'];

  return (
    <div className="space-y-6">
      {/* Cluster Summary */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Cluster Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryData.map((item, index) => (
            <ClusterSummaryCard
              key={index}
              title={item.title}
              count={item.count}
              errorCount={item.errorCount}
              tags={item.tags}
            />
          ))}
        </div>
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ClusterMetricsChart
            title="Cluster CPU"
            clusters={clusterCpuData}
            timeLabels={timeLabels}
            metricType="cpu"
            tabs={[
              { label: 'CPU Usage(%)', value: 'usage' }
            ]}
          />
          <Top5RankingWidget
            title="Node Top 5 - CPU"
            items={nodeCpuTop5}
          />
        </div>
        <div className="space-y-6">
          <StatusVisualization
            title="Node Status"
            items={nodeStatusItems}
            totalCount={8}
            activeCount={3}
            type="node"
          />
        </div>
      </div>
    </div>
  );
}
