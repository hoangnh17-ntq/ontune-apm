'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ActiveStatus } from '@/types/apm';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TransactionDonutChartProps {
  activeStatus: ActiveStatus[];
  totalActive: number;
  activeFilters?: string[];
  onFilter?: (category: string) => void;
}

interface SegmentData {
  label: string;
  value: number;
  color: string;
  category: 'normal' | 'slow' | 'very-slow';
}

export default function TransactionDonutChart({ activeStatus, totalActive, activeFilters = [], onFilter }: TransactionDonutChartProps) {
  const [mounted, setMounted] = useState(false);
  const [segments, setSegments] = useState<SegmentData[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Create multi-layer segments from activeStatus
    const newSegments: SegmentData[] = [];
    
    activeStatus.forEach(status => {
      // Split each method into speed categories
      const normalCount = Math.floor(status.count * 0.55); // 55% normal (innermost - blue)
      const slowCount = Math.floor(status.count * 0.30); // 30% slow (middle - orange/yellow)
      const verySlowCount = status.count - normalCount - slowCount; // 15% very slow (outermost - red)
      
      // Add segments in order: normal (inner), slow (middle), very slow (outer)
      if (normalCount > 0) {
        newSegments.push({
          label: `${status.method}`,
          value: normalCount,
          color: '#3b82f6', // Blue for normal
          category: 'normal'
        });
      }
      if (slowCount > 0) {
        newSegments.push({
          label: `${status.method}`,
          value: slowCount,
          color: '#fb923c', // Orange for slow
          category: 'slow'
        });
      }
      if (verySlowCount > 0) {
        newSegments.push({
          label: `${status.method}`,
          value: verySlowCount,
          color: '#ef4444', // Red for very slow
          category: 'very-slow'
        });
      }
    });
    
    setSegments(newSegments);
  }, [activeStatus]);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]" />
        </CardContent>
      </Card>
    );
  }

  // Create gradient colors for depth effect
  const colors = segments.map(seg => {
    if (seg.category === 'normal') return '#3b82f6'; // Blue
    if (seg.category === 'slow') return '#fb923c'; // Orange
    return '#ef4444'; // Red
  });

  const series = segments.map(s => s.value);
  const labels = segments.map(s => s.label);

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: 280,
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 400,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      events: {
        dataPointSelection: function(event, chartContext, config) {
          const segment = segments[config.dataPointIndex];
          if (segment && onFilter) {
            onFilter(segment.category);
          }
        }
      }
    },
    colors: colors,
    labels: labels,
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        expandOnClick: true,
        offsetX: 0,
        offsetY: 0,
        customScale: 1,
        donut: {
          size: '75%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              color: '#9ca3af',
              offsetY: 20,
              formatter: function() {
                return 'Active';
              }
            },
            value: {
              show: true,
              fontSize: '36px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              color: '#fff',
              offsetY: -15,
              formatter: function () {
                return totalActive.toString();
              }
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Active',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              color: '#9ca3af',
              formatter: function () {
                return totalActive.toString();
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    stroke: {
      show: true,
      width: 4,
      colors: ['#1f2937'] // Dark border for depth
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: function(value: number, { seriesIndex }) {
          const segment = segments[seriesIndex];
          const category = segment.category === 'normal' ? 'Normal' : 
                          segment.category === 'slow' ? 'Slow' : 'Very Slow';
          return `${value} (${category})`;
        }
      }
    },
    states: {
      hover: {
        filter: {
          type: 'lighten'
        }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'darken'
        }
      }
    }
  };

  // Calculate totals by category
  const normalTotal = segments.filter(s => s.category === 'normal').reduce((sum, s) => sum + s.value, 0);
  const slowTotal = segments.filter(s => s.category === 'slow').reduce((sum, s) => sum + s.value, 0);
  const verySlowTotal = segments.filter(s => s.category === 'very-slow').reduce((sum, s) => sum + s.value, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Active Transaction
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs border border-muted-foreground rounded-full text-muted-foreground">
              i
            </span>
          </CardTitle>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">demo-8104</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Active</span>
          <span className="text-sm font-semibold">{totalActive}</span>
        </div>
        
        <div className="h-[280px] flex items-center justify-center">
          <Chart
            options={options}
            series={series}
            type="donut"
            height={280}
            width="100%"
          />
        </div>

        {/* Speed Legend - Clickable */}
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <div 
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
              activeFilters.includes('very-slow') ? 'bg-red-500/20 border border-red-500' : 'hover:bg-muted'
            }`}
            onClick={() => onFilter?.('very-slow')}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Very Slow</span>
            </div>
            <span className="text-xs font-semibold">{verySlowTotal}</span>
          </div>
          <div 
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
              activeFilters.includes('slow') ? 'bg-orange-400/20 border border-orange-400' : 'hover:bg-muted'
            }`}
            onClick={() => onFilter?.('slow')}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-orange-400"></div>
              <span className="text-xs text-muted-foreground">Slow</span>
            </div>
            <span className="text-xs font-semibold">{slowTotal}</span>
          </div>
          <div 
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
              activeFilters.includes('normal') ? 'bg-blue-500/20 border border-blue-500' : 'hover:bg-muted'
            }`}
            onClick={() => onFilter?.('normal')}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
              <span className="text-xs text-muted-foreground">Normal</span>
            </div>
            <span className="text-xs font-semibold">{normalTotal}</span>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="text-primary">{activeFilters.length} filter(s) active</span> - Click to toggle
          </div>
        )}
      </CardContent>
    </Card>
  );
}
