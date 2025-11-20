'use client';

import React from 'react';
import ApplicationTopologyMap from '@/components/analysis/ApplicationTopologyMap';

interface TopologyTabProps {
  selectedApp?: string;
  onOpenApp?: (appId: string, appName: string) => void;
}

export default function TopologyTab({ selectedApp = 'demo-8104', onOpenApp }: TopologyTabProps) {
  return (
    <div className="h-[calc(100vh-160px)]">
      <ApplicationTopologyMap onSelectApp={(appId) => onOpenApp?.(appId, appId)} />
    </div>
  );
}

