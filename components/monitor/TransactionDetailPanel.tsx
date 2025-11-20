'use client';

import React, { useEffect } from 'react';
import { Transaction } from '@/types/apm';
import DistributedTraceView from './DistributedTraceView';
import TransactionTopologyMap from './TransactionTopologyMap';
import TransactionFlowMap from './TransactionFlowMap';
import TransactionContext from './TransactionContext';

interface TransactionDetailPanelProps {
  transaction: Transaction;
}

export default function TransactionDetailPanel({
  transaction
}: TransactionDetailPanelProps) {
  // Store transaction in sessionStorage for child components
  useEffect(() => {
    sessionStorage.setItem('selectedTransaction', JSON.stringify(transaction));
  }, [transaction]);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* Transaction Header Info */}
      <div className="px-6 py-4 border-b bg-muted/20">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-1">Transaction ID</div>
            <div className="font-mono text-sm mb-2 truncate">{transaction.id}</div>
            <div className="text-base font-semibold truncate">{transaction.endpoint}</div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{new Date(transaction.timestamp).toLocaleString()}</span>
              <span>•</span>
              <span className={`font-semibold ${transaction.status === 'error' ? 'text-red-400' :
                transaction.status === 'very_slow' ? 'text-orange-400' :
                  transaction.status === 'slow' ? 'text-yellow-400' :
                    'text-green-400'
                }`}>
                {transaction.responseTime.toFixed(0)}ms
              </span>
              <span>•</span>
              <span className="uppercase">{transaction.method}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Single consolidated layout */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
        {/* Context & quick stats with performance breakdown */}
        <TransactionContext transaction={transaction} />

        {/* Transaction flow (logical steps inside the transaction) */}
        <TransactionFlowMap className="h-fit" />

        {/* Topology view of services participating in the transaction */}
        <TransactionTopologyMap transaction={transaction} className="h-[320px]" />

        {/* Call stack & span detail side-by-side; DB queries integrated inside */}
        <DistributedTraceView transaction={transaction} showContext={false} />
      </div>
    </div>
  );
}
