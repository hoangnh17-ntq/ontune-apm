'use client';

import React, { useState, useEffect } from 'react';
import TodayVisitsChart from '@/components/charts/TodayVisitsChart';
import ConcurrentUsersChart from '@/components/charts/ConcurrentUsersChart';
import BrowserMetricsWidget from '@/components/widgets/BrowserMetricsWidget';
import LineChartWidget from '@/components/charts/LineChartWidget';
import MetricCard from '@/components/widgets/MetricCard';
import { Activity, AlertTriangle, FileWarning } from 'lucide-react';
import WebsiteListWidget from '@/components/monitor/WebsiteListWidget';
import WebsiteDetailSlider from '@/components/monitor/WebsiteDetailSlider';
import { WebsiteSummary } from '@/types/apm';
import { generateWebsiteSummaries } from '@/lib/mockData';
import GeographicPerformanceWidget from '@/components/widgets/GeographicPerformanceWidget';

export default function RumTab() {
    const [jsErrors, setJsErrors] = useState<any[]>([]);
    const [httpErrors, setHttpErrors] = useState<any[]>([]);
    const [websites] = useState<WebsiteSummary[]>(() => generateWebsiteSummaries(8));
    const [selectedWebsite, setSelectedWebsite] = useState<WebsiteSummary | null>(null);
    const [showWebsiteDetail, setShowWebsiteDetail] = useState(false);

    useEffect(() => {
        const generateErrorData = () => {
            return Array.from({ length: 24 }, (_, i) => ({
                time: `${i}:00`,
                count: Math.floor(Math.random() * 20)
            }));
        };
        setJsErrors(generateErrorData());
        setHttpErrors(generateErrorData());
    }, []);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Page Load Time" value="1.2s" trend="up" trendValue="5%" icon={Activity} color="blue" />
                <MetricCard title="DOMContentLoaded" value="0.8s" trend="up" trendValue="2%" icon={Activity} color="green" />
                <MetricCard title="JS Errors" value="12" trend="down" trendValue="10%" icon={AlertTriangle} color="red" />
                <MetricCard title="HTTP Errors" value="5" trend="neutral" trendValue="0%" icon={FileWarning} color="orange" />
            </div>

            <WebsiteListWidget
                websites={websites}
                onSelect={(w) => setSelectedWebsite(w)}
                onDetail={(w) => {
                    setSelectedWebsite(w);
                    setShowWebsiteDetail(true);
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TodayVisitsChart />
                <ConcurrentUsersChart />
            </div>

            <GeographicPerformanceWidget />

            <BrowserMetricsWidget />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartWidget
                    title="JavaScript Errors (24h)"
                    data={jsErrors}
                    dataKeys={[{ key: 'count', color: '#ef4444', name: 'Errors' }]}
                    height={250}
                />
                <LineChartWidget
                    title="HTTP Errors (24h)"
                    data={httpErrors}
                    dataKeys={[{ key: 'count', color: '#f97316', name: 'Errors' }]}
                    height={250}
                />
            </div>

            <WebsiteDetailSlider
                website={selectedWebsite}
                isOpen={showWebsiteDetail && !!selectedWebsite}
                onClose={() => setShowWebsiteDetail(false)}
            />
        </div>
    );
}
