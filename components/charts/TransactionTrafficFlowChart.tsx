'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/apm';
import { ArrowRight, ArrowLeft, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TransactionTrafficFlowChartProps {
  transactions: Transaction[];
}

interface FlowData {
  timestamp: number;
  inbound: number;
  outbound: number;
  avgInboundSpeed: number;
  avgOutboundSpeed: number;
  fastIn: number;
  slowIn: number;
  fastOut: number;
  slowOut: number;
}

export default function TransactionTrafficFlowChart({ transactions }: TransactionTrafficFlowChartProps) {
  const [flowData, setFlowData] = useState<FlowData[]>([]);
  const [currentFlow, setCurrentFlow] = useState({ inbound: 0, outbound: 0, speed: 0 });

  useEffect(() => {
    const now = Date.now();
    const bucketSize = 3000; // 3 seconds
    const timeWindow = 60 * 1000; // 1 minute
    const buckets = new Map<number, FlowData>();

    transactions.forEach(tx => {
      if (now - tx.timestamp <= timeWindow) {
        const bucketKey = Math.floor(tx.timestamp / bucketSize) * bucketSize;
        if (!buckets.has(bucketKey)) {
          buckets.set(bucketKey, {
            timestamp: bucketKey,
            inbound: 0,
            outbound: 0,
            avgInboundSpeed: 0,
            avgOutboundSpeed: 0,
            fastIn: 0,
            slowIn: 0,
            fastOut: 0,
            slowOut: 0
          });
        }
        const bucket = buckets.get(bucketKey)!;
        
        // Simulate inbound/outbound (in real app, this would be based on request direction)
        if (Math.random() > 0.5) {
          bucket.inbound++;
          bucket.avgInboundSpeed += tx.responseTime;
          if (tx.responseTime < 1000) bucket.fastIn++;
          else bucket.slowIn++;
        } else {
          bucket.outbound++;
          bucket.avgOutboundSpeed += tx.responseTime;
          if (tx.responseTime < 1000) bucket.fastOut++;
          else bucket.slowOut++;
        }
      }
    });

    // Calculate averages
    buckets.forEach(bucket => {
      if (bucket.inbound > 0) bucket.avgInboundSpeed /= bucket.inbound;
      if (bucket.outbound > 0) bucket.avgOutboundSpeed /= bucket.outbound;
    });

    const data = Array.from(buckets.values()).sort((a, b) => a.timestamp - b.timestamp);
    setFlowData(data);

    // Set current flow (most recent bucket)
    if (data.length > 0) {
      const latest = data[data.length - 1];
      setCurrentFlow({
        inbound: latest.inbound,
        outbound: latest.outbound,
        speed: (latest.avgInboundSpeed + latest.avgOutboundSpeed) / 2
      });
    }
  }, [transactions]);

  const maxFlow = Math.max(...flowData.map(d => Math.max(d.inbound, d.outbound)), 1);

  const getFlowColor = (speed: number) => {
    if (speed < 500) return 'bg-green-500';
    if (speed < 1500) return 'bg-blue-500';
    if (speed < 3000) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getFlowIntensity = (count: number) => {
    const intensity = (count / maxFlow) * 100;
    if (intensity > 75) return 'high';
    if (intensity > 40) return 'medium';
    return 'low';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Transaction Traffic Flow
            </CardTitle>
            <CardDescription>Real-time traffic visualization - like road network flow</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">In: {currentFlow.inbound}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Out: {currentFlow.outbound}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Avg: {currentFlow.speed.toFixed(0)}ms
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Traffic Flow Visualization */}
        <div className="relative h-[300px] bg-muted/20 rounded-lg overflow-hidden border border-border">
          {/* Center Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border z-0" />
          
          {/* Time Labels */}
          <div className="absolute top-2 left-2 text-xs text-muted-foreground">
            Last 60 seconds
          </div>
          
          {/* Direction Labels */}
          <div className="absolute left-4 top-1/4 flex items-center gap-2 text-xs font-semibold text-green-500">
            <ArrowRight className="h-3 w-3" />
            <span>INBOUND</span>
          </div>
          <div className="absolute left-4 bottom-1/4 flex items-center gap-2 text-xs font-semibold text-blue-500">
            <ArrowLeft className="h-3 w-3" />
            <span>OUTBOUND</span>
          </div>

          {/* Flow Streams */}
          <div className="absolute inset-0 flex items-center justify-between px-8">
            {flowData.map((data, index) => {
              const inboundHeight = (data.inbound / maxFlow) * 40; // max 40% of half
              const outboundHeight = (data.outbound / maxFlow) * 40;
              const inboundColor = getFlowColor(data.avgInboundSpeed);
              const outboundColor = getFlowColor(data.avgOutboundSpeed);
              const intensity = getFlowIntensity(Math.max(data.inbound, data.outbound));

              return (
                <div key={index} className="relative h-full flex flex-col items-center justify-center" style={{ width: `${100 / flowData.length}%` }}>
                  {/* Inbound Flow (Top Half) */}
                  <div className="absolute top-1/2 w-full flex flex-col items-center" style={{ transform: 'translateY(-100%)' }}>
                    <div
                      className={`w-full ${inboundColor} opacity-70 transition-all duration-300 rounded-t`}
                      style={{ 
                        height: `${inboundHeight}px`,
                        boxShadow: intensity === 'high' ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none',
                        animation: intensity === 'high' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                      }}
                    >
                      {/* Flow Animation Lines */}
                      {data.inbound > 0 && (
                        <div className="relative h-full overflow-hidden">
                          {[...Array(Math.min(data.inbound, 5))].map((_, i) => (
                            <div
                              key={i}
                              className="absolute h-px bg-white/50"
                              style={{
                                width: '100%',
                                top: `${(i / 5) * 100}%`,
                                animation: `flowRight 1.5s linear infinite`,
                                animationDelay: `${i * 0.2}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Fast/Slow Indicator */}
                    {data.inbound > 0 && (
                      <div className="flex gap-1 mt-1">
                        {data.fastIn > 0 && (
                          <div className="w-1 h-1 rounded-full bg-green-400" title={`${data.fastIn} fast`} />
                        )}
                        {data.slowIn > 0 && (
                          <div className="w-1 h-1 rounded-full bg-red-400" title={`${data.slowIn} slow`} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Outbound Flow (Bottom Half) */}
                  <div className="absolute top-1/2 w-full flex flex-col items-center">
                    <div
                      className={`w-full ${outboundColor} opacity-70 transition-all duration-300 rounded-b`}
                      style={{ 
                        height: `${outboundHeight}px`,
                        boxShadow: intensity === 'high' ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
                        animation: intensity === 'high' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                      }}
                    >
                      {/* Flow Animation Lines */}
                      {data.outbound > 0 && (
                        <div className="relative h-full overflow-hidden">
                          {[...Array(Math.min(data.outbound, 5))].map((_, i) => (
                            <div
                              key={i}
                              className="absolute h-px bg-white/50"
                              style={{
                                width: '100%',
                                top: `${(i / 5) * 100}%`,
                                animation: `flowLeft 1.5s linear infinite`,
                                animationDelay: `${i * 0.2}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Fast/Slow Indicator */}
                    {data.outbound > 0 && (
                      <div className="flex gap-1 mt-1">
                        {data.fastOut > 0 && (
                          <div className="w-1 h-1 rounded-full bg-green-400" title={`${data.fastOut} fast`} />
                        )}
                        {data.slowOut > 0 && (
                          <div className="w-1 h-1 rounded-full bg-red-400" title={`${data.slowOut} slow`} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Flow Speed</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Fast (&lt;500ms)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span>Normal (&lt;1.5s)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span>Slow (&lt;3s)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Critical (&gt;3s)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Traffic Intensity</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-[10px]">High Traffic</span>
                <span className="text-[10px] text-muted-foreground">&gt;75%</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded">
                <Activity className="h-3 w-3 text-blue-500" />
                <span className="text-[10px]">Medium</span>
                <span className="text-[10px] text-muted-foreground">40-75%</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded">
                <TrendingDown className="h-3 w-3 text-gray-500" />
                <span className="text-[10px]">Low</span>
                <span className="text-[10px] text-muted-foreground">&lt;40%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animation Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes flowRight {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateX(100%);
              opacity: 0;
            }
          }

          @keyframes flowLeft {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateX(-100%);
              opacity: 0;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.7;
            }
            50% {
              opacity: 1;
            }
          }
        `}} />
      </CardContent>
    </Card>
  );
}

