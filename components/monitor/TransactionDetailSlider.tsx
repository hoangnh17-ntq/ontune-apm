'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Transaction } from '@/types/apm';
import TransactionDetailPanel from './TransactionDetailPanel';

interface TransactionDetailSliderProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailSlider({ transaction, isOpen, onClose }: TransactionDetailSliderProps) {
  if (!transaction || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative ml-auto h-full w-[90vw] max-w-6xl bg-background shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div>
            <div className="text-xs text-muted-foreground">Transaction ID</div>
            <div className="font-mono text-sm">{transaction.id}</div>
            <div className="text-sm font-semibold truncate">{transaction.endpoint}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1">
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>

        <Card className="flex-1 overflow-hidden rounded-none border-0">
          <div className="h-full flex-1 overflow-auto">
            <TransactionDetailPanel transaction={transaction} />
          </div>
        </Card>
      </div>
    </div>
  );
}
