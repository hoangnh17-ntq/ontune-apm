'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, Package, Server, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NamespaceSummary } from '@/types/kubernetes';

import ScopedSmartscape from '@/components/smartscape/ScopedSmartscape';

interface NamespaceDetailPanelProps {
  namespace: NamespaceSummary;
  onClose: () => void;
}

type TabType = 'summary' | 'performance' | 'topology' | 'topology-flow';

export default function NamespaceDetailPanel({ namespace, onClose }: NamespaceDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'performance', label: 'Performance' },
    { id: 'topology', label: 'Topology Map' },
    { id: 'topology-flow', label: 'Topology Flow' }
  ];

  const age = Math.floor((Date.now() - new Date(namespace.createdAt).getTime()) / (1000 * 60 * 60 * 24));

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
            {namespace.name} Details
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
            {/* Namespace Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Namespace Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Name</div>
                    <div className="flex-1 text-sm">{namespace.name}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Status</div>
                    <div className="flex-1">
                      <Badge className={namespace.status === 'Active' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                        {namespace.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Cluster</div>
                    <div className="flex-1 text-sm">{namespace.clusterName}</div>
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
                      <Package className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-muted-foreground">Pods</span>
                    </div>
                    <div className="text-3xl font-bold">{namespace.podCount}</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-muted-foreground">Services</span>
                    </div>
                    <div className="text-3xl font-bold">{namespace.serviceCount}</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-muted-foreground">Deployments</span>
                    </div>
                    <div className="text-3xl font-bold">{namespace.deploymentCount}</div>
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
                      <span className="text-sm">{namespace.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                        style={{ width: `${namespace.cpuUsage}%` }}
                      />
                    </div>
                    {namespace.cpuQuota && (
                      <div className="text-xs text-muted-foreground">
                        Quota: {namespace.cpuQuota} cores
                      </div>
                    )}
                  </div>

                  {/* Memory */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm">{namespace.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                        style={{ width: `${namespace.memoryUsage}%` }}
                      />
                    </div>
                    {namespace.memoryQuota && (
                      <div className="text-xs text-muted-foreground">
                        Quota: {(namespace.memoryQuota / 1024).toFixed(1)} GB
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Labels */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Labels</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(namespace.labels).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(namespace.labels).map(([key, value], idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs"
                      >
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No labels</p>
                )}
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
            <ScopedSmartscape scope="namespace" id={namespace.name} label={namespace.name} />
          </div>
        )}
      </div>
    </div>
  );
}
