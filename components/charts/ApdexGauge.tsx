'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ApdexGaugeProps {
  value: number; // 0-100
}

export default function ApdexGauge({ value }: ApdexGaugeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getApdexLabel = (val: number) => {
    if (val >= 80) return { label: 'Excellent', color: '#22c55e' };
    if (val >= 50) return { label: 'Good', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  };

  const status = getApdexLabel(value);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Apdex</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[160px]" />
        </CardContent>
      </Card>
    );
  }

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 200,
      background: 'transparent'
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '65%',
          background: 'transparent'
        },
        track: {
          background: '#374151',
          strokeWidth: '100%'
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '14px',
            color: '#9ca3af',
            offsetY: 40
          },
          value: {
            show: true,
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#fff',
            offsetY: -10,
            formatter: function(val: number) {
              return (val * 100 / 100).toFixed(2);
            }
          }
        }
      }
    },
    colors: [status.color],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [status.color],
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: [status.label]
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Apdex</CardTitle>
          <span className="text-xs text-muted-foreground">ⓘ</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[160px]">
          <Chart
            options={options}
            series={[value]}
            type="radialBar"
            height={200}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </CardContent>
    </Card>
  );
}
