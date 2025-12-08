'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, Server, Package, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClusterSummary } from '@/types/kubernetes';

import ScopedSmartscape from '@/components/smartscape/ScopedSmartscape';

interface ClusterDetailPanelProps {
  cluster: ClusterSummary;
  onClose: () => void;
}

type TabType = 'summary' | 'performance' | 'topology' | 'topology-flow';

export default function ClusterDetailPanel({ cluster, onClose }: ClusterDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'performance', label: 'Performance' },
    { id: 'topology', label: 'Topology Map' },
    { id: 'topology-flow', label: 'Topology Flow' }
  ];

  const age = Math.floor((Date.now() - new Date(cluster.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="px-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h2 className="text-lg font-semibold text-primary">
            {cluster.name} Details
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-muted/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
              ? 'text-primary border-b-2 border-primary bg-muted/30'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col">
        {activeTab === 'summary' && (
          <>
            {/* Cluster Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Cluster Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Cluster Name</div>
                    <div className="flex-1 text-sm">{cluster.name}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Status</div>
                    <div className="flex-1">
                      <Badge className={`${cluster.status === 'healthy' ? 'bg-green-500/20 text-green-500' :
                        cluster.status === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                        {cluster.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Version</div>
                    <div className="flex-1 text-sm">{cluster.version}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Age</div>
                    <div className="flex-1 text-sm">{age}d</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Resource Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-muted-foreground">Nodes</span>
                    </div>
                    <div className="text-3xl font-bold">{cluster.nodeCount}</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-muted-foreground">Pods</span>
                    </div>
                    <div className="text-3xl font-bold">{cluster.podCount}</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-muted-foreground">Namespaces</span>
                    </div>
                    <div className="text-3xl font-bold">{cluster.namespaceCount}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* CPU */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm">{cluster.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                        style={{ width: `${cluster.cpuUsage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Used</span>
                      <span>Available</span>
                    </div>
                  </div>

                  {/* Memory */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm">{cluster.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                        style={{ width: `${cluster.memoryUsage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Used</span>
                      <span>Available</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cluster Health */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Cluster Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">API Server</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm text-green-500">Healthy</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Controller Manager</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm text-green-500">Healthy</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Scheduler</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm text-green-500">Healthy</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">etcd</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm text-green-500">Healthy</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'performance' && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">Performance metrics (Coming soon)</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'topology-flow' && (
          <div className="flex-1 h-[500px] min-h-[400px] bg-black rounded-lg border border-border overflow-hidden">
            <ScopedSmartscape scope="cluster" id={cluster.id} label={cluster.name} />
          </div>
        )}
      </div>
    </div>
  );
}
