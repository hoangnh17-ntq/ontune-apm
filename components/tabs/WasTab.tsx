'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from '@/components/widgets/MetricCard';
import LineChartWidget from '@/components/charts/LineChartWidget';
import GaugeWidget from '@/components/charts/GaugeWidget';
import LogTableWidget from '@/components/widgets/LogTableWidget';
import { Activity, Server, AlertCircle, Clock, Database } from 'lucide-react';
import { generateJVMMetrics, generateWasSummaries } from '@/lib/mockData';
import WasListWidget from '@/components/monitor/WasListWidget';
import WasDetailSlider from '@/components/monitor/WasDetailSlider';
import { WasSummary } from '@/types/apm';

export default function WasTab() {
    const [jvmMetrics, setJvmMetrics] = useState<any[]>([]);
    const [responseTimes, setResponseTimes] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [wasList] = useState<WasSummary[]>(() => generateWasSummaries(8));
    const [selectedWas, setSelectedWas] = useState<WasSummary | null>(null);
    const [showWasDetail, setShowWasDetail] = useState(false);

    useEffect(() => {
        // Mock data generation
        const dataPoints = 30;
        const newJvmMetrics = Array.from({ length: dataPoints }, (_, i) => ({
            time: `${i}:00`,
            cpu: 20 + Math.random() * 30,
            memory: 40 + Math.random() * 20,
            gc: Math.random() * 100
        }));
        setJvmMetrics(newJvmMetrics);

        const newResponseTimes = Array.from({ length: dataPoints }, (_, i) => ({
            time: `${i}:00`,
            avg: 100 + Math.random() * 50,
            p95: 200 + Math.random() * 100,
            p99: 300 + Math.random() * 150
        }));
        setResponseTimes(newResponseTimes);

        setLogs([
            { id: 1, timestamp: '10:00:01', level: 'ERROR', message: 'Connection timeout', source: 'OrderService' },
            { id: 2, timestamp: '10:00:05', level: 'WARN', message: 'High memory usage', source: 'JVM' },
            { id: 3, timestamp: '10:01:12', level: 'INFO', message: 'Service started', source: 'PaymentService' },
            { id: 4, timestamp: '10:02:30', level: 'ERROR', message: 'NullPointerException', source: 'UserService' },
            { id: 5, timestamp: '10:03:45', level: 'INFO', message: 'Cache cleared', source: 'CacheManager' },
        ]);
    }, []);

    const currentJvm = jvmMetrics[jvmMetrics.length - 1] || { cpu: 0, memory: 0 };

    return (
        <div className="space-y-4">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="App Health"
                    value="98%"
                    trend="up"
                    trendValue="1%"
                    icon={Activity}
                    color="green"
                />
                <MetricCard
                    title="Error Rate"
                    value="0.5%"
                    trend="down"
                    trendValue="0.2%"
                    icon={AlertCircle}
                    color="red"
                />
                <MetricCard
                    title="Peak Load"
                    value="450 req/s"
                    trend="up"
                    trendValue="12%"
                    icon={Server}
                    color="blue"
                />
                <MetricCard
                    title="Session Waits"
                    value="12"
                    trend="neutral"
                    trendValue="0"
                    icon={Clock}
                    color="orange"
                />
            </div>

            <WasListWidget
                wasList={wasList}
                onSelect={(was) => setSelectedWas(was)}
                onDetail={(was) => {
                    setSelectedWas(was);
                    setShowWasDetail(true);
                }}
            />

            {/* JVM Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GaugeWidget
                    title="CPU Utilization"
                    value={Math.round(currentJvm.cpu)}
                    color="#3b82f6"
                    height={200}
                />
                <GaugeWidget
                    title="Memory Usage"
                    value={Math.round(currentJvm.memory)}
                    color="#8b5cf6"
                    height={200}
                />
                <LineChartWidget
                    title="GC Activity (ms)"
                    data={jvmMetrics}
                    dataKeys={[{ key: 'gc', color: '#f59e0b', name: 'GC Time' }]}
                    height={250}
                    unit="ms"
                />
            </div>

            {/* Response Time & Throughput */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartWidget
                    title="Response Time (ms)"
                    data={responseTimes}
                    dataKeys={[
                        { key: 'avg', color: '#3b82f6', name: 'Avg' },
                        { key: 'p95', color: '#f59e0b', name: 'P95' },
                        { key: 'p99', color: '#ef4444', name: 'P99' }
                    ]}
                    height={300}
                    unit="ms"
                />
                <LogTableWidget
                    title="Recent Error Logs"
                    logs={logs}
                    height={300}
                />
            </div>

            <WasDetailSlider
                was={selectedWas}
                isOpen={showWasDetail && !!selectedWas}
                onClose={() => setShowWasDetail(false)}
            />
        </div>
    );
}
