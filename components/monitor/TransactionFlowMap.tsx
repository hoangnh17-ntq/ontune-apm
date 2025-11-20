'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, Workflow } from 'lucide-react';

interface FlowStep {
  id: string;
  label: string;
  detail?: string;
}

interface TransactionFlowMapProps {
  steps?: FlowStep[];
  className?: string;
}

/**
 * Simple horizontal flow map to show the sequence a transaction passes through.
 * You can supply custom steps; otherwise a default client→gateway→app→services→db flow is shown.
 */
export default function TransactionFlowMap({
  steps = [
    { id: 'ingress', label: 'Ingress', detail: 'Request received' },
    { id: 'controller', label: 'Controller', detail: 'Routing / validation' },
    { id: 'service', label: 'Service Layer', detail: 'Business flow' },
    { id: 'db', label: 'DB Call', detail: 'Queries / transactions' },
    { id: 'external', label: 'External Call', detail: '3rd parties' },
    { id: 'processing', label: 'Processing', detail: 'Compute / transform' },
    { id: 'response', label: 'Response', detail: 'Return to client' },
  ],
  className,
}: TransactionFlowMapProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Transaction Flow Map
        </CardTitle>
        <CardDescription>Sequential view of how the transaction moves across components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center min-w-[120px] px-3 py-2 rounded-md border bg-muted/40">
                <div className="text-sm font-semibold">{step.label}</div>
                {step.detail && <div className="text-[11px] text-muted-foreground text-center">{step.detail}</div>}
              </div>
              {idx < steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
