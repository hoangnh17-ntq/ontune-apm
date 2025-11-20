'use client';

import React from 'react';
import { Transaction } from '@/types/apm';
import TransactionContext from './TransactionContext';
import DistributedTraceView from './DistributedTraceView';
import TransactionTopologyMap from './TransactionTopologyMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';

interface TransactionDashboardViewProps {
    transaction: Transaction;
    onViewSource?: (span: any) => void;
}

export default function TransactionDashboardView({ transaction, onViewSource }: TransactionDashboardViewProps) {
    return (
        <div className="space-y-6">
            {/* 1. Transaction Context */}
            <TransactionContext transaction={transaction} />

            {/* 2. Transaction Topology */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Transaction Topology
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <TransactionTopologyMap
                        transaction={transaction}
                        className="h-[500px] border-0 rounded-none"
                    />
                </CardContent>
            </Card>

            {/* 3. Distributed Trace */}
            <DistributedTraceView
                transaction={transaction}
                onViewSource={onViewSource}
                showContext={false}
            />
        </div>
    );
}
