'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderTree, Package, Layers, Box } from 'lucide-react';
import { NamespaceSummary } from '@/types/kubernetes';
import SlidePanel from '@/components/ui/SlidePanel';
import NamespaceDetailPanel from '@/components/kubernetes/details/NamespaceDetailPanel';
import KubernetesContextMenu from '@/components/kubernetes/KubernetesContextMenu';

export default function NamespaceTab() {
  const [selectedNamespace, setSelectedNamespace] = useState<NamespaceSummary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    namespace: NamespaceSummary;
  } | null>(null);

  const namespaces: NamespaceSummary[] = [
    { 
      id: 'ns-1',
      name: 'default', 
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      status: 'Active',
      podCount: 45, 
      serviceCount: 12, 
      deploymentCount: 8,
      cpuUsage: 35.5,
      memoryUsage: 42.3,
      labels: {},
      createdAt: '2024-01-15T10:00:00Z'
    },
    { 
      id: 'ns-2',
      name: 'kube-system', 
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      status: 'Active',
      podCount: 25, 
      serviceCount: 8, 
      deploymentCount: 5,
      cpuUsage: 28.2,
      memoryUsage: 35.1,
      labels: { 'kubernetes.io/metadata.name': 'kube-system' },
      createdAt: '2024-01-15T10:00:00Z'
    },
    { 
      id: 'ns-3',
      name: 'production', 
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      status: 'Active',
      podCount: 120, 
      serviceCount: 35, 
      deploymentCount: 25,
      cpuUsage: 65.8,
      memoryUsage: 72.4,
      cpuQuota: 8,
      memoryQuota: 16384,
      labels: { env: 'production' },
      createdAt: '2024-02-01T08:00:00Z'
    },
    { 
      id: 'ns-4',
      name: 'staging', 
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      status: 'Active',
      podCount: 65, 
      serviceCount: 18, 
      deploymentCount: 15,
      cpuUsage: 45.2,
      memoryUsage: 52.8,
      cpuQuota: 4,
      memoryQuota: 8192,
      labels: { env: 'staging' },
      createdAt: '2024-02-10T09:00:00Z'
    },
    { 
      id: 'ns-5',
      name: 'monitoring', 
      clusterId: 'cluster-1',
      clusterName: 'kubernetes-211-2',
      status: 'Active',
      podCount: 18, 
      serviceCount: 6, 
      deploymentCount: 4,
      cpuUsage: 22.5,
      memoryUsage: 38.6,
      labels: { purpose: 'monitoring' },
      createdAt: '2024-01-20T11:00:00Z'
    }
  ];

  const handleContextMenu = (e: React.MouseEvent, namespace: NamespaceSummary) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      namespace
    });
  };

  const handleViewDetail = (namespace: NamespaceSummary) => {
    setSelectedNamespace(namespace);
    setIsDetailOpen(true);
    setContextMenu(null);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedNamespace(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Namespace Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {namespaces.map((ns) => (
          <Card 
            key={ns.id} 
            className="hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => handleViewDetail(ns)}
            onContextMenu={(e) => handleContextMenu(e, ns)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FolderTree className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{ns.name}</h3>
                  <Badge variant="outline" className="text-green-500">
                    {ns.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <Package className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-2xl font-bold">{ns.podCount}</p>
                  <p className="text-xs text-muted-foreground">Pods</p>
                </div>
                <div className="text-center">
                  <Layers className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-2xl font-bold">{ns.serviceCount}</p>
                  <p className="text-xs text-muted-foreground">Services</p>
                </div>
                <div className="text-center">
                  <Box className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-2xl font-bold">{ns.deploymentCount}</p>
                  <p className="text-xs text-muted-foreground">Deployments</p>
                </div>
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
          resourceType="namespace"
          resourceName={contextMenu.namespace.name}
          onClose={() => setContextMenu(null)}
          onViewDetail={() => handleViewDetail(contextMenu.namespace)}
          onCopyToClipboard={() => {
            navigator.clipboard.writeText(contextMenu.namespace.name);
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
        {selectedNamespace && (
          <NamespaceDetailPanel
            namespace={selectedNamespace}
            onClose={handleCloseDetail}
          />
        )}
      </SlidePanel>
    </div>
  );
}
