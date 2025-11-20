'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Database, 
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

type ReportSubTab = 'service' | 'transaction' | 'error' | 'capacity' | 'custom';

interface ReportTabProps {
  activeAction?: string;
}

export default function ReportTab({ activeAction }: ReportTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<ReportSubTab>('service');

  const subTabs = [
    { id: 'service' as ReportSubTab, label: 'Service Report', icon: Activity },
    { id: 'transaction' as ReportSubTab, label: 'Transaction Report', icon: TrendingUp },
    { id: 'error' as ReportSubTab, label: 'Error Report', icon: AlertCircle },
    { id: 'capacity' as ReportSubTab, label: 'Capacity Report', icon: Database },
    { id: 'custom' as ReportSubTab, label: 'Custom Report', icon: FileText },
  ];

  const serviceReports = [
    {
      name: 'Daily Service Summary',
      description: 'Overview of all services performance in the last 24 hours',
      schedule: 'Daily at 00:00',
      lastGenerated: '2024-08-08 00:00:00',
      format: 'PDF, Excel'
    },
    {
      name: 'Weekly Performance Trend',
      description: 'Weekly trend analysis of service metrics',
      schedule: 'Weekly on Monday',
      lastGenerated: '2024-08-05 09:00:00',
      format: 'PDF'
    },
    {
      name: 'Monthly SLA Compliance',
      description: 'SLA compliance report for all services',
      schedule: 'Monthly on 1st',
      lastGenerated: '2024-08-01 08:00:00',
      format: 'Excel, PDF'
    }
  ];

  const transactionReports = [
    {
      name: 'Top Slowest Transactions',
      description: 'List of slowest transactions with detailed analysis',
      period: 'Last 7 days',
      count: 125,
      avgResponseTime: 2450
    },
    {
      name: 'High Traffic Endpoints',
      description: 'Most frequently called endpoints',
      period: 'Last 24 hours',
      count: 45,
      totalCalls: 125000
    },
    {
      name: 'Transaction Distribution',
      description: 'Distribution of transactions by response time',
      period: 'Last 30 days',
      count: 5420,
      avgResponseTime: 380
    }
  ];

  const errorReports = [
    {
      type: 'HTTP 500 Errors',
      count: 45,
      trend: '+12%',
      topEndpoint: '/api/users/profile',
      lastOccurrence: '2 minutes ago'
    },
    {
      type: 'SQL Exceptions',
      count: 23,
      trend: '-5%',
      topEndpoint: '/api/orders/create',
      lastOccurrence: '15 minutes ago'
    },
    {
      type: 'Timeout Errors',
      count: 67,
      trend: '+28%',
      topEndpoint: '/api/external/payment',
      lastOccurrence: '5 minutes ago'
    }
  ];

  const capacityMetrics = [
    {
      resource: 'CPU Usage',
      current: 65,
      average: 52,
      peak: 89,
      threshold: 80,
      status: 'healthy'
    },
    {
      resource: 'Memory Usage',
      current: 78,
      average: 71,
      peak: 92,
      threshold: 85,
      status: 'warning'
    },
    {
      resource: 'Active Connections',
      current: 450,
      average: 380,
      peak: 780,
      threshold: 1000,
      status: 'healthy'
    },
    {
      resource: 'Thread Pool',
      current: 85,
      average: 65,
      peak: 95,
      threshold: 90,
      status: 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {subTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeSubTab === tab.id ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setActiveSubTab(tab.id)}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Report */}
      {activeSubTab === 'service' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Performance Reports</CardTitle>
                  <CardDescription>Scheduled and on-demand service reports</CardDescription>
                </div>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Generate New Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceReports.map((report, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-2">{report.name}</div>
                        <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Schedule:</span>
                            <Badge variant="outline">{report.schedule}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Format:</span>
                            <Badge variant="outline">{report.format}</Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Last generated: {report.lastGenerated}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction Report */}
      {activeSubTab === 'transaction' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction Analysis Reports</CardTitle>
                  <CardDescription>Detailed transaction performance analysis</CardDescription>
                </div>
                <Button className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Create Custom Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactionReports.map((report, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{report.name}</div>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        </div>
                        <Badge>{report.period}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{report.count}</div>
                          <div className="text-xs text-muted-foreground">Transactions</div>
                        </div>
                        {'avgResponseTime' in report && (
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{report.avgResponseTime}ms</div>
                            <div className="text-xs text-muted-foreground">Avg Response Time</div>
                          </div>
                        )}
                        {'totalCalls' in report && report.totalCalls && (
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{report.totalCalls.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Total Calls</div>
                          </div>
                        )}
                        <div className="text-center">
                          <Button size="sm" variant="outline" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Report */}
      {activeSubTab === 'error' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Error Analysis & Trends</CardTitle>
                  <CardDescription>Track and analyze application errors</CardDescription>
                </div>
                <Button className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Export Error Log
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {errorReports.map((error, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <div className="font-semibold">{error.type}</div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Count:</span>
                              <span className="font-semibold">{error.count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Trend:</span>
                              <Badge variant={error.trend.startsWith('+') ? 'destructive' : 'default'}>
                                {error.trend}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Top Endpoint:</span>
                              <code className="text-xs bg-muted px-2 py-1 rounded">{error.topEndpoint}</code>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last:</span>
                              <span className="text-xs">{error.lastOccurrence}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        View Error Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Capacity Report */}
      {activeSubTab === 'capacity' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Capacity & Resource Utilization</CardTitle>
                  <CardDescription>Monitor resource usage and plan capacity</CardDescription>
                </div>
                <Button className="gap-2">
                  <PieChart className="h-4 w-4" />
                  Generate Forecast
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capacityMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Database className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-semibold">{metric.resource}</div>
                            <Badge variant={metric.status === 'healthy' ? 'default' : 'destructive'} className="mt-1">
                              {metric.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{metric.current}%</div>
                          <div className="text-xs text-muted-foreground">Current</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-semibold">{metric.average}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Peak:</span>
                          <span className="font-semibold">{metric.peak}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Threshold:</span>
                          <span className="font-semibold">{metric.threshold}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                metric.current >= metric.threshold ? 'bg-red-500' :
                                metric.current >= metric.threshold * 0.8 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${metric.current}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom Report */}
      {activeSubTab === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle>Create Custom Report</CardTitle>
            <CardDescription>Build a custom report with selected metrics and time range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Report Name</label>
              <Input placeholder="Enter report name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Time Range</label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Custom range</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Metrics to Include</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Transaction Count</span>
                </label>
                <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Response Time</span>
                </label>
                <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                  <input type="checkbox" />
                  <span className="text-sm">Error Rate</span>
                </label>
                <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                  <input type="checkbox" />
                  <span className="text-sm">CPU Usage</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1">Generate Report</Button>
              <Button variant="outline">Schedule</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
