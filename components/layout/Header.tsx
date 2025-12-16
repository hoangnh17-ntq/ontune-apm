'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, X, Plus } from 'lucide-react';
import { useGlobal } from '@/contexts/GlobalContext';

export default function Header() {
  const router = useRouter();
  const params = useParams();
  const currentAppId = params?.appId as string;

  const { appTabs, activeAppTabId, closeAppTab, addAppTab, updateTabState, tabStates } = useGlobal();

  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabClick = (tabId: string, appId: string) => {
    // Navigate to the app's saved state or default transaction
    const savedState = tabStates[tabId];
    const targetTab = savedState?.apmTab || 'transaction';
    router.push(`/apm/${appId}/${targetTab}`);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeAppTab(tabId);
    // If closing active tab, GlobalContext handles logic, but we might need to route if we were on that tab.
    // The GlobalContext update activeAppTabId, but doesn't route.
    // We should probably redirect in useEffect or here.
    // Simplifying: The user just closes a tab. If it was active, we should navigate to the new active tab.
  };

  // Effect to navigate when activeAppTabId changes (e.g. after close)
  // This might be tricky if not careful, avoiding for now.

  const handleOverviewClick = () => {
    // router.push('/overview'); // If we had one
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center gap-4 px-4">
        {/* App Tabs - Left */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {appTabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${currentAppId === tab.appId
                  ? 'bg-secondary text-secondary-foreground'
                  : 'hover:bg-muted/50 text-muted-foreground'
                }`}
              onClick={() => handleTabClick(tab.id, tab.appId)}
            >
              {tab.appName}
              {appTabs.length > 1 && (
                <span
                  role="button"
                  className="hover:bg-background/50 rounded-sm p-0.5 ml-1"
                  onClick={(e) => handleCloseTab(e, tab.id)}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </div>
          ))}
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" onClick={() => addAppTab('demo-new', 'New App')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Right Side - LIVE status and User menu */}
        <div className="ml-auto flex items-center space-x-3">
          {/* LIVE Status */}
          <Badge variant="outline" className="gap-2 h-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {mounted && time ? (
              <span className="text-xs">
                LIVE {time.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            ) : (
              <span className="text-xs">LIVE --:--:--</span>
            )}
          </Badge>

          {/* User Menu */}
          <Button variant="ghost" size="sm" className="gap-2 h-8">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">UN</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </header>
  );
}
