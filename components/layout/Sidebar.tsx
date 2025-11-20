'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Server,
  Box,
  Terminal,
  Boxes,
  Cloud,
  Activity,
  Database,
  Link,
  User,
  ChevronRight
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { APMTab } from '@/types/apm';

interface NavItem {
  icon: React.ElementType;
  label: string;
  submenu?: string[];
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Server, label: 'Server' },
  { icon: Box, label: 'VMware' },
  { icon: Terminal, label: 'XenServer' },
  { icon: Boxes, label: 'Kubernetes' },
  { icon: Cloud, label: 'Cloud', submenu: ['Monitor', 'Analysis', 'Report', 'Config'] },
  {
    icon: Activity,
    label: 'APM',
    submenu: ['Monitor', 'Analysis', 'Report', 'Config'],
    active: true
  },
  { icon: Database, label: 'Database' },
  { icon: Link, label: 'URL' },
  { icon: User, label: 'Admin' },
];

interface SidebarProps {
  activeTab: APMTab;
  onTabChange: (tab: APMTab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string>('APM');

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? '' : label);
  };

  const handleSubmenuClick = (parentLabel: string, subItem: string) => {
    if (parentLabel === 'APM') {
      if (subItem === 'Monitor') {
        onTabChange('transaction');
      } else {
        onTabChange(subItem.toLowerCase() as APMTab);
      }
    }
  };

  const isMonitorTab = (tab: APMTab) => ['transaction', 'rum', 'was'].includes(tab);

  return (
    <aside className="w-64 border-r bg-background flex flex-col">
      {/* Logo at top */}
      <div className="p-4 border-b">
        <a className="flex items-center space-x-2" href="/">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">onTune APM</span>
        </a>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenu === item.label;
            let isActive = item.active;

            if (item.label === 'APM' && isMonitorTab(activeTab)) {
              // Keep APM active if we are in a monitor sub-tab
              isActive = true;
            }

            return (
              <div key={item.label}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => item.submenu && toggleSubmenu(item.label)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                  {item.submenu && (
                    <ChevronRight
                      className={`ml-auto h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  )}
                </Button>

                {/* Submenu */}
                {item.submenu && isExpanded && (
                  <div className="mt-1 space-y-1 pl-6">
                    {item.submenu.map((subItem) => {
                      // Determine if this subItem is active
                      let isSubActive = false;
                      if (item.label === 'APM') {
                        if (subItem === 'Monitor' && isMonitorTab(activeTab)) {
                          isSubActive = true;
                        } else if (subItem.toLowerCase() === activeTab) {
                          isSubActive = true;
                        }
                      }

                      return (
                        <Button
                          key={subItem}
                          variant={isSubActive ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleSubmenuClick(item.label, subItem)}
                        >
                          {subItem}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}

