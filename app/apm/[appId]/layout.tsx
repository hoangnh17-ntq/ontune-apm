"use client";

import React from 'react';
import Header from '@/components/layout/Header';
import CompactTabBar from '@/components/layout/CompactTabBar';
import ContextSidebar from '@/components/layout/ContextSidebar';

export default function ApmLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ContextSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <CompactTabBar />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </>
    );
}
