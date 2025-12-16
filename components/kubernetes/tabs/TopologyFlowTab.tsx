'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import ScopedSmartscape from '@/components/smartscape/ScopedSmartscape';

// Wait, lib/mockData exports functions, not a static object. I should check how to get clusters.

// I'll define a local mock for clusters if I can't easily import or use the generate functions.
// Actually, I can use generateK8sClusters from lib/mockData.ts or just duplicate the mock data for stability as requested in the plan "Use mock data for clusters (consistent with ClusterTab)".
// Looking at ClusterTab.tsx, it has local mock data. I will copy that for consistency.

const clusters = [
    {
        id: 'cluster-1',
        name: 'kubernetes-211-2',
    },
    {
        id: 'cluster-2',
        name: 'kubernetes_163',
    },
    {
        id: 'cluster-3',
        name: 'jslee-k3s',
    },
    {
        id: 'cluster-4',
        name: 'be-k8s',
    }
];

export default function TopologyFlowTab() {
    const [selectedClusterId, setSelectedClusterId] = useState<string>(clusters[0].id);

    const selectedCluster = useMemo(() =>
        clusters.find(c => c.id === selectedClusterId) || clusters[0],
        [selectedClusterId]
    );

    return (
        <div className="h-full flex flex-col space-y-4">
            <Card>
                <CardHeader className="py-4 px-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Topology Flow</CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground mr-2">Select Cluster:</span>
                            <select
                                value={selectedClusterId}
                                onChange={(e) => setSelectedClusterId(e.target.value)}
                                className="w-[250px] h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                {clusters.map((cluster) => (
                                    <option key={cluster.id} value={cluster.id}>
                                        {cluster.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="flex-1 bg-background rounded-lg border border-border overflow-hidden min-h-[600px] relative">
                {/* We need to ensure ScopedSmartscape takes full height */}
                <div className="absolute inset-0">
                    <ScopedSmartscape
                        scope="cluster"
                        id={selectedCluster.id}
                        label={selectedCluster.name}
                    />
                </div>
            </div>
        </div >
    );
}
