'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from '@/components/widgets/MetricCard';
import LineChartWidget from '@/components/charts/LineChartWidget';
import GaugeWidget from '@/components/charts/GaugeWidget';
import AreaChartWidget from '@/components/charts/AreaChartWidget';
import { Activity, Server, HardDrive, Network } from 'lucide-react';

export default function WebserverTab() {
    const [requestRate, setRequestRate] = useState<any[]>([]);
    const [traffic, setTraffic] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);

    useEffect(() => {
        // Mock data generation
        const dataPoints = 30;
        const newRequestRate = Array.from({ length: dataPoints }, (_, i) => ({
            time: `${i}:00`,
            req: 1000 + Math.random() * 500,
            error: Math.random() * 50
        }));
        setRequestRate(newRequestRate);

        const newTraffic = Array.from({ length: dataPoints }, (_, i) => ({
            time: `${i}:00`,
            in: 50 + Math.random() * 20,
            out: 80 + Math.random() * 30
        }));
        setTraffic(newTraffic);

        const newConnections = Array.from({ length: dataPoints }, (_, i) => ({
            time: `${i}:00`,
            active: 200 + Math.random() * 50,
            idle: 50 + Math.random() * 10
        }));
        setConnections(newConnections);
    }, []);

    return (
        <div className="space-y-4">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Uptime"
                    value="99.99%"
                    trend="neutral"
                    trendValue="0%"
                    icon={Activity}
                    color="green"
                />
                <MetricCard
                    title="Current Requests"
                    value="1,245"
                    trend="up"
                    trendValue="5%"
                    icon={Server}
                    color="blue"
                />
                <MetricCard
                    title="Active Connections"
                    value="234"
                    trend="up"
                    trendValue="2%"
                    icon={Network}
                    color="purple"
                />
                <MetricCard
                    title="Disk Usage"
                    value="45%"
                    trend="neutral"
                    trendValue="0%"
                    icon={HardDrive}
                    color="orange"
                />
            </div>

            {/* System Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GaugeWidget
                    title="CPU Load"
                    value={45}
                    color="#3b82f6"
                    height={200}
                />
                <GaugeWidget
                    title="Memory Usage"
                    value={60}
                    color="#8b5cf6"
                    height={200}
                />
                <GaugeWidget
                    title="Disk I/O"
                    value={30}
                    color="#f97316"
                    height={200}
                    unit="%"
                />
            </div>

            {/* Traffic & Requests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartWidget
                    title="Request Rate (req/s)"
                    data={requestRate}
                    dataKeys={[
                        { key: 'req', color: '#3b82f6', name: 'Requests' },
                        { key: 'error', color: '#ef4444', name: 'Errors' }
                    ]}
                    height={300}
                />
                <AreaChartWidget
                    title="Network Traffic (MB/s)"
                    data={traffic}
                    dataKey="out"
                    height={300}
                    unit="MB/s"
                    color="#10b981"
                />
            </div>

            {/* Connections */}
            <LineChartWidget
                title="Connection Metrics"
                data={connections}
                dataKeys={[
                    { key: 'active', color: '#8b5cf6', name: 'Active' },
                    { key: 'idle', color: '#9ca3af', name: 'Idle' }
                ]}
                height={250}
            />
        </div>
    );
}
