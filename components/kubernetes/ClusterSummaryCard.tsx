'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClusterSummaryCardProps {
  title: string;
  count: number;
  errorCount?: number;
  warningCount?: number;
  tags?: Array<{ label: string; color: string }>;
  onClick?: () => void;
  className?: string;
}

export default function ClusterSummaryCard({
  title,
  count,
  errorCount = 0,
  warningCount = 0,
  tags = [],
  onClick,
  className
}: ClusterSummaryCardProps) {
  const hasError = errorCount > 0;
  const hasWarning = warningCount > 0;

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-2 transition-all duration-300 cursor-pointer group",
        hasError ? "border-red-500/50 hover:border-red-500" : "border-border hover:border-primary/50",
        "hover:shadow-lg hover:shadow-primary/10",
        className
      )}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="flex items-end justify-between">
          <div className="text-5xl font-bold text-foreground">
            {count}
          </div>

          {(hasError || hasWarning) && (
            <div className="flex flex-col gap-1 text-right">
              {hasError && (
                <div className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Error {errorCount}</span>
                </div>
              )}
              {hasWarning && (
                <div className="flex items-center gap-1 text-orange-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Warning {warningCount}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-1 text-xs"
              >
                <span className={cn("w-2 h-2 rounded-full", tag.color)} />
                <span className="text-muted-foreground">{tag.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {hasError && (
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
      )}
    </Card>
  );
}
