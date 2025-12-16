"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopologyTab from '@/components/tabs/TopologyTab';
import { useGlobal } from '@/contexts/GlobalContext';

export default function ApmTopologyPage() {
    const params = useParams();
    const router = useRouter();
    const appId = params?.appId as string;
    const { addAppTab, setActiveAppTabId } = useGlobal();

    const handleOpenApp = (newAppId: string, appName: string) => {
        addAppTab({ id: newAppId, appId: newAppId, appName });
        setActiveAppTabId(newAppId);
        router.push(`/apm/${newAppId}/transaction`);
    };

    return (
        <TopologyTab
            selectedApp={appId}
            onOpenApp={handleOpenApp}
        />
    );
}
