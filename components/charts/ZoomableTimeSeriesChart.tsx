'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea
} from 'recharts';
import { RotateCcw, Download } from 'lucide-react';

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

interface ZoomableTimeSeriesChartProps {
  title: string;
  data: any[];
  dataKeys: { key: string; name: string; color: string; }[];
  xAxisKey?: string;
  yAxisLabel?: string;
  chartType?: 'line' | 'area';
  showBrush?: boolean;
  height?: number;
}

export default function ZoomableTimeSeriesChart({
  title,
  data,
  dataKeys,
  xAxisKey = 'time',
  yAxisLabel,
  chartType = 'area',
  showBrush = true,
  height = 300
}: ZoomableTimeSeriesChartProps) {
  const [refAreaLeft, setRefAreaLeft] = useState<string | number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | number | null>(null);
  const [zoomData, setZoomData] = useState(data);
  const [left, setLeft] = useState<number | string>('dataMin');
  const [right, setRight] = useState<number | string>('dataMax');
  const [isSelecting, setIsSelecting] = useState(false);
  const [zoomMode, setZoomMode] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const getIndexFromCoordinate = useCallback((x: number, chartWidth: number) => {
    if (!chartContainerRef.current) return -1;
    
    const chartRect = chartContainerRef.current.getBoundingClientRect();
    const chartLeft = chartRect.left;
    const relativeX = x - chartLeft;
    const percentage = relativeX / chartWidth;
    
    // Calculate which data point corresponds to this x position
    const index = Math.round(percentage * (zoomData.length - 1));
    return Math.max(0, Math.min(index, zoomData.length - 1));
  }, [zoomData]);

  const handleMouseDown = useCallback((e: any) => {
    if (zoomMode && e?.activeLabel) {
      const activeLabel = e.activeLabel;
      setRefAreaLeft(activeLabel);
      setRefAreaRight(activeLabel);
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
      const leftValue = String(refAreaLeft);
      const rightValue = String(refAreaRight);
      
      const leftIndex = zoomData.findIndex(d => String(d[xAxisKey]) === leftValue);
      const rightIndex = zoomData.findIndex(d => String(d[xAxisKey]) === rightValue);

      if (leftIndex !== -1 && rightIndex !== -1) {
        const [start, end] = leftIndex > rightIndex ? [rightIndex, leftIndex] : [leftIndex, rightIndex];
        
        // Map back to original data
        const startValue = zoomData[start][xAxisKey];
        const endValue = zoomData[end][xAxisKey];
        
        const originalStartIndex = data.findIndex(d => String(d[xAxisKey]) === String(startValue));
        const originalEndIndex = data.findIndex(d => String(d[xAxisKey]) === String(endValue));
        
        if (originalStartIndex !== -1 && originalEndIndex !== -1) {
          const [originalStart, originalEnd] = originalStartIndex > originalEndIndex 
            ? [originalEndIndex, originalStartIndex] 
            : [originalStartIndex, originalEndIndex];
          
          const newData = data.slice(originalStart, originalEnd + 1);
          
          if (newData.length > 0) {
            setZoomData(newData);
            setLeft(newData[0][xAxisKey]);
            setRight(newData[newData.length - 1][xAxisKey]);
          }
        }
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, [zoomMode, refAreaLeft, refAreaRight, zoomData, data, xAxisKey]);

  const handleMouseLeave = useCallback(() => {
    if (isSelecting) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      setIsSelecting(false);
    }
  }, [isSelecting]);

  const handleReset = () => {
    setZoomData(data);
    setLeft('dataMin');
    setRight('dataMax');
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex gap-2">
            {(left !== 'dataMin' || right !== 'dataMax') && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant={zoomMode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setZoomMode(!zoomMode)}
              title={zoomMode ? 'Zoom mode ON: Click and drag to select range' : 'Zoom mode OFF: Click to enable'}
            >
              <CrosshairIcon className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
          {zoomMode && (
            <div className="text-xs text-green-400 flex items-center gap-1 animate-pulse">
              <CrosshairIcon className="h-3 w-3" />
              <span className="font-medium">Zoom mode active</span> - Click and drag to select time range
            </div>
          )}
      </CardHeader>
      <CardContent>
                    <div 
                      ref={chartContainerRef}
                      className={`relative ${zoomMode ? 'cursor-crosshair' : ''}`}
                      style={{ height: `${height}px`, width: '100%' }}
                    >
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent
              data={zoomData}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                domain={[left, right]}
                allowDataOverflow
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11 } } : undefined}
                allowDataOverflow
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              {dataKeys.map((dk) => {
                if (chartType === 'area') {
                  return (
                    <Area
                      key={dk.key}
                      type="monotone"
                      dataKey={dk.key}
                      name={dk.name}
                      stroke={dk.color}
                      fill={dk.color}
                      fillOpacity={0.3}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  );
                } else {
                  return (
                    <Line
                      key={dk.key}
                      type="monotone"
                      dataKey={dk.key}
                      name={dk.name}
                      stroke={dk.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  );
                }
              })}
                  {refAreaLeft && refAreaRight && zoomMode && (
                    <ReferenceArea
                      x1={refAreaLeft}
                      x2={refAreaRight}
                      strokeOpacity={0.6}
                      fill="hsl(var(--primary))"
                      fillOpacity={0.25}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

