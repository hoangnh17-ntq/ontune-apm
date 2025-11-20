'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/apm';
import ContextMenu from '@/components/ui/ContextMenu';
import { Square, Circle } from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
});

interface HitmapScatterPlotProps {
  transactions: Transaction[];
  onNavigate?: (tab: string, action: string) => void;
  onSelectTransaction?: (transaction: Transaction) => void;
}

type MarkerShape = 'circle' | 'square';
type DisplayMode = 'scatter' | 'heatmap';

export default function HitmapScatterPlot({ transactions, onNavigate, onSelectTransaction }: HitmapScatterPlotProps) {
  const [mounted, setMounted] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    transaction: Transaction;
  } | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [markerShape, setMarkerShape] = useState<MarkerShape>('circle');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('scatter');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const now = Date.now();
    const timeWindow = 15 * 60 * 1000; // 15 minutes
    const filteredTxs = transactions.filter(tx => now - tx.timestamp <= timeWindow);

    if (displayMode === 'heatmap') {
      // Heatmap binning mode - aggregate into time/response buckets
      const timeBucketSize = 30 * 1000; // 30 seconds
      const responseBucketSize = 150; // 150ms buckets - wider for better visibility

      const bucketMap = new Map<string, { count: number; transactions: Transaction[]; responseTime: number }>();

      filteredTxs.forEach(tx => {
        const timeBucket = Math.floor((tx.timestamp - (now - timeWindow)) / timeBucketSize);
        const responseBucket = Math.floor(tx.responseTime / responseBucketSize);
        const key = `${timeBucket}-${responseBucket}`;

        if (!bucketMap.has(key)) {
          bucketMap.set(key, {
            count: 0,
            transactions: [],
            responseTime: (responseBucket * responseBucketSize) + (responseBucketSize / 2)
          });
        }
        const bucket = bucketMap.get(key)!;
        bucket.count++;
        bucket.transactions.push(tx);
      });

      // Create series per response time bucket with color metadata
      const responseTimeBuckets = new Map<number, any[]>();

      bucketMap.forEach((bucket, key) => {
        const [timeBucket] = key.split('-').map(Number);
        const timestamp = now - timeWindow + (timeBucket * timeBucketSize) + (timeBucketSize / 2);
        const timeLabel = new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        if (!responseTimeBuckets.has(bucket.responseTime)) {
          responseTimeBuckets.set(bucket.responseTime, []);
        }

        // Use response time scaled for color mapping
        // This ensures color reflects response time (like scatter mode)
        const colorValue = bucket.responseTime / 10; // Scale: 1000ms = value 100

        responseTimeBuckets.get(bucket.responseTime)!.push({
          x: timeLabel,
          y: colorValue, // Use response-time-based value for coloring
          count: bucket.count, // Keep actual count for tooltip
          transaction: bucket.transactions[0],
          transactions: bucket.transactions
        });
      });

      // Convert to series format and limit to top response time ranges for clarity
      let series = Array.from(responseTimeBuckets.entries())
        .sort((a, b) => b[0] - a[0]) // Sort by response time descending
        .map(([responseTime, data]) => ({
          name: `${responseTime.toFixed(0)}ms`,
          responseTime: responseTime,
          data: data.sort((a, b) => a.x.localeCompare(b.x)) // Sort by time
        }));

      // Limit to top 12 response time ranges for better visualization
      if (series.length > 12) {
        // Keep top 12 by data density
        series = series
          .sort((a, b) => {
            const sumA = a.data.reduce((sum, item) => sum + item.y, 0);
            const sumB = b.data.reduce((sum, item) => sum + item.y, 0);
            return sumB - sumA;
          })
          .slice(0, 12)
          .sort((a, b) => b.responseTime - a.responseTime);
      }

      setChartData(series.length > 0 ? series : [{ name: 'No Data', data: [] }]);
    } else {
      // Scatter mode - individual points by status
      const normalData: any[] = [];
      const slowData: any[] = [];
      const verySlowData: any[] = [];
      const errorData: any[] = [];

      filteredTxs.forEach(tx => {
        const point = {
          x: tx.timestamp,
          y: tx.responseTime,
          transaction: tx
        };

        if (tx.status === 'error') {
          errorData.push(point);
        } else if (tx.status === 'very_slow') {
          verySlowData.push(point);
        } else if (tx.status === 'slow') {
          slowData.push(point);
        } else {
          normalData.push(point);
        }
      });

      setChartData([
        { name: 'Normal/Fast', data: normalData },
        { name: 'Slow', data: slowData },
        { name: 'Very Slow', data: verySlowData },
        { name: 'Error', data: errorData },
      ]);
    }
  }, [transactions, displayMode, mounted]);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hitmap - Response Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Initializing chart...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Build options based on display mode
  const getChartOptions = (): ApexOptions => {
    const baseOptions: ApexOptions = {
      chart: {
        height: 300,
        background: 'transparent',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          },
          autoSelected: 'zoom'
        },
        zoom: { enabled: true },
        animations: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        borderColor: '#374151',
        strokeDashArray: 3,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      legend: {
        show: displayMode === 'scatter',
        position: 'bottom',
        horizontalAlign: 'center',
        labels: { colors: '#9ca3af' }
      }
    };

    if (displayMode === 'heatmap') {
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'heatmap',
          events: {
            dataPointSelection: function (event, chartContext, { seriesIndex, dataPointIndex }) {
              try {
                const series = chartData[seriesIndex];
                if (series && series.data && series.data[dataPointIndex]) {
                  const dataPoint = series.data[dataPointIndex];
                  // In heatmap, we have transactions array or single transaction
                  const tx = dataPoint.transaction || (dataPoint.transactions && dataPoint.transactions[0]);
                  if (tx) {
                    // Get click position from chart context
                    const clickEvent = (event as any)?.originalEvent || event;
                    const chartElement = chartContext.w?.globals?.dom?.baseEl;
                    if (chartElement) {
                      const rect = chartElement.getBoundingClientRect();
                      setContextMenu({
                        x: (clickEvent as MouseEvent)?.clientX || rect.left + rect.width / 2,
                        y: (clickEvent as MouseEvent)?.clientY || rect.top + rect.height / 2,
                        transaction: tx
                      });
                    } else {
                      // Fallback to center of chart
                      setContextMenu({
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                        transaction: tx
                      });
                    }
                  }
                }
              } catch (error) {
                console.error('Error handling heatmap click:', error);
              }
            }
          }
        },
        plotOptions: {
          heatmap: {
            shadeIntensity: 0.5,
            radius: 0,
            useFillColorAsStroke: false,
            colorScale: {
              ranges: [
                // Based on response time thresholds matching scatter mode
                // value = responseTime / 10 for better color distribution
                { from: 0, to: 10, color: '#3b82f6', name: 'Fast (0-100ms)' }, // Blue
                { from: 10.01, to: 50, color: '#60a5fa', name: 'Normal (100-500ms)' }, // Light Blue  
                { from: 50.01, to: 100, color: '#93c5fd', name: 'Acceptable (500-1000ms)' }, // Very Light Blue
                { from: 100.01, to: 200, color: '#fbbf24', name: 'Slow (1-2s)' }, // Yellow
                { from: 200.01, to: 300, color: '#fb923c', name: 'Slow (2-3s)' }, // Light Orange
                { from: 300.01, to: 500, color: '#f97316', name: 'Very Slow (3-5s)' }, // Orange
                { from: 500.01, to: 10000, color: '#ef4444', name: 'Critical (5s+)' } // Red
              ]
            }
          }
        },
        xaxis: {
          type: 'category',
          labels: {
            style: { colors: '#9ca3af', fontSize: '11px' }
          },
          axisBorder: { color: '#374151' },
          axisTicks: { color: '#374151' }
        },
        yaxis: {
          title: {
            text: 'Transaction Count',
            style: { color: '#9ca3af' }
          },
          labels: {
            style: { colors: '#9ca3af', fontSize: '11px' }
          },
          axisBorder: { color: '#374151' }
        },
        tooltip: {
          theme: 'dark',
          custom: function ({ seriesIndex, dataPointIndex, w }) {
            try {
              const series = chartData[seriesIndex];
              if (!series || !series.data || !series.data[dataPointIndex]) return '';

              const dataPoint = series.data[dataPointIndex];
              const responseTime = series.responseTime || 0;
              const count = dataPoint.count || 0;

              return `
                <div class="px-3 py-2">
                  <div class="text-xs font-semibold">Response Time: ${responseTime.toFixed(0)}ms</div>
                  <div class="text-xs text-gray-400 mt-1">${count} transaction${count !== 1 ? 's' : ''}</div>
                  <div class="text-xs text-gray-400">Time: ${dataPoint.x}</div>
                </div>
              `;
            } catch (error) {
              console.error('Tooltip error:', error);
              return '';
            }
          }
        }
      };
    }

    // Scatter mode
    return {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        type: 'scatter',
        events: {
          markerClick: function (event, chartContext, { seriesIndex, dataPointIndex }) {
            try {
              const series = chartData[seriesIndex];
              if (series && series.data && series.data[dataPointIndex]) {
                const tx = series.data[dataPointIndex].transaction;
                if (tx) {
                  const clickEvent = event as MouseEvent;
                  setContextMenu({
                    x: clickEvent.clientX || 0,
                    y: clickEvent.clientY || 0,
                    transaction: tx
                  });
                }
              }
            } catch (error) {
              console.error('Error handling marker click:', error);
            }
          },
          dataPointSelection: function (event, chartContext, { seriesIndex, dataPointIndex }) {
            try {
              const series = chartData[seriesIndex];
              if (series && series.data && series.data[dataPointIndex]) {
                const tx = series.data[dataPointIndex].transaction;
                if (tx) {
                  const clickEvent = (event as any)?.originalEvent || event;
                  const chartElement = chartContext.w?.globals?.dom?.baseEl;
                  if (chartElement) {
                    const rect = chartElement.getBoundingClientRect();
                    setContextMenu({
                      x: (clickEvent as MouseEvent)?.clientX || rect.left + rect.width / 2,
                      y: (clickEvent as MouseEvent)?.clientY || rect.top + rect.height / 2,
                      transaction: tx
                    });
                  } else {
                    setContextMenu({
                      x: (clickEvent as MouseEvent)?.clientX || window.innerWidth / 2,
                      y: (clickEvent as MouseEvent)?.clientY || window.innerHeight / 2,
                      transaction: tx
                    });
                  }
                }
              }
            } catch (error) {
              console.error('Error handling data point selection:', error);
            }
          }
        }
      },
      colors: ['#3b82f6', '#f97316', '#ef4444', '#a855f7'],
      markers: {
        size: markerShape === 'square' ? 6 : 4,
        shape: markerShape,
        hover: { size: markerShape === 'square' ? 8 : 6 }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: { colors: '#9ca3af', fontSize: '11px' },
          datetimeFormatter: {
            hour: 'HH:mm'
          }
        },
        axisBorder: { color: '#374151' },
        axisTicks: { color: '#374151' }
      },
      yaxis: {
        title: {
          text: 'Response Time (ms)',
          style: { color: '#9ca3af' }
        },
        labels: {
          style: { colors: '#9ca3af', fontSize: '11px' },
          formatter: function (val) {
            return val ? val.toFixed(0) : '0';
          }
        },
        axisBorder: { color: '#374151' }
      },
      tooltip: {
        theme: 'dark',
        custom: function ({ seriesIndex, dataPointIndex }) {
          try {
            const series = chartData[seriesIndex];
            if (!series || !series.data || !series.data[dataPointIndex]) return '';

            const dataPoint = series.data[dataPointIndex];
            const tx = dataPoint.transaction;

            if (!tx) return '';

            return `
              <div class="px-3 py-2">
                <div class="text-xs font-semibold">${tx.endpoint}</div>
                <div class="text-xs text-gray-400 mt-1">${tx.responseTime.toFixed(0)}ms</div>
                <div class="text-xs text-gray-400">${tx.method}</div>
              </div>
            `;
          } catch (error) {
            console.error('Tooltip error:', error);
            return '';
          }
        }
      }
    };
  };

  const options = getChartOptions();

  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Hitmap - Response Time Distribution</CardTitle>
              <CardDescription className="mt-1">Click any point to view transaction details</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {transactions.length} transactions
            </Badge>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Mode:</span>
              <div className="flex items-center gap-1 border rounded p-0.5">
                <Button
                  variant={displayMode === 'scatter' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setDisplayMode('scatter')}
                  title="Scatter plot - individual points"
                >
                  Scatter
                </Button>
                <Button
                  variant={displayMode === 'heatmap' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setDisplayMode('heatmap')}
                  title="Heatmap - binned aggregation"
                >
                  Heatmap
                </Button>
              </div>
            </div>

            {displayMode === 'scatter' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Shape:</span>
                <div className="flex items-center gap-1 border rounded p-0.5">
                  <Button
                    variant={markerShape === 'circle' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setMarkerShape('circle')}
                  >
                    <Circle className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={markerShape === 'square' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setMarkerShape('square')}
                  >
                    <Square className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length === 0 || !chartData[0] || !chartData[0].data || chartData[0].data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for the selected time range
            </div>
          ) : (
            <Chart
              key={displayMode}
              options={options}
              series={chartData}
              type={displayMode === 'heatmap' ? 'heatmap' : 'scatter'}
              height={300}
            />
          )}
        </div>
      </CardContent>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          transaction={contextMenu.transaction}
          onClose={() => setContextMenu(null)}
          onNavigate={onNavigate}
          onSelectTransaction={onSelectTransaction}
        />
      )}
    </Card>
  );
}
