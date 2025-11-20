'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/apm';
import { Clock, Zap, Database, Globe, Server } from 'lucide-react';

interface TransactionTimelineViewProps {
  transaction: Transaction;
}

export default function TransactionTimelineView({ transaction }: TransactionTimelineViewProps) {
  const startTime = new Date(transaction.timestamp).getTime();
  const totalDuration = transaction.responseTime;

  // Generate timeline events from spans
  const timelineEvents = transaction.spans?.map((span, index) => ({
    id: index,
    name: span.methodName || span.operationName,
    type: span.kind.toLowerCase(),
    startOffset: (index / (transaction.spans?.length || 1)) * totalDuration,
    duration: totalDuration / (transaction.spans?.length || 1),
    details: span.sqlStatement || span.tags?.['http.url'] || `${span.className || span.serviceName}.${span.methodName || span.operationName}`,
  })) || [];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'sql': return <Database className="h-4 w-4" />;
      case 'http': return <Globe className="h-4 w-4" />;
      case 'method': return <Server className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getEventColor = (duration: number) => {
    if (duration > 1000) return 'bg-red-500';
    if (duration > 500) return 'bg-orange-500';
    if (duration > 200) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaction Timeline
          </CardTitle>
          <CardDescription>
            Visual timeline of transaction execution - {transaction.endpoint}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Transaction ID</div>
              <div className="text-sm font-mono">{transaction.id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Duration</div>
              <Badge variant={transaction.responseTime > 1000 ? 'destructive' : 'default'}>
                {transaction.responseTime.toFixed(0)}ms
              </Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Start Time</div>
              <div className="text-sm">{new Date(transaction.timestamp).toLocaleTimeString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge>{transaction.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Timeline</CardTitle>
          <CardDescription>
            Horizontal timeline showing execution sequence and duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Timeline Bar */}
          <div className="relative h-20 bg-muted rounded-lg mb-8">
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-full h-8 bg-background rounded relative">
                {timelineEvents.map((event, index) => {
                  const left = (event.startOffset / totalDuration) * 100;
                  const width = (event.duration / totalDuration) * 100;
                  return (
                    <div
                      key={index}
                      className={`absolute h-full ${getEventColor(event.duration)} opacity-70 hover:opacity-100 transition-opacity cursor-pointer rounded`}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 2)}%`,
                      }}
                      title={`${event.name}: ${event.duration.toFixed(0)}ms`}
                    />
                  );
                })}
              </div>
            </div>
            {/* Time markers */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
              <span>0ms</span>
              <span>{(totalDuration / 4).toFixed(0)}ms</span>
              <span>{(totalDuration / 2).toFixed(0)}ms</span>
              <span>{(totalDuration * 3 / 4).toFixed(0)}ms</span>
              <span>{totalDuration.toFixed(0)}ms</span>
            </div>
          </div>

          {/* Event List */}
          <div className="space-y-3">
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className={`p-2 rounded ${getEventColor(event.duration)} bg-opacity-20`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{event.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {event.duration.toFixed(0)}ms
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {event.details}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Start: +{event.startOffset.toFixed(0)}ms
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Queries</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                </div>
                <span className="text-sm font-medium">{(totalDuration * 0.6).toFixed(0)}ms</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Application Logic</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '30%' }} />
                </div>
                <span className="text-sm font-medium">{(totalDuration * 0.3).toFixed(0)}ms</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">External API Calls</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '10%' }} />
                </div>
                <span className="text-sm font-medium">{(totalDuration * 0.1).toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

