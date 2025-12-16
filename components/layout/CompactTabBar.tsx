'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Activity, Globe, Server, FileText, Settings, Network, PieChart } from 'lucide-react';
import { APMTab } from '@/types/apm';

export default function CompactTabBar() {
  const params = useParams();
  const pathname = usePathname();
  const appId = params?.appId as string;
  const currentTab = pathname?.split('/').pop() as APMTab;

  const tabs = [
    { id: 'transaction' as APMTab, label: 'Transaction', icon: Activity },
    { id: 'rum' as APMTab, label: 'RUM', icon: Globe },
    { id: 'was' as APMTab, label: 'WAS', icon: Server },
    { id: 'analysis' as APMTab, label: 'Analysis', icon: PieChart },
    { id: 'topology' as APMTab, label: 'Topology', icon: Network },
    { id: 'report' as APMTab, label: 'Report', icon: FileText },
    { id: 'config' as APMTab, label: 'Config', icon: Settings },
  ];

  if (!appId) return null;

  return (
    <div className="border-b bg-background">
      <div className="flex h-10 items-center gap-4 px-4 overflow-x-auto">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link key={tab.id} href={`/apm/${appId}/${tab.id}`}>
                <Button
                  variant={currentTab === tab.id ? 'secondary' : 'ghost'}
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
    </div>
  );
}
