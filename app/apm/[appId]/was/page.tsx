"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import WasTab from '@/components/tabs/WasTab';

function WasPageContent() {
    const searchParams = useSearchParams();
    const wasId = searchParams.get('wasId');
    return <WasTab initialSelectedWasId={wasId} />;
}

export default function ApmWasPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WasPageContent />
        </Suspense>
    );
}
