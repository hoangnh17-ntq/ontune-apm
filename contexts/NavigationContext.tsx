'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobal } from './GlobalContext';

interface NavigationContextType {
    navigateToApmWas: (wasId: string) => void;
    navigateToTransaction: (transactionId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { activeAppTabId, setActiveAppTabId, updateTabState } = useGlobal();

    const navigateToApmWas = (wasId: string) => {
        // 1. Switch to APM (handled by route change)
        // 2. Switch to WAS Tab (handled by route change)
        // 3. Set Target WAS ID (we can pass this as query param or state)

        // Ensure we preserve the correct app context
        const appId = activeAppTabId || 'demo-8101'; // Fallback

        // Update global state if needed (though route param should drive this)
        updateTabState(appId, { apmTab: 'was' });

        // Navigate
        router.push(`/apm/${appId}/was?wasId=${wasId}`);
    };

    const navigateToTransaction = (transactionId: string) => {
        const appId = activeAppTabId || 'demo-8101';
        updateTabState(appId, { apmTab: 'transaction' });
        router.push(`/apm/${appId}/transaction?transactionId=${transactionId}`);
    };

    return (
        <NavigationContext.Provider value={{ navigateToApmWas, navigateToTransaction }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}
