import React from 'react';
import KubernetesTabBar from '@/components/kubernetes/KubernetesTabBar';

export default function KubernetesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col flex-1 overflow-hidden h-full">
            <KubernetesTabBar />
            <main className="flex-1 overflow-auto p-6">
                {children}
            </main>
        </div>
    );
}
