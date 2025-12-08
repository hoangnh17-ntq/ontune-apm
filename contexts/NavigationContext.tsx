'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface NavigationContextType {
    navigateToApmWas: (wasId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children, value }: { children: ReactNode; value: NavigationContextType }) {
    return (
        <NavigationContext.Provider value={value}>
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
