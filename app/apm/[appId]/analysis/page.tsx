"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import AnalysisTabRefactored from '@/components/tabs/AnalysisTabRefactored';
import { useGlobal } from '@/contexts/GlobalContext';

export default function ApmAnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const appId = params?.appId as string;
    const { tabStates, updateTabState } = useGlobal();

    const currentState = tabStates[appId] || { activeAction: '', apmTab: 'analysis' };

    const handleNavigate = (tab: string, action: string) => {
        updateTabState(appId, { activeAction: action });
        router.push(`/apm/${appId}/${tab}`);
    };

    return (
        <AnalysisTabRefactored
            activeAction={currentState.activeAction}
            onNavigate={handleNavigate}
        />
    );
}
