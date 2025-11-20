'use client';

import React, { useState, useCallback } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, Brush, ReferenceArea } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download } from 'lucide-react';

// Custom Crosshair Icon for zoom mode
const CrosshairIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

interface TPSChartProps {
  data: number[];
  title?: string;
  height?: number;
}

export default function TPSChart({ data, title = "TPS", height = 200 }: TPSChartProps) {
  const currentTPS = data[data.length - 1] || 0;
  const avgTPS = data.reduce((a, b) => a + b, 0) / data.length;
  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
  const [zoomData, setZoomData] = useState<{ left: number, right: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [zoomMode, setZoomMode] = useState(false);

  const chartData = data.map((value, index) => ({
    index,
    value
  }));

  const displayData = zoomData 
    ? chartData.slice(zoomData.left, zoomData.right + 1)
    : chartData;

  const handleMouseDown = useCallback((e: any) => {
    if (zoomMode && e?.activeLabel !== undefined) {
      setRefAreaLeft(Number(e.activeLabel));
      setRefAreaRight(Number(e.activeLabel));
      setIsSelecting(true);
    }
  }, [zoomMode]);

  const handleMouseMove = useCallback((e: any) => {
    if (zoomMode && isSelecting && refAreaLeft !== null && e?.activeLabel !== undefined) {
      const activeLabel = Number(e.activeLabel);
      if (activeLabel !== refAreaRight) {
        setRefAreaRight(activeLabel);
      }
    }
  }, [zoomMode, isSelecting, refAreaLeft, refAreaRight]);

  const handleMouseUp = useCallback(() => {
    if (zoomMode && refAreaLeft !== null && refAreaRight !== null && refAreaLeft !== refAreaRight) {
      let left = refAreaLeft;
      let right = refAreaRight;
      if (left > right) [left, right] = [right, left];

      setZoomData({ left, right });
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, [zoomMode, refAreaLeft, refAreaRight]);

  const handleMouseLeave = useCallback(() => {
    if (isSelecting) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      setIsSelecting(false);
    }
  }, [isSelecting]);

  const resetZoom = () => {
    setZoomData(null);
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
          <p className="text-xs font-semibold">{payload[0].value.toFixed(2)} TPS</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold text-blue-400">{currentTPS.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">avg: {avgTPS.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {zoomData && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1"
                onClick={resetZoom}
              >
                <ZoomOut className="h-3 w-3" />
                <span className="text-xs">Reset</span>
              </Button>
            )}
            <Button
              variant={zoomMode ? 'default' : 'ghost'}
              size="sm"
              className="h-7"
              onClick={() => setZoomMode(!zoomMode)}
              title={zoomMode ? 'Zoom mode ON' : 'Zoom mode OFF'}
            >
              <CrosshairIcon className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {zoomMode && (
          <div className="text-[10px] text-green-400 mb-2 flex items-center gap-1 animate-pulse">
            <CrosshairIcon className="h-3 w-3" />
            <span className="font-medium">Zoom mode active</span> - Click and drag to select range
          </div>
        )}
        <div className={`relative ${zoomMode ? 'cursor-crosshair' : ''}`} style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={displayData} 
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="colorTPS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="index" 
                stroke="#9ca3af" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={zoomData ? [zoomData.left, zoomData.right] : ['auto', 'auto']}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorTPS)"
              />
              {refAreaLeft !== null && refAreaRight !== null && zoomMode && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.6}
                  fill="#3b82f6"
                  fillOpacity={0.25}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
