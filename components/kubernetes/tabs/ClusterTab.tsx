'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ClusterSummary } from '@/types/kubernetes';
import ClusterMetricsChart from '../ClusterMetricsChart';
import SlidePanel from '@/components/ui/SlidePanel';
import ClusterDetailPanel from '@/components/kubernetes/details/ClusterDetailPanel';
import KubernetesContextMenu from '@/components/kubernetes/KubernetesContextMenu';

export default function ClusterTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<ClusterSummary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    cluster: ClusterSummary;
  } | null>(null);

  // Mock data
  const clusters: ClusterSummary[] = [
    {
      id: 'cluster-1',
      name: 'kubernetes-211-2',
      version: 'v1.28.2',
      status: 'healthy',
      nodeCount: 3,
      podCount: 145,
      namespaceCount: 8,
      cpuUsage: 45.5,
      memoryUsage: 62.3,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'cluster-2',
      name: 'kubernetes_163',
      version: 'v1.27.5',
      status: 'warning',
      nodeCount: 2,
      podCount: 98,
      namespaceCount: 5,
      cpuUsage: 78.2,
      memoryUsage: 45.8,
      createdAt: '2024-02-20T14:30:00Z'
    },
    {
      id: 'cluster-3',
      name: 'jslee-k3s',
      version: 'v1.28.0+k3s1',
      status: 'healthy',
      nodeCount: 1,
      podCount: 35,
      namespaceCount: 4,
      cpuUsage: 32.1,
      memoryUsage: 28.5,
      createdAt: '2024-03-10T09:15:00Z'
    },
    {
      id: 'cluster-4',
      name: 'be-k8s',
      version: 'v1.28.2',
      status: 'critical',
      nodeCount: 4,
      podCount: 0,
      namespaceCount: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      createdAt: '2024-04-05T11:20:00Z'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      healthy: 'bg-green-500/20 text-green-500',
      warning: 'bg-yellow-500/20 text-yellow-500',
      critical: 'bg-red-500/20 text-red-500'
    };
    return (
      <Badge className={variants[status] || 'bg-gray-500/20 text-gray-500'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const filteredClusters = clusters.filter(cluster =>
    cluster.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContextMenu = (e: React.MouseEvent, cluster: ClusterSummary) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      cluster
    });
  };

  const handleViewDetail = (cluster: ClusterSummary) => {
    setSelectedCluster(cluster);
    setIsDetailOpen(true);
    setContextMenu(null);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCluster(null);
  };

  const timeLabels = ['21:21', '21:23', '21:25', '21:27', '21:29', '21:31', '21:33'];
  const mockChartData = [
    {
      name: 'kubernetes-211-2',
      color: '#7837b9',
      data: [1.55, 1.58, 1.60, 1.62, 1.65, 1.67, 1.69],
      avg: 1.62,
      min: 1.55,
      max: 1.69,
      current: 1.69,
      timestamp: '2025-12-04 21:29:51'
    },
    {
      name: 'kubernetes_163',
      color: '#1be3e3',
      data: [0.39, 0.40, 0.41, 0.42, 0.43, 0.44, 0.45],
      avg: 0.42,
      min: 0.39,
      max: 0.45,
      current: 0.45,
      timestamp: '2025-12-04 21:22:40'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Cluster Management</h2>
          <Badge variant="outline">{filteredClusters.length} clusters</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clusters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Cluster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClusters.map((cluster) => (
          <Card
            key={cluster.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleViewDetail(cluster)}
            onContextMenu={(e) => handleContextMenu(e, cluster)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(cluster.status)}
                  <CardTitle className="text-lg">{cluster.name}</CardTitle>
                </div>
                {getStatusBadge(cluster.status)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Version: {cluster.version}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Nodes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {cluster.nodeCount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pods</p>
                  <p className="text-2xl font-bold text-foreground">
                    {cluster.podCount}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">CPU Usage</span>
                  <span className="text-xs font-semibold">{cluster.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ width: `${cluster.cpuUsage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Memory Usage</span>
                  <span className="text-xs font-semibold">{cluster.memoryUsage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                    style={{ width: `${cluster.memoryUsage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                <span>Namespaces: {cluster.namespaceCount}</span>
                <span>Created: {new Date(cluster.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cluster Metrics */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Cluster Performance Metrics</h3>
        <ClusterMetricsChart
          title="Cluster CPU Usage"
          clusters={mockChartData}
          timeLabels={timeLabels}
          metricType="cpu"
          tabs={[
            { label: 'CPU Usage(%)', value: 'usage' },
            { label: 'CPU Availability(%)', value: 'availability' }
          ]}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <KubernetesContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          resourceType="cluster"
          resourceName={contextMenu.cluster.name}
          onClose={() => setContextMenu(null)}
          onViewDetail={() => handleViewDetail(contextMenu.cluster)}
          onCopyToClipboard={() => {
            navigator.clipboard.writeText(contextMenu.cluster.name);
            setContextMenu(null);
          }}
        />
      )}

      {/* Detail Panel */}
      <SlidePanel
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        width="w-[70vw]"
      >
        {selectedCluster && (
          <ClusterDetailPanel
            cluster={selectedCluster}
            onClose={handleCloseDetail}
          />
        )}
      </SlidePanel>
    </div>
  );
}
