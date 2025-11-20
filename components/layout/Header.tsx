'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { AppTab } from '@/types/tabs';

interface HeaderProps {
  appTabs: AppTab[];
  activeAppTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onOverviewClick: () => void;
}

export default function Header({ appTabs, activeAppTabId, onTabChange, onTabClose, onOverviewClick }: HeaderProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center gap-4 px-4">
        {/* App Tabs - Left */}
        

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
