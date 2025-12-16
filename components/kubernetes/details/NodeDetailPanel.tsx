'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NodeSummary } from '@/types/kubernetes';

import ScopedSmartscape from '@/components/smartscape/ScopedSmartscape';

interface NodeDetailPanelProps {
  node: NodeSummary;
  onClose: () => void;
}

type TabType = 'summary' | 'performance' | 'topology';

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'performance', label: 'Performance' },
    { id: 'topology', label: 'Topology Map' }
  ];

  const age = Math.floor((Date.now() - new Date(node.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const conditions = node.conditions.map(c => ({
    name: c.type,
    status: c.status === 'True',
    message: c.message
  }));

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
            {node.name} Details
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
            {/* Node Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Node Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Node Name</div>
                    <div className="flex-1 text-sm">{node.name}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Status</div>
                    <div className="flex-1">
                      <Badge className={`${node.status === 'running' ? 'bg-green-500/20 text-green-500' :
                        node.status === 'error' ? 'bg-red-500/20 text-red-500' :
                          node.status === 'warning' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-500'
                        }`}>
                        {node.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Cluster</div>
                    <div className="flex-1 text-sm">{node.clusterName}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Role</div>
                    <div className="flex-1 text-sm">{node.role.toUpperCase()}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Version</div>
                    <div className="flex-1 text-sm">{node.version}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">OS Image</div>
                    <div className="flex-1 text-sm">{node.osImage}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Container Runtime</div>
                    <div className="flex-1 text-sm">{node.containerRuntime}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Pod Count</div>
                    <div className="flex-1 text-sm">{node.podCount}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Age</div>
                    <div className="flex-1 text-sm">{age}d</div>
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
                <div className="grid grid-cols-3 gap-6">
                  {/* CPU */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">CPU</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Usage</span>
                        <span className="text-sm">{node.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${node.cpuUsage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Capacity</span>
                        <span>{node.cpuCapacity} cores</span>
                      </div>
                    </div>
                  </div>

                  {/* Memory */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <MemoryStick className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Usage</span>
                        <span className="text-sm">{node.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${node.memoryUsage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Capacity</span>
                        <span>{(node.memoryCapacity / 1024).toFixed(1)} GB</span>
                      </div>
                    </div>
                  </div>

                  {/* Pods */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <HardDrive className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium">Pods</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">{node.podCount}</div>
                      <div className="text-xs text-muted-foreground">Running pods on this node</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Node Conditions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Node Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {conditions.map((condition, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{condition.name}</span>
                        <Badge className={condition.status ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                          {condition.status ? 'True' : 'False'}
                        </Badge>
                      </div>
                      {condition.message && (
                        <p className="text-xs text-muted-foreground">{condition.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Labels */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Labels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(node.labels).map(([key, value], idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs"
                    >
                      {key}{value ? `: ${value}` : ''}
                    </Badge>
                  ))}
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


      </div>
    </div>
  );
}
