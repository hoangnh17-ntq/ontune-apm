'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, CheckCircle, Globe, Server, Database, TrendingUp } from 'lucide-react';
import { ProjectSummary, Transaction } from '@/types/apm';
import ServiceTopologyMap from './ServiceTopologyMap';

interface ProjectDetailSliderProps {
  project: ProjectSummary | null;
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  onSelectTransaction: (transaction: Transaction) => void;
}

export default function ProjectDetailSlider({ 
  project, 
  transactions, 
  isOpen, 
  onClose, 
  onSelectTransaction 
}: ProjectDetailSliderProps) {

  const getStatusIcon = (status: ProjectSummary['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getApdexColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 200) return 'text-green-400';
    if (time <= 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getErrorRateColor = (rate: number) => {
    if (rate <= 1) return 'text-green-400';
    if (rate <= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!project || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Slider */}
      <div className="relative ml-auto h-full w-full max-w-4xl bg-background shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {getStatusIcon(project.status)}
            <div>
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-sm text-muted-foreground">Project Details</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto p-6 space-y-6">
          {/* Basic Info Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-3 pb-2">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground mb-0.5">Resources</div>
                    <div className="text-lg font-bold text-blue-400">
                      {project.websiteCount + project.wasCount + project.webserverCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {project.websiteCount}W / {project.wasCount}A / {project.webserverCount}S
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-3 pb-2">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground mb-0.5">TPS</div>
                    <div className="text-lg font-bold text-green-400">
                      {project.tps.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-3 pb-2">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground mb-0.5">Apdex Score</div>
                    <div className={`text-lg font-bold ${getApdexColor(project.apdexScore)}`}>
                      {project.apdexScore.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-3 pb-2">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground mb-0.5">Error Rate</div>
                    <div className={`text-lg font-bold ${getErrorRateColor(project.errorRate)}`}>
                      {project.errorRate.toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average</span>
                      <span className={`font-mono font-semibold ${getResponseTimeColor(project.avgResponseTime)}`}>
                        {project.avgResponseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">P95</span>
                      <span className="font-mono text-yellow-400">{(project.avgResponseTime * 1.5).toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">P99</span>
                      <span className="font-mono text-red-400">{(project.avgResponseTime * 2).toFixed(0)}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resource Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">Websites</span>
                      </div>
                      <Badge variant="secondary">{project.websiteCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-green-400" />
                        <span className="text-sm">WAS</span>
                      </div>
                      <Badge variant="secondary">{project.wasCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-orange-400" />
                        <span className="text-sm">Webservers</span>
                      </div>
                      <Badge variant="secondary">{project.webserverCount}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Service Map Topology */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Map Topology</h3>
            <ServiceTopologyMap selectedApp={project?.id || ''} />
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <Card>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted text-xs text-muted-foreground font-medium">
                      <tr>
                        <th className="px-4 py-3 text-left">Time</th>
                        <th className="px-4 py-3 text-left">Endpoint</th>
                        <th className="px-4 py-3 text-right">Response Time</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {transactions.slice(0, 10).map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-t border-border hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => onSelectTransaction(tx)}
                        >
                          <td className="px-4 py-3 font-mono text-xs">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3">{tx.endpoint}</td>
                          <td className={`px-4 py-3 text-right font-mono ${getResponseTimeColor(tx.responseTime)}`}>
                            {tx.responseTime}ms
                          </td>
                          <td className="px-4 py-3">
                            <Badge 
                              variant={tx.status === 'error' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <TrendingUp className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
