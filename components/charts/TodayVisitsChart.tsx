'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Brush, ReferenceArea } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';

interface VisitData {
  hour: string;
  visits: number;
}

export default function TodayVisitsChart() {
  const [visitData, setVisitData] = useState<VisitData[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [zoomData, setZoomData] = useState<VisitData[] | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [zoomMode, setZoomMode] = useState(false);

  useEffect(() => {
    // Generate mock data for today's visits (24 hours)
    const generateVisits = () => {
      const data: VisitData[] = [];
      let total = 0;
      
      for (let i = 0; i < 24; i++) {
        // Simulate realistic visit patterns
        let baseVisits = 100;
        if (i >= 8 && i <= 10) baseVisits = 350; // Morning peak
        else if (i >= 13 && i <= 15) baseVisits = 280; // Afternoon peak
        else if (i >= 19 && i <= 21) baseVisits = 400; // Evening peak
        else if (i >= 0 && i <= 6) baseVisits = 50; // Night low
        
        const visits = Math.floor(baseVisits + Math.random() * 100);
        total += visits;
        
        data.push({
          hour: `${i.toString().padStart(2, '0')}:00`,
          visits
        });
      }
      
      setVisitData(data);
      setTotalVisits(total);
    };

    generateVisits();
    const interval = setInterval(generateVisits, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const displayData = zoomData || visitData;

  const handleMouseDown = useCallback((e: any) => {
    if (zoomMode && e?.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setRefAreaRight(e.activeLabel);
      setIsSelecting(true);
    }
  }, [zoomMode]);

  const handleMouseMove = useCallback((e: any) => {
    if (zoomMode && isSelecting && refAreaLeft && e?.activeLabel) {
      const activeLabel = e.activeLabel;
      if (activeLabel !== refAreaRight) {
        setRefAreaRight(activeLabel);
      }
    }
  }, [zoomMode, isSelecting, refAreaLeft, refAreaRight]);

  const handleMouseUp = useCallback(() => {
    if (zoomMode && refAreaLeft && refAreaRight) {
      const leftIndex = visitData.findIndex(d => d.hour === refAreaLeft);
      const rightIndex = visitData.findIndex(d => d.hour === refAreaRight);

      if (leftIndex !== -1 && rightIndex !== -1) {
        const [start, end] = leftIndex > rightIndex ? [rightIndex, leftIndex] : [leftIndex, rightIndex];
        setZoomData(visitData.slice(start, end + 1));
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, [zoomMode, refAreaLeft, refAreaRight, visitData]);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Today's Visits</CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-primary">{totalVisits.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-2">total visits today</span>
            </CardDescription>
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
        <div className={`h-[200px] ${zoomMode ? 'cursor-crosshair' : ''}`}>
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
                <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3e4451" />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#3e4451' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#3e4451' }}
                domain={[0, 'auto']}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#6b7280' }}
                contentStyle={{ backgroundColor: '#252932', borderColor: '#3e4451', color: '#fff' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#9ca3af' }}
                formatter={(value: number) => [`${value.toLocaleString()} visits`, 'Visits']}
              />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#visitGradient)"
                animationDuration={300}
                isAnimationActive={false}
              />
              {refAreaLeft && refAreaRight && zoomMode && (
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

