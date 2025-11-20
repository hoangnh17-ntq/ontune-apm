'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Activity, Globe, Server } from 'lucide-react';
import { APMTab } from '@/types/apm';

interface CompactTabBarProps {
  activeTab: APMTab;
  onTabChange: (tab: APMTab) => void;
  isOverview: boolean;
}

export default function CompactTabBar({
  activeTab,
  onTabChange,
  isOverview
}: CompactTabBarProps) {
  if (isOverview) return null;

  const monitorTabs = ['transaction', 'rum', 'was'];

  if (!monitorTabs.includes(activeTab)) return null;

  const tabs = [
    { id: 'transaction' as APMTab, label: 'Transaction', icon: Activity },
    { id: 'rum' as APMTab, label: 'RUM', icon: Globe },
    { id: 'was' as APMTab, label: 'WAS', icon: Server },
  ];

  return (
    <div className="border-b bg-background">
      <div className="flex h-10 items-center gap-4 px-4">
        {/* APM Tabs - Left */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className="gap-2 h-8 text-xs"
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
