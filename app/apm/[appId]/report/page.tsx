"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import ReportTabRefactored from '@/components/tabs/ReportTabRefactored';
import { useGlobal } from '@/contexts/GlobalContext';

export default function ApmReportPage() {
    const params = useParams();
    const appId = params?.appId as string;
    const { tabStates } = useGlobal();
    const currentState = tabStates[appId] || { activeAction: '' };

    return (
        <ReportTabRefactored activeAction={currentState.activeAction} />
    );
}
