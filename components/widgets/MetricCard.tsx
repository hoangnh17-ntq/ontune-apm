'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  subtitle?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'blue',
  subtitle
}: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  };

  const bgColorClasses = {
    blue: 'bg-blue-500/20',
    green: 'bg-green-500/20',
    orange: 'bg-orange-500/20',
    red: 'bg-red-500/20',
    purple: 'bg-purple-500/20',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-muted-foreground transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`p-2 ${bgColorClasses[color]} rounded-lg`}>
              <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
            </div>
          )}
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        {trend && trendValue && (
          <span className={`text-xs font-semibold ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 
            'text-muted-foreground'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className={`text-3xl font-bold ${colorClasses[color]}`}>
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}


