'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  Box,
  Terminal,
  Boxes,
  Cloud,
  Activity,
  Database,
  Link as LinkIcon,
  User,
  ChevronRight
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useGlobal } from '@/contexts/GlobalContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  submenu?: string[];
  section?: 'apm' | 'kubernetes';
  href?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Server, label: 'Server' },
  { icon: Box, label: 'VMware' },
  { icon: Terminal, label: 'XenServer' },
  {
    icon: Boxes,
    label: 'Kubernetes',
    submenu: ['Monitor', 'Analysis', 'Report', 'Config'],
    section: 'kubernetes'
  },
  { icon: Cloud, label: 'Cloud', submenu: ['Monitor', 'Analysis', 'Report', 'Config'] },
  {
    icon: Activity,
    label: 'APM',
    submenu: ['Monitor', 'Analysis', 'Report', 'Config'],
    section: 'apm'
  },
  { icon: Database, label: 'Database' },
  { icon: LinkIcon, label: 'URL' },
  { icon: User, label: 'Admin' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { activeAppTabId } = useGlobal(); // We need active app ID for APM links

  const isKubernetes = pathname?.startsWith('/kubernetes');
  const isApm = pathname?.startsWith('/apm');
  const activeSection = isKubernetes ? 'kubernetes' : isApm ? 'apm' : null;

  // Extract tab from path
  const currentTab = pathname?.split('/').pop();

  const [expandedMenu, setExpandedMenu] = useState<string>(activeSection === 'kubernetes' ? 'Kubernetes' : 'APM');

  useEffect(() => {
    if (activeSection === 'kubernetes') setExpandedMenu('Kubernetes');
    if (activeSection === 'apm') setExpandedMenu('APM');
  }, [activeSection]);

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? '' : label);
  };

  const getSubItemHref = (parentLabel: string, subItem: string) => {
    const subLower = subItem.toLowerCase();

    if (parentLabel === 'APM') {
      // Default to transaction if Monitor is clicked
      const targetTab = subItem === 'Monitor' ? 'transaction' : subLower;
      const appId = activeAppTabId || 'demo-8101';
      return `/apm/${appId}/${targetTab}`;
    } else if (parentLabel === 'Kubernetes') {
      const targetTab = subItem === 'Monitor' ? 'overview' : subLower;
      return `/kubernetes/${targetTab}`;
    }
    return '#';
  };

  const isActiveSubItem = (parentLabel: string, subItem: string) => {
    const subLower = subItem.toLowerCase();
    if (parentLabel === 'APM' && activeSection === 'apm') {
      if (subItem === 'Monitor' && ['transaction', 'rum', 'was'].includes(currentTab || '')) return true;
      if (subLower === currentTab) return true;
    }
    if (parentLabel === 'Kubernetes' && activeSection === 'kubernetes') {
      if (subItem === 'Monitor' && (currentTab === 'overview' || ['cluster', 'node', 'pod'].includes(currentTab || ''))) return true; // simplified check
      if (subLower === currentTab) return true;
    }
    return false;
  };

  return (
    <aside className="w-64 border-r bg-background flex flex-col h-full">
      {/* Logo at top */}
      <div className="p-4 border-b">
        <Link className="flex items-center space-x-2" href="/">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">onTune APM</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenu === item.label;
            let isActive = false;

            if (item.label === 'APM' && activeSection === 'apm') {
              isActive = true;
            } else if (item.label === 'Kubernetes' && activeSection === 'kubernetes') {
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
                      const href = getSubItemHref(item.label, subItem);
                      const isSubActive = isActiveSubItem(item.label, subItem);

                      return (
                        <Link key={subItem} href={href} className="block">
                          <Button
                            variant={isSubActive ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start"
                          >
                            {subItem}
                          </Button>
                        </Link>
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

