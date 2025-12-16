'use client';

import React, { useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PodSummary } from '@/types/kubernetes';

import ScopedSmartscape from '@/components/smartscape/ScopedSmartscape';

interface PodDetailPanelProps {
  pod: PodSummary;
  onClose: () => void;
}

type TabType = 'summary' | 'performance' | 'topology';

export default function PodDetailPanel({ pod, onClose }: PodDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'performance', label: 'Performance' },
    { id: 'topology', label: 'Topology Map' }
  ];

  const containerStats = {
    total: pod.containers.length,
    running: pod.containers.filter(c => c.status === 'running').length,
    waiting: pod.containers.filter(c => c.status === 'pending').length,
    terminated: pod.containers.filter(c => c.status === 'terminated').length,
    failed: pod.containers.filter(c => c.status === 'error').length,
    runningRatio: pod.containers.length > 0
      ? Math.round((pod.containers.filter(c => c.status === 'running').length / pod.containers.length) * 100)
      : 0
  };

  const conditions = [
    { name: 'Pod Ready to Start Container', status: pod.status === 'running' },
    { name: 'Disruption Target', status: false },
    { name: 'Initialized', status: true },
    { name: 'Ready', status: pod.status === 'running' },
    { name: 'Containers Ready', status: pod.status === 'running' },
    { name: 'Pod Scheduled', status: true }
  ];

  const age = Math.floor((Date.now() - new Date(pod.createdAt).getTime()) / (1000 * 60 * 60 * 24));

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
            {pod.name} Details
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
            {/* Pod Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pod Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex">
                    <div className="w-32 text-sm text-muted-foreground">Pod Name</div>
                    <div className="flex-1 text-sm">{pod.name}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Status</div>
                    <div className="flex-1">
                      <Badge className={`${pod.phase === 'Running' ? 'bg-green-500/20 text-green-500' :
                        pod.phase === 'Failed' ? 'bg-red-500/20 text-red-500' :
                          pod.phase === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-500'
                        }`}>
                        {pod.phase}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Cluster</div>
                    <div className="flex-1 text-sm">{pod.clusterName}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Node</div>
                    <div className="flex-1 text-sm">{pod.nodeName}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Namespace</div>
                    <div className="flex-1 text-sm">{pod.namespace}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Container Count</div>
                    <div className="flex-1 text-sm">
                      {pod.containers.filter(c => c.status === 'running').length}/{pod.containers.length}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Restart Count</div>
                    <div className="flex-1 text-sm">{pod.restartCount}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 text-sm text-muted-foreground">Age</div>
                    <div className="flex-1 text-sm">{age}d</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pod Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* CPU */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">CPU</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Usage(%)</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{pod.cpuUsage.toFixed(0)}%</span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${pod.cpuUsage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Used</span>
                        <span className="text-sm">{(pod.cpuUsage / 100 * 2).toFixed(2)} core</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Requests</span>
                        <span className="text-sm">0 core</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Limits</span>
                        <span className="text-sm">0 core</span>
                      </div>
                    </div>
                  </div>

                  {/* Memory */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Memory</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Usage(%)</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{pod.memoryUsage.toFixed(0)}%</span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${pod.memoryUsage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Used</span>
                        <span className="text-sm">{(pod.memoryUsage / 100 * 2).toFixed(2)} GiB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Requests</span>
                        <span className="text-sm">0 GiB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Limits</span>
                        <span className="text-sm">0 GiB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Container Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Container Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">Total Count</div>
                    <div className="text-2xl font-bold">{containerStats.total}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">Running Ratio</div>
                    <div className="text-2xl font-bold">{containerStats.runningRatio}%</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">Running</div>
                    <div className="text-2xl font-bold text-green-500">{containerStats.running}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">Waiting</div>
                    <div className="text-2xl font-bold text-yellow-500">{containerStats.waiting}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">Terminated</div>
                    <div className="text-2xl font-bold text-muted-foreground">{containerStats.terminated}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">Failed</div>
                    <div className="text-2xl font-bold text-red-500">{containerStats.failed}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kubernetes Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Kubernetes Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left pb-2 font-medium">Type</th>
                        <th className="text-left pb-2 font-medium">Reason</th>
                        <th className="text-left pb-2 font-medium">Message</th>
                        <th className="text-left pb-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-green-500">Normal</td>
                        <td className="py-2">Scheduled</td>
                        <td className="py-2 text-muted-foreground">Successfully assigned to node</td>
                        <td className="py-2 text-muted-foreground">{new Date(pod.createdAt).toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-green-500">Normal</td>
                        <td className="py-2">Pulled</td>
                        <td className="py-2 text-muted-foreground">Container image pulled successfully</td>
                        <td className="py-2 text-muted-foreground">{new Date(pod.createdAt).toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-green-500">Normal</td>
                        <td className="py-2">Created</td>
                        <td className="py-2 text-muted-foreground">Created container</td>
                        <td className="py-2 text-muted-foreground">{new Date(pod.createdAt).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-green-500">Normal</td>
                        <td className="py-2">Started</td>
                        <td className="py-2 text-muted-foreground">Started container</td>
                        <td className="py-2 text-muted-foreground">{new Date(pod.createdAt).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {conditions.map((condition, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                      <span className="text-xs text-muted-foreground">{condition.name}</span>
                      <Badge className={condition.status ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                        {condition.status ? 'TRUE' : 'FALSE'}
                      </Badge>
                    </div>
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
