'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Server, Cpu, MemoryStick, HardDrive, RefreshCw } from 'lucide-react';
import { NodeSummary } from '@/types/kubernetes';
import SlidePanel from '@/components/ui/SlidePanel';
import NodeDetailPanel from '@/components/kubernetes/details/NodeDetailPanel';
import KubernetesContextMenu from '@/components/kubernetes/KubernetesContextMenu';

export default function NodeTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<NodeSummary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: NodeSummary;
  } | null>(null);

  // Mock data
  const nodes: NodeSummary[] = [
    {
      id: 'node-1',
      name: 'kube-master',
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      status: 'running',
      role: 'master',
      version: 'v1.28.2',
      osImage: 'Ubuntu 22.04.3 LTS',
      containerRuntime: 'containerd://1.7.2',
      cpuCapacity: 4,
      memoryCapacity: 8192,
      cpuUsage: 45.2,
      memoryUsage: 62.5,
      podCount: 12,
      conditions: [
        { type: 'Ready', status: 'True' },
        { type: 'DiskPressure', status: 'False' },
        { type: 'MemoryPressure', status: 'False' }
      ],
      labels: { 'node-role.kubernetes.io/control-plane': '' },
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'node-2',
      name: 'kube-node02',
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      status: 'running',
      role: 'worker',
      version: 'v1.28.2',
      osImage: 'Ubuntu 22.04.3 LTS',
      containerRuntime: 'containerd://1.7.2',
      cpuCapacity: 8,
      memoryCapacity: 16384,
      cpuUsage: 78.5,
      memoryUsage: 55.3,
      podCount: 45,
      conditions: [
        { type: 'Ready', status: 'True' },
        { type: 'DiskPressure', status: 'False' },
        { type: 'MemoryPressure', status: 'False' }
      ],
      labels: { 'node-role.kubernetes.io/worker': '' },
      createdAt: '2024-01-15T10:05:00Z'
    },
    {
      id: 'node-3',
      name: 'kube-node03',
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      status: 'error',
      role: 'worker',
      version: 'v1.28.2',
      osImage: 'Ubuntu 22.04.3 LTS',
      containerRuntime: 'containerd://1.7.2',
      cpuCapacity: 8,
      memoryCapacity: 16384,
      cpuUsage: 0,
      memoryUsage: 0,
      podCount: 0,
      conditions: [
        { type: 'Ready', status: 'False', message: 'Node is not reachable' },
        { type: 'DiskPressure', status: 'Unknown' },
        { type: 'MemoryPressure', status: 'Unknown' }
      ],
      labels: { 'node-role.kubernetes.io/worker': '' },
      createdAt: '2024-01-15T10:10:00Z'
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
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const filteredNodes = nodes.filter(node =>
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.clusterName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContextMenu = (e: React.MouseEvent, node: NodeSummary) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  const handleViewDetail = (node: NodeSummary) => {
    setSelectedNode(node);
    setIsDetailOpen(true);
    setContextMenu(null);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedNode(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Node Management</h2>
          <Badge variant="outline">{filteredNodes.length} nodes</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Node Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredNodes.map((node) => (
          <Card 
            key={node.id} 
            className="hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => handleViewDetail(node)}
            onContextMenu={(e) => handleContextMenu(e, node)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Server className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{node.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {node.clusterName} • {node.role.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(node.status)}>
                    {node.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{node.version}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* CPU */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Cpu className="w-4 h-4" />
                    <span>CPU</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Usage</span>
                      <span className="font-semibold">{node.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                        style={{ width: `${node.cpuUsage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {node.cpuCapacity} cores
                    </p>
                  </div>
                </div>

                {/* Memory */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MemoryStick className="w-4 h-4" />
                    <span>Memory</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Usage</span>
                      <span className="font-semibold">{node.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                        style={{ width: `${node.memoryUsage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(node.memoryCapacity / 1024).toFixed(1)} GB
                    </p>
                  </div>
                </div>

                {/* Pods */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="w-4 h-4" />
                    <span>Pods</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-foreground">{node.podCount}</p>
                    <p className="text-xs text-muted-foreground">
                      Running pods
                    </p>
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Conditions</div>
                  <div className="space-y-1">
                    {node.conditions.slice(0, 3).map((condition, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span>{condition.type}</span>
                        <Badge
                          variant="outline"
                          className={
                            condition.status === 'True'
                              ? 'text-green-500 border-green-500'
                              : condition.status === 'False'
                              ? 'text-gray-500'
                              : 'text-yellow-500 border-yellow-500'
                          }
                        >
                          {condition.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>OS: {node.osImage}</span>
                <span>Runtime: {node.containerRuntime.split('://')[0]}</span>
                <span>Created: {new Date(node.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <KubernetesContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          resourceType="node"
          resourceName={contextMenu.node.name}
          onClose={() => setContextMenu(null)}
          onViewDetail={() => handleViewDetail(contextMenu.node)}
          onCopyToClipboard={() => {
            navigator.clipboard.writeText(contextMenu.node.name);
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
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={handleCloseDetail}
          />
        )}
      </SlidePanel>
    </div>
  );
}
