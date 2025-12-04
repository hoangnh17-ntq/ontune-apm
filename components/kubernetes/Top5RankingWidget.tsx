'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankingItem {
  rank: number;
  name: string;
  value: number;
  unit?: string;
}

interface Top5RankingWidgetProps {
  title: string;
  items: RankingItem[];
  maxValue?: number;
  className?: string;
}

export default function Top5RankingWidget({
  title,
  items,
  maxValue,
  className
}: Top5RankingWidgetProps) {
  const max = maxValue || Math.max(...items.map(item => item.value));

  const getBarColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-red-500 to-red-400';
      case 2:
        return 'bg-gradient-to-r from-orange-500 to-orange-400';
      case 3:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
      case 4:
        return 'bg-gradient-to-r from-blue-500 to-blue-400';
      case 5:
        return 'bg-gradient-to-r from-green-500 to-green-400';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-400';
    }
  };

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-[auto_1fr_auto] gap-3 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
          <div className="w-6 text-center">1</div>
          <div>Node Name</div>
          <div className="w-20 text-right">Usage(%)</div>
        </div>

        {items.map((item) => (
          <div key={item.rank} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center group">
            <div className="w-6 text-center">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                {item.rank}
              </span>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground truncate">
                  {item.name}
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getBarColor(item.rank)
                  )}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>

            <div className="w-20 text-right">
              <span className="text-sm font-semibold text-foreground">
                {item.value.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
