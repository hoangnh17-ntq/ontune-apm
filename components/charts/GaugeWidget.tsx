'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface GaugeWidgetProps {
    title: string;
    value: number;
    min?: number;
    max?: number;
    unit?: string;
    color?: string;
    height?: number;
}

export default function GaugeWidget({
    title,
    value,
    min = 0,
    max = 100,
    unit = '%',
    color = '#3b82f6',
    height = 200
}: GaugeWidgetProps) {
    const series = [value];

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'radialBar',
            sparkline: {
                enabled: true
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                track: {
                    background: "#e7e7e7",
                    strokeWidth: '97%',
                    margin: 5,
                    dropShadow: {
                        enabled: true,
                        top: 2,
                        left: 0,
                        color: '#999',
                        opacity: 1,
                        blur: 2
                    }
                },
                dataLabels: {
                    name: {
                        show: false
                    },
                    value: {
                        offsetY: -2,
                        fontSize: '22px',
                        formatter: function (val) {
                            return val + unit;
                        }
                    }
                }
            }
        },
        grid: {
            padding: {
                top: -10
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                shadeIntensity: 0.4,
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 50, 53, 91]
            },
            colors: [color]
        },
        labels: ['Average Results'],
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground text-center">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
                    <ReactApexChart options={options} series={series} type="radialBar" height={height + 50} />
                </div>
            </CardContent>
        </Card>
    );
}
