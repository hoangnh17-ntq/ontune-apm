"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppTab } from '@/types/tabs';
import { APMTab } from '@/types/apm';

interface TabState {
    apmTab: APMTab;
    activeFilters: any;
    activeAction: string;
}

interface GlobalContextType {
    appTabs: AppTab[];
    activeAppTabId: string;
    projectSources: string[];
    tabStates: Record<string, TabState>;
    addAppTab: (appId: string, appName: string) => void;
    closeAppTab: (tabId: string) => void;
    setActiveAppTabId: (id: string) => void;
    setProjectSources: (sources: string[]) => void;
    updateTabState: (appId: string, newState: Partial<TabState>) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [appTabs, setAppTabs] = useState<AppTab[]>([
        { id: 'demo-8101', appId: 'demo-8101', appName: 'Java APM Demo (8101)' }
    ]);
    const [activeAppTabId, setActiveAppTabId] = useState<string>('demo-8101');
    const [projectSources, setProjectSources] = useState<string[]>(['proj-1']);
    const [tabStates, setTabStates] = useState<Record<string, TabState>>({
        'demo-8101': {
            apmTab: 'transaction',
            activeFilters: {},
            activeAction: ''
        }
    });

    const addAppTab = (appId: string, appName: string) => {
        // Check if tab already exists
        const existingTab = appTabs.find(t => t.appId === appId && !t.isOverview);
        if (existingTab) {
            setActiveAppTabId(existingTab.id);
            return;
        }

        const newTab: AppTab = {
            id: `app-${appId}-${Date.now()}`,
            appId,
            appName
        };

        setAppTabs(prev => [...prev, newTab]);
        setTabStates(prev => ({
            ...prev,
            [newTab.id]: {
                apmTab: 'transaction',
                activeFilters: {},
                activeAction: ''
            }
        }));
        setActiveAppTabId(newTab.id);
    };

    const closeAppTab = (tabId: string) => {
        const tabIndex = appTabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const newTabs = appTabs.filter(t => t.id !== tabId);
        setAppTabs(newTabs);

        const newTabStates = { ...tabStates };
        delete newTabStates[tabId];
        setTabStates(newTabStates);

        if (activeAppTabId === tabId) {
            if (tabIndex > 0) {
                setActiveAppTabId(newTabs[tabIndex - 1].id);
            } else if (newTabs.length > 0) {
                setActiveAppTabId(newTabs[0].id);
            } else {
                // Handle no tabs open - maybe create default or redirect
                setActiveAppTabId('');
            }
        }
    };

    const updateTabState = (appId: string, newState: Partial<TabState>) => {
        setTabStates(prev => ({
            ...prev,
            [appId]: {
                ...prev[appId],
                ...newState
            }
        }));
    };

    return (
        <GlobalContext.Provider value={{
            appTabs,
            activeAppTabId,
            projectSources,
            tabStates,
            addAppTab,
            closeAppTab,
            setActiveAppTabId,
            setProjectSources,
            updateTabState
        }}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
}
