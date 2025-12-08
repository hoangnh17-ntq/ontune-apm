'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusItem {
  id: string;
  status: 'running' | 'error' | 'warning' | 'pending' | 'offline';
  name?: string;
}

interface StatusVisualizationProps {
  title: string;
  items: StatusItem[];
  totalCount: number;
  activeCount: number;
  type: 'node' | 'pod';
  className?: string;
}

export default function StatusVisualization({
  title,
  items,
  totalCount,
  activeCount,
  type,
  className
}: StatusVisualizationProps) {
  const getStatusColor = (status: StatusItem['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500 hover:bg-blue-400';
      case 'error':
        return 'bg-red-500 hover:bg-red-400';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-400';
      case 'pending':
        return 'bg-orange-500 hover:bg-orange-400';
      case 'offline':
        return 'bg-gray-600 hover:bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getItemShape = () => {
    return type === 'node' ? 'rounded-lg' : 'rounded-full';
  };

  const getItemSize = () => {
    return type === 'node' ? 'w-12 h-12' : 'w-8 h-8';
  };

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-foreground font-medium">{type === 'node' ? 'Node' : 'Pod'}</span>
            <span className="text-primary font-semibold">{activeCount}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{totalCount}</span>
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="검색"
              className="pl-8 pr-3 py-1 text-xs bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className={cn(
          "flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg min-h-[120px]",
          type === 'node' ? 'justify-start' : 'justify-start'
        )}>
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "relative cursor-pointer transition-all duration-200 transform hover:scale-110",
                getItemSize(),
                getItemShape(),
                getStatusColor(item.status)
              )}
              title={item.name || item.id}
            >
              {item.status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Running</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Error</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-600" />
            <span className="text-muted-foreground">Offline</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
