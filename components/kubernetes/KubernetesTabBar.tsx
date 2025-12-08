'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Boxes, Server, Package, FolderTree, Network, HardDrive, Layers } from 'lucide-react';
import { KubernetesTab } from '@/types/kubernetes';

interface KubernetesTabBarProps {
  activeTab: KubernetesTab;
  onTabChange: (tab: KubernetesTab) => void;
}

export default function KubernetesTabBar({
  activeTab,
  onTabChange
}: KubernetesTabBarProps) {
  const tabs = [
    { id: 'overview' as KubernetesTab, label: 'Overview', icon: LayoutGrid },
    { id: 'cluster' as KubernetesTab, label: 'Cluster', icon: Boxes },
    { id: 'node' as KubernetesTab, label: 'Node', icon: Server },
    { id: 'pod' as KubernetesTab, label: 'Pod', icon: Package },
    { id: 'namespace' as KubernetesTab, label: 'Namespace', icon: FolderTree },
    { id: 'network' as KubernetesTab, label: 'Network', icon: Network },
    { id: 'storage' as KubernetesTab, label: 'Storage', icon: HardDrive },
    { id: 'workloads' as KubernetesTab, label: 'Workloads', icon: Layers },
  ];

  return (
    <div className="border-b bg-background">
      <div className="flex h-10 items-center gap-2 px-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className="gap-2 h-8 text-xs whitespace-nowrap"
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
