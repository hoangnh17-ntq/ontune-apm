'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Package, RefreshCw, Filter, AlertCircle } from 'lucide-react';
import { PodSummary } from '@/types/kubernetes';
import SlidePanel from '@/components/ui/SlidePanel';
import PodDetailPanel from '@/components/kubernetes/details/PodDetailPanel';
import KubernetesContextMenu from '@/components/kubernetes/KubernetesContextMenu';

export default function PodTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPod, setSelectedPod] = useState<PodSummary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    pod: PodSummary;
  } | null>(null);

  // Mock data
  const pods: PodSummary[] = [
    {
      id: 'pod-1',
      name: 'coredns-565d847f94-lh5gj',
      namespace: 'kube-system',
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      nodeName: 'kube-master',
      status: 'running',
      phase: 'Running',
      restartCount: 0,
      cpuUsage: 2.5,
      memoryUsage: 18.14,
      containers: [
        { name: 'coredns', image: 'registry.k8s.io/coredns:v1.10.1', status: 'running', restarts: 0 }
      ],
      labels: { 'k8s-app': 'kube-dns' },
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'pod-2',
      name: 'nginx-deployment-7d8b5c8d9f-xk2p4',
      namespace: 'default',
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      nodeName: 'kube-node02',
      status: 'running',
      phase: 'Running',
      restartCount: 2,
      cpuUsage: 5.2,
      memoryUsage: 45.3,
      containers: [
        { name: 'nginx', image: 'nginx:1.25.2', status: 'running', restarts: 2 }
      ],
      labels: { app: 'nginx' },
      createdAt: '2024-02-10T14:30:00Z'
    },
    {
      id: 'pod-3',
      name: 'backend-api-6c9b7d5f8g-m9s2w',
      namespace: 'production',
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      nodeName: 'kube-node02',
      status: 'error',
      phase: 'Failed',
      restartCount: 15,
      cpuUsage: 0,
      memoryUsage: 0,
      containers: [
        { name: 'backend', image: 'myapp/backend:v2.1.0', status: 'error', restarts: 15 }
      ],
      labels: { app: 'backend', tier: 'api' },
      createdAt: '2024-03-05T09:15:00Z'
    },
    {
      id: 'pod-4',
      name: 'redis-master-0',
      namespace: 'database',
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      nodeName: 'kube-node02',
      status: 'running',
      phase: 'Running',
      restartCount: 0,
      cpuUsage: 12.8,
      memoryUsage: 67.2,
      containers: [
        { name: 'redis', image: 'redis:7.2-alpine', status: 'running', restarts: 0 }
      ],
      labels: { app: 'redis', role: 'master' },
      createdAt: '2024-01-20T11:45:00Z'
    },
    {
      id: 'pod-5',
      name: 'prometheus-server-5d9f8c7b6a-p3k9m',
      namespace: 'monitoring',
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      nodeName: 'kube-node03',
      status: 'pending',
      phase: 'Pending',
      restartCount: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      containers: [
        { name: 'prometheus', image: 'prom/prometheus:v2.45.0', status: 'pending', restarts: 0 }
      ],
      labels: { app: 'prometheus', component: 'server' },
      createdAt: '2024-04-01T16:20:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-500';
      case 'error':
        return 'bg-red-500/20 text-red-500';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'pending':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const filteredPods = pods.filter(pod => {
    const matchesSearch = 
      pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.namespace.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.nodeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || pod.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: pods.length,
    running: pods.filter(p => p.status === 'running').length,
    error: pods.filter(p => p.status === 'error').length,
    pending: pods.filter(p => p.status === 'pending').length,
    warning: pods.filter(p => p.status === 'warning').length
  };

  const handleContextMenu = (e: React.MouseEvent, pod: PodSummary) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      pod
    });
  };

  const handleViewDetail = (pod: PodSummary) => {
    setSelectedPod(pod);
    setIsDetailOpen(true);
    setContextMenu(null);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPod(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Pod Management</h2>
          <Badge variant="outline">{filteredPods.length} pods</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'running', label: 'Running' },
          { key: 'error', label: 'Error' },
          { key: 'pending', label: 'Pending' },
          { key: 'warning', label: 'Warning' }
        ].map((filter) => (
          <Button
            key={filter.key}
            variant={statusFilter === filter.key ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter(filter.key)}
            className="gap-2"
          >
            {filter.label}
            <Badge variant="outline" className="ml-1">
              {statusCounts[filter.key as keyof typeof statusCounts]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Pods Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">NAMESPACE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">NODE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">RESTARTS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">CPU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">MEMORY</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">AGE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPods.map((pod, index) => (
                  <tr
                    key={pod.id}
                    onContextMenu={(e) => handleContextMenu(e, pod)}
                    onClick={() => handleViewDetail(pod)}
                    className={`border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{pod.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {pod.containers[0]?.image}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{pod.namespace}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{pod.nodeName}</td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(pod.status)}>
                        {pod.phase}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {pod.restartCount > 0 && (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          pod.restartCount > 5 ? 'text-red-500' : 
                          pod.restartCount > 0 ? 'text-yellow-500' : 
                          'text-green-500'
                        }`}>
                          {pod.restartCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {pod.cpuUsage > 0 ? `${pod.cpuUsage.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {pod.memoryUsage > 0 ? `${pod.memoryUsage.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {Math.floor((Date.now() - new Date(pod.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">Logs</Button>
                        <Button variant="ghost" size="sm">Exec</Button>
                        <Button variant="ghost" size="sm">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Context Menu */}
      {contextMenu && (
        <KubernetesContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          resourceType="pod"
          resourceName={contextMenu.pod.name}
          onClose={() => setContextMenu(null)}
          onViewDetail={() => handleViewDetail(contextMenu.pod)}
          onCopyToClipboard={() => {
            navigator.clipboard.writeText(contextMenu.pod.name);
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
        {selectedPod && (
          <PodDetailPanel
            pod={selectedPod}
            onClose={handleCloseDetail}
          />
        )}
      </SlidePanel>
    </div>
  );
}
