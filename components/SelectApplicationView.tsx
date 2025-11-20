'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, BarChart3, Settings, Search } from 'lucide-react';
import { APMTab } from '@/types/apm';
import { Input } from '@/components/ui/input';

interface Application {
  id: string;
  name: string;
  type: 'java' | 'nodejs' | 'python' | '.net' | 'php';
  status: 'active' | 'inactive' | 'warning';
  agents: number;
}

interface SelectApplicationViewProps {
  currentTab: APMTab;
  onAppClick: (appId: string, appName: string) => void;
}

export default function SelectApplicationView({ currentTab, onAppClick }: SelectApplicationViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const applications: Application[] = [
    { id: 'demo-8101', name: 'demo-8101', type: 'java', status: 'active', agents: 2 },
    { id: 'demo-8102', name: 'demo-8102', type: 'java', status: 'active', agents: 3 },
    { id: 'demo-8103', name: 'demo-8103', type: 'java', status: 'warning', agents: 1 },
    { id: 'demo-8104', name: 'demo-8104', type: 'java', status: 'active', agents: 4 },
    { id: 'demo-8105', name: 'demo-8105', type: 'nodejs', status: 'active', agents: 2 },
    { id: 'star_star', name: 'star_star', type: 'python', status: 'inactive', agents: 0 },
  ];

  const filteredApps = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTabInfo = () => {
    switch (currentTab) {
      case 'monitor':
        return {
          icon: Activity,
          title: 'Monitor',
          description: 'Real-time monitoring, transactions, and system metrics'
        };
      case 'analysis':
        return {
          icon: BarChart3,
          title: 'Analysis',
          description: 'Deep dive into transactions, traces, and performance analysis'
        };
      case 'report':
        return {
          icon: AlertCircle,
          title: 'Report',
          description: 'Generate and view reports for services, transactions, and errors'
        };
      case 'config':
        return {
          icon: Settings,
          title: 'Config',
          description: 'Configure agents, alerts, and monitoring settings'
        };
      default:
        return {
          icon: Activity,
          title: 'Monitor',
          description: 'Select an application to start monitoring'
        };
    }
  };

  const tabInfo = getTabInfo();
  const TabIcon = tabInfo.icon;

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

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <TabIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{tabInfo.title}</h2>
            <p className="text-muted-foreground mt-2">{tabInfo.description}</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Application List */}
        <Card>
          <CardHeader>
            <CardTitle>Select an Application</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => onAppClick(app.id, app.name)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent hover:border-primary transition-all text-left group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{getTypeIcon(app.type)}</div>
                    <div className="flex-1">
                      <div className="font-semibold group-hover:text-primary transition-colors">
                        {app.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="uppercase">{app.type}</span>
                        <span>•</span>
                        <span>{app.agents} agent{app.agents !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(app.status)}`}></div>
                    <Badge variant="outline" className="text-xs">
                      {app.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
            {filteredApps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No applications found matching "{searchTerm}"
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          Or go back to <button onClick={() => onAppClick('overview', 'Overview')} className="text-primary hover:underline">Overview</button> to see all applications
        </div>
      </div>
    </div>
  );
}

