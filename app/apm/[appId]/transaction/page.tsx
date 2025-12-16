"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import TransactionTab from '@/components/tabs/TransactionTab';
import { useGlobal } from '@/contexts/GlobalContext';

export default function ApmTransactionPage() {
    const params = useParams();
    const router = useRouter();
    const appId = params?.appId as string;
    const { tabStates, updateTabState, projectSources } = useGlobal();

    const currentState = tabStates[appId] || { activeFilters: {}, activeAction: '', apmTab: 'transaction' };

    const handleNavigate = (tab: string, action: string) => {
        updateTabState(appId, { activeAction: action });
        router.push(`/apm/${appId}/${tab}`);
    };

    const handleChartFilter = (filterType: string, value: string) => {
        const currentFilters = currentState.activeFilters[filterType] || [];
        const newFilters = currentFilters.includes(value)
            ? currentFilters.filter((v: string) => v !== value)
            : [...currentFilters, value];

        updateTabState(appId, {
            activeFilters: { ...currentState.activeFilters, [filterType]: newFilters }
        });
    };

    return (
        <TransactionTab
            onNavigate={handleNavigate}
            selectedApp={appId}
            activeFilters={currentState.activeFilters}
            onChartFilter={handleChartFilter}
            projectSources={projectSources}
        />
    );
}
