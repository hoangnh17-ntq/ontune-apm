'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Gauge } from 'lucide-react';

type Region = {
  id: string;
  name: string;
  latency: number; // ms
  apdex: number;
  sessions: number;
  x: number; // svg x position
  y: number; // svg y position
};

const regionData: Region[] = [
  { id: 'na', name: 'North America', latency: 320, apdex: 0.94, sessions: 4200, x: 150, y: 110 },
  { id: 'sa', name: 'South America', latency: 540, apdex: 0.81, sessions: 2100, x: 205, y: 200 },
  { id: 'eu', name: 'Europe', latency: 260, apdex: 0.96, sessions: 3600, x: 300, y: 100 },
  { id: 'af', name: 'Africa', latency: 420, apdex: 0.88, sessions: 1800, x: 315, y: 170 },
  { id: 'asia', name: 'Asia', latency: 380, apdex: 0.9, sessions: 5100, x: 430, y: 130 },
  { id: 'au', name: 'Oceania', latency: 290, apdex: 0.93, sessions: 950, x: 500, y: 230 }
];

const mapHeight = 320;
const formatLatency = (value: number) => `${value.toFixed(0)} ms`;

function colorForLatency(latency: number) {
  const min = 200;
  const max = 800;
  const t = Math.min(1, Math.max(0, (latency - min) / (max - min)));
  const r = Math.round(34 + (239 - 34) * t);
  const g = Math.round(197 + (68 - 197) * t);
  const b = Math.round(94 + (68 - 94) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function GeographicPerformanceWidget() {
  const [hoverRegion, setHoverRegion] = useState<Region | null>(null);

  const globalStats = useMemo(() => {
    const totalSessions = regionData.reduce((sum, r) => sum + r.sessions, 0);
    const weightedLatency = regionData.reduce((sum, r) => sum + r.latency * r.sessions, 0) / totalSessions;
    const weightedApdex = regionData.reduce((sum, r) => sum + r.apdex * r.sessions, 0) / totalSessions;
    return {
      totalSessions,
      avgLatency: weightedLatency,
      apdex: weightedApdex
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Performance
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Gauge className="h-4 w-4" />
            Apdex {globalStats.apdex.toFixed(2)} · {formatLatency(globalStats.avgLatency)} avg
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Regional performance heatmap overlayed on world map
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="relative border border-border rounded-lg overflow-hidden bg-slate-950"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(15,23,42,0.80) 0%, rgba(15,23,42,0.93) 100%), url('/world-map.gif')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-x-4 top-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total sessions: {globalStats.totalSessions.toLocaleString('en-US')}</span>
            <span>Latency (ms)</span>
          </div>

          <svg viewBox="0 0 600 320" className="w-full" style={{ height: mapHeight }}>
            {regionData.map(region => (
              <g
                key={region.id}
                className="transition-transform duration-150"
                onMouseEnter={() => setHoverRegion(region)}
                onMouseLeave={() => setHoverRegion(null)}
              >
                <circle
                  cx={region.x}
                  cy={region.y}
                  r={Math.max(10, Math.min(20, Math.sqrt(region.sessions) / 3))}
                  fill={colorForLatency(region.latency)}
                  stroke="#0b1120"
                  strokeWidth={2}
                  opacity={0.9}
                  className="shadow-lg"
                />
                <circle
                  cx={region.x}
                  cy={region.y}
                  r={Math.max(12, Math.min(24, Math.sqrt(region.sessions) / 2.2))}
                  fill="transparent"
                  stroke="white"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                  className="animate-pulse"
                />
                <text x={region.x} y={region.y - 16} fill="white" fontSize="11" fontWeight={600} textAnchor="middle">
                  {region.name}
                </text>
              </g>
            ))}
          </svg>

          <div className="absolute left-4 right-4 bottom-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Legend:</span>
              <span className="w-28 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500" />
              <span className="text-emerald-300">Fast</span>
              <span className="text-amber-300">Moderate</span>
              <span className="text-red-300">Slow</span>
            </div>
            <span className="text-muted-foreground">Demo data • last 24h</span>
          </div>

          {hoverRegion && (
            <div className="pointer-events-none absolute left-6 bottom-6 w-64 rounded-md border border-border/70 bg-slate-900/95 backdrop-blur px-3 py-2 text-sm shadow-lg">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">{hoverRegion.name}</div>
                <Badge variant="secondary">{(hoverRegion.apdex * 100).toFixed(0)} Apdex</Badge>
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Avg latency</span>
                  <span className="text-white">{formatLatency(hoverRegion.latency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessions</span>
                  <span className="text-white">{hoverRegion.sessions.toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
