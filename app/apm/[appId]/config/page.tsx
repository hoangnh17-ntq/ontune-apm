"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import ConfigTab from '@/components/tabs/ConfigTab';
import { useGlobal } from '@/contexts/GlobalContext';

export default function ApmConfigPage() {
    const params = useParams();
    const appId = params?.appId as string;
    const { tabStates } = useGlobal();

    // ConfigTab uses activeAction, although broadly generic
    const currentState = tabStates[appId] || { activeAction: '' };

    return (
        <ConfigTab activeAction={currentState.activeAction} />
    );
}
