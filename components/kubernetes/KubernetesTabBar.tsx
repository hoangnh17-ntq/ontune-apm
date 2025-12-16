'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Boxes, Server, Package, FolderTree, Network, HardDrive, Layers } from 'lucide-react';
import { KubernetesTab } from '@/types/kubernetes';

export default function KubernetesTabBar() {
  const pathname = usePathname();
  // Extract the last segment of the path
  const currentTab = pathname?.split('/').pop() as KubernetesTab;

  const tabs = [
    { id: 'overview' as KubernetesTab, label: 'Overview', icon: LayoutGrid, href: '/kubernetes/overview' },
    { id: 'cluster' as KubernetesTab, label: 'Cluster', icon: Boxes, href: '/kubernetes/cluster' },
    { id: 'node' as KubernetesTab, label: 'Node', icon: Server, href: '/kubernetes/node' },
    { id: 'pod' as KubernetesTab, label: 'Pod', icon: Package, href: '/kubernetes/pod' },
    { id: 'namespace' as KubernetesTab, label: 'Namespace', icon: FolderTree, href: '/kubernetes/namespace' },
    { id: 'network' as KubernetesTab, label: 'Network', icon: Network, href: '/kubernetes/network' },
    { id: 'storage' as KubernetesTab, label: 'Storage', icon: HardDrive, href: '/kubernetes/storage' },
    { id: 'workloads' as KubernetesTab, label: 'Workloads', icon: Layers, href: '/kubernetes/workloads' },
    { id: 'topology-flow' as KubernetesTab, label: 'Topology Flow', icon: Network, href: '/kubernetes/topology-flow' },
  ];

  const isActive = (tabId: string) => {
    return currentTab === tabId;
  };

  return (
    <div className="border-b bg-background">
      <div className="flex h-10 items-center gap-2 px-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link key={tab.id} href={tab.href}>
              <Button
                variant={isActive(tab.id) ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2 h-8 text-xs whitespace-nowrap"
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
