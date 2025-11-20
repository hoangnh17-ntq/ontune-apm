'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateWorkerThreadState } from '@/lib/mockData';
import { Activity } from 'lucide-react';

// Generate detailed thread list
function generateThreadDetails(count: number = 15) {
  const states = ['RUNNABLE', 'WAITING', 'TIMED_WAITING', 'BLOCKED'];
  const threads: any[] = [];
  
  for (let i = 0; i < count; i++) {
    threads.push({
      name: `worker-thread-${i + 1}`,
      state: states[Math.floor(Math.random() * states.length)],
      cpuTime: Math.random() * 1000,
      blockedTime: Math.random() * 500
    });
  }
  
  return threads;
}

export default function ThreadStateView() {
  const [threadState, setThreadState] = useState<any[]>([]);

  useEffect(() => {
    const threads = generateThreadDetails();
    setThreadState(threads);
    
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      setThreadState(generateThreadDetails());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const stateColors: Record<string, string> = {
    'RUNNABLE': 'bg-green-500/20 text-green-400 border-green-500/50',
    'WAITING': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    'TIMED_WAITING': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    'BLOCKED': 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  const stateCounts = threadState.reduce((acc, thread) => {
    acc[thread.state] = (acc[thread.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{threadState.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Threads</div>
            </div>
          </CardContent>
        </Card>
        
        {Object.entries(stateCounts).map(([state, count]) => {
          const countValue = count as number;
          return (
            <Card key={state}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{countValue}</div>
                  <div className="text-xs text-muted-foreground mt-1">{state}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Thread List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Worker/Thread State Monitor</CardTitle>
          </div>
          <CardDescription>
            Real-time monitoring of application worker threads and their current states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Thread Name</th>
                  <th className="py-3 px-4 font-medium">State</th>
                  <th className="py-3 px-4 font-medium text-right">CPU Time (ms)</th>
                  <th className="py-3 px-4 font-medium text-right">Blocked Time (ms)</th>
                  <th className="py-3 px-4 font-medium text-right">Wait Count</th>
                </tr>
              </thead>
              <tbody>
                {threadState.map((thread, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs">{thread.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="outline"
                        className={stateColors[thread.state] || ''}
                      >
                        {thread.state}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      {thread.cpuTime.toFixed(0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      {thread.blockedTime.toFixed(0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      {Math.floor(Math.random() * 50)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <div><strong>RUNNABLE:</strong> Thread is executing or ready to execute</div>
            <div><strong>WAITING:</strong> Thread is waiting indefinitely for another thread to perform an action</div>
            <div><strong>TIMED_WAITING:</strong> Thread is waiting for another thread for a specified waiting time</div>
            <div><strong>BLOCKED:</strong> Thread is blocked waiting for a monitor lock</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

