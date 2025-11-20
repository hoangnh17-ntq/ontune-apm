'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Globe, Server, AlertCircle, TrendingUp, Clock, Cpu } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  type: 'java' | 'nodejs' | 'python' | '.net' | 'php';
  status: 'active' | 'inactive' | 'warning';
  activeTransactions: number;
  tps: number;
  avgResponseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  agents: number;
  lastUpdate: Date;
}

interface OverviewTabProps {
  onAppClick?: (appId: string, appName: string) => void;
}

export default function OverviewTab({ onAppClick }: OverviewTabProps) {
  const [applications] = useState<Application[]>([
    {
      id: 'demo-8101',
      name: 'demo-8101',
      type: 'java',
      status: 'active',
      activeTransactions: 45,
      tps: 28.5,
      avgResponseTime: 245,
      errorRate: 0.2,
      cpuUsage: 42,
      memoryUsage: 65,
      agents: 2,
      lastUpdate: new Date()
    },
    {
      id: 'demo-8102',
      name: 'demo-8102',
      type: 'java',
      status: 'active',
      activeTransactions: 120,
      tps: 45.2,
      avgResponseTime: 180,
      errorRate: 0.1,
      cpuUsage: 38,
      memoryUsage: 58,
      agents: 3,
      lastUpdate: new Date()
    },
    {
      id: 'demo-8103',
      name: 'demo-8103',
      type: 'java',
      status: 'warning',
      activeTransactions: 89,
      tps: 32.8,
      avgResponseTime: 520,
      errorRate: 2.5,
      cpuUsage: 75,
      memoryUsage: 82,
      agents: 1,
      lastUpdate: new Date()
    },
    {
      id: 'demo-8104',
      name: 'demo-8104',
      type: 'java',
      status: 'active',
      activeTransactions: 310,
      tps: 156.05,
      avgResponseTime: 125,
      errorRate: 0.3,
      cpuUsage: 52,
      memoryUsage: 68,
      agents: 4,
      lastUpdate: new Date()
    },
    {
      id: 'demo-8105',
      name: 'demo-8105',
      type: 'nodejs',
      status: 'active',
      activeTransactions: 67,
      tps: 89.3,
      avgResponseTime: 95,
      errorRate: 0.5,
      cpuUsage: 28,
      memoryUsage: 45,
      agents: 2,
      lastUpdate: new Date()
    },
    {
      id: 'star_star',
      name: 'star_star',
      type: 'python',
      status: 'inactive',
      activeTransactions: 0,
      tps: 0,
      avgResponseTime: 0,
      errorRate: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      agents: 0,
      lastUpdate: new Date()
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'java': return '☕';
      case 'nodejs': return '🟢';
      case 'python': return '🐍';
      case '.net': return '🔵';
      case 'php': return '🐘';
      default: return '📦';
    }
  };

  const getPerformanceColor = (value: number, threshold: { warning: number; critical: number }) => {
    if (value >= threshold.critical) return 'text-red-400';
    if (value >= threshold.warning) return 'text-yellow-400';
    return 'text-green-400';
  };

  const totalActiveApps = applications.filter(app => app.status === 'active').length;
  const totalAgents = applications.reduce((sum, app) => sum + app.agents, 0);
  const totalTransactions = applications.reduce((sum, app) => sum + app.activeTransactions, 0);
  const avgTPS = (applications.reduce((sum, app) => sum + app.tps, 0) / applications.length).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Applications</div>
                <div className="text-3xl font-bold">{applications.length}</div>
              </div>
              <Activity className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Active Applications</div>
                <div className="text-3xl font-bold text-green-400">{totalActiveApps}</div>
              </div>
              <Server className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Agents</div>
                <div className="text-3xl font-bold">{totalAgents}</div>
              </div>
              <Database className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Active Transactions</div>
                <div className="text-3xl font-bold">{totalTransactions}</div>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <Card 
            key={app.id} 
            className="hover:shadow-lg hover:border-primary transition-all cursor-pointer"
            onClick={() => onAppClick?.(app.id, app.name)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getTypeIcon(app.type)}</div>
                  <div>
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <CardDescription className="text-xs uppercase">{app.type}</CardDescription>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(app.status)} animate-pulse`}></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge variant={app.status === 'active' ? 'default' : app.status === 'warning' ? 'destructive' : 'secondary'}>
                  {app.status === 'active' ? 'Active' : app.status === 'warning' ? 'Warning' : 'Inactive'}
                </Badge>
                <Badge variant="outline">
                  {app.agents} Agent{app.agents !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Metrics */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Active TX
                  </span>
                  <span className="font-mono font-semibold">{app.activeTransactions}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    TPS
                  </span>
                  <span className="font-mono font-semibold">{app.tps.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Avg Response
                  </span>
                  <span className={`font-mono font-semibold ${getPerformanceColor(app.avgResponseTime, { warning: 200, critical: 500 })}`}>
                    {app.avgResponseTime}ms
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Error Rate
                  </span>
                  <span className={`font-mono font-semibold ${getPerformanceColor(app.errorRate, { warning: 1, critical: 2 })}`}>
                    {app.errorRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="space-y-2 pt-2 border-t">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      CPU
                    </span>
                    <span className={`font-mono font-semibold ${getPerformanceColor(app.cpuUsage, { warning: 60, critical: 80 })}`}>
                      {app.cpuUsage}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        app.cpuUsage >= 80 ? 'bg-red-500' : app.cpuUsage >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${app.cpuUsage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      Memory
                    </span>
                    <span className={`font-mono font-semibold ${getPerformanceColor(app.memoryUsage, { warning: 70, critical: 85 })}`}>
                      {app.memoryUsage}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        app.memoryUsage >= 85 ? 'bg-red-500' : app.memoryUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${app.memoryUsage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Last Update */}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Last update: {app.lastUpdate.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

