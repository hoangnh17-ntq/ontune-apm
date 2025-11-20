'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Clock, Zap, AlertCircle, Info, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ActiveTransactionSpeedChart from '@/components/charts/ActiveTransactionSpeedChart';
import ProjectListWidget from '@/components/monitor/ProjectListWidget';
import ProjectDetailSlider from '@/components/monitor/ProjectDetailSlider';
import HitmapScatterPlot from '@/components/charts/HitmapScatterPlot';
import TransactionListTable from '@/components/widgets/TransactionListTable';
import ActiveStatusTable from '@/components/widgets/ActiveStatusTable';
import TransactionDetailSlider from '@/components/monitor/TransactionDetailSlider';
import TransactionDonutChart from '@/components/charts/TransactionDonutChart';
import TPSChart from '@/components/charts/TPSChart';
import {
    generateTransactionHistory,
    generateActiveStatus,
    generateAPMMetrics,
    generateTransaction
} from '@/lib/mockData';
import { Transaction, ActiveStatus, APMMetrics, ProjectSummary } from '@/types/apm';

interface TransactionTabProps {
    onNavigate?: (tab: string, action: string) => void;
    selectedApp?: string;
    activeFilters?: {
        methods?: string[];
        status?: string[];
    };
    onChartFilter?: (filterType: string, value: string) => void;
    projectSources?: string[];
}

export default function TransactionTab({
    onNavigate,
    selectedApp = 'demo-8104',
    activeFilters = {},
    onChartFilter,
    projectSources = []
}: TransactionTabProps) {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showTxSlider, setShowTxSlider] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeStatus, setActiveStatus] = useState<ActiveStatus[]>([]);
    const [metrics, setMetrics] = useState<APMMetrics | null>(null);
    const [tpsHistory, setTpsHistory] = useState<number[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null);
    const [showProjectDetail, setShowProjectDetail] = useState(false);

    // Initialize data
    useEffect(() => {
        const initialTransactions = generateTransactionHistory(1000, 15); // Reduced for better performance
        setTransactions(initialTransactions);
        setActiveStatus(generateActiveStatus());
        setMetrics(generateAPMMetrics());
        setTpsHistory(Array.from({ length: 24 }, () => 100 + Math.random() * 80));
    }, []);

    // Real-time updates - optimized interval
    useEffect(() => {
        const interval = setInterval(() => {
            // Generate moderate number of transactions to balance visual effect and performance
            const newTransactions = Array.from({ length: 3 }, () => generateTransaction());
            setTransactions(prev => {
                const updated = [...prev, ...newTransactions];
                const now = Date.now();
                return updated.filter(tx => now - tx.timestamp <= 15 * 60 * 1000);
            });

            if (Math.random() > 0.7) {
                setActiveStatus(generateActiveStatus());
            }

            if (Math.random() > 0.5) {
                setMetrics(generateAPMMetrics());
            }

            setTpsHistory(prev => [...prev.slice(-23), 100 + Math.random() * 80]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    if (!metrics) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading Transaction Data...</div>
            </div>
        );
    }

    const totalActive = activeStatus.reduce((sum, s) => sum + s.count, 0);

    return (
        <>
            <div className="space-y-4">
                {projectSources.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                        Data source: <span className="font-semibold text-foreground">{projectSources.join(', ')}</span>
                    </div>
                )}
                {/* Compact Top Metrics - Always Visible */}
                <div className="grid grid-cols-6 gap-3">
                    <Card>
                        <CardContent className="pt-3 pb-2">
                            <div className="text-center">
                                <div className="text-[10px] text-muted-foreground mb-0.5">Active TX</div>
                                <div className="text-xl font-bold text-blue-500">{totalActive}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2">
                            <div className="text-center">
                                <div className="text-[10px] text-muted-foreground mb-0.5">TPS</div>
                                <div className="text-xl font-bold text-green-500">{metrics.tps.toFixed(0)}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2">
                            <div className="text-center">
                                <div className="text-[10px] text-muted-foreground mb-0.5">Resp Time</div>
                                <div className="text-xl font-bold text-yellow-500">{metrics.avgResponseTime.toFixed(0)}ms</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2">
                            <div className="text-center">
                                <div className="text-[10px] text-muted-foreground mb-0.5">Error Rate</div>
                                <div className="text-xl font-bold text-red-500">{metrics.errorRate.toFixed(2)}%</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Project List Widget */}
                <ProjectListWidget 
                  onProjectSelect={(project) => {
                    setSelectedProject(project);
                    setShowProjectDetail(true);
                  }}
                />

                {/* Active Transaction Speed - Real-time Processing Visualization */}
                <ActiveTransactionSpeedChart transactions={transactions} />

                {/* Main X-View / Hitmap - Large Center Focus */}
                <HitmapScatterPlot
                    transactions={transactions}
                    onNavigate={onNavigate}
                    onSelectTransaction={(tx) => {
                        setSelectedTransaction(tx);
                        setShowTxSlider(true);
                    }}
                />

                {/* Active Transaction Table - Real-time List */}
                <TransactionListTable
                    transactions={transactions.slice(-50)}
                    onNavigate={onNavigate}
                    onSelectTransaction={(tx) => {
                        setSelectedTransaction(tx);
                        setShowTxSlider(true);
                    }}
                />

                {/* Active Status & TPS */}
                <div className="grid grid-cols-3 gap-6">
                    <ActiveStatusTable activeStatus={activeStatus} />
                    <TransactionDonutChart
                        activeStatus={activeStatus}
                        totalActive={totalActive}
                        activeFilters={activeFilters.status || []}
                        onFilter={(category) => onChartFilter?.('status', category)}
                    />
                    <TPSChart data={tpsHistory} title="TPS" height={200} />
                </div>

                {/* System Metrics - Removed for Transaction Tab */}
            </div>

            {/* Project Detail Slider */}
            <ProjectDetailSlider
              project={selectedProject}
              transactions={transactions}
              isOpen={showProjectDetail}
              onClose={() => setShowProjectDetail(false)}
              onSelectTransaction={(tx) => {
                setSelectedTransaction(tx);
                setShowProjectDetail(false);
                setShowTxSlider(true);
              }}
            />

            <TransactionDetailSlider
              transaction={selectedTransaction}
              isOpen={showTxSlider && !!selectedTransaction}
              onClose={() => {
                setShowTxSlider(false);
                setSelectedTransaction(null);
              }}
            />
        </>
    );
}
