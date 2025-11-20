'use client';

import React from 'react';
import { ActiveStatus } from '@/types/apm';

interface ActiveStatusTableProps {
  activeStatus: ActiveStatus[];
}

export default function ActiveStatusTable({ activeStatus }: ActiveStatusTableProps) {
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'METHOD': return 'text-blue-400';
      case 'SQL': return 'text-purple-400';
      case 'HTTPC': return 'text-green-400';
      case 'DBC': return 'text-orange-400';
      case 'SOCKET': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const totalCount = activeStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-base font-semibold">Active Status</h3>
        <span className="text-xs text-muted-foreground">ⓘ</span>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-xs font-medium text-muted-foreground pb-2">METHOD</th>
            <th className="text-right text-xs font-medium text-muted-foreground pb-2">COUNT</th>
            <th className="text-right text-xs font-medium text-muted-foreground pb-2">AVG TIME</th>
          </tr>
        </thead>
        <tbody>
          {activeStatus.map((status) => (
            <tr 
              key={status.method}
              className="border-b border-border/30 hover:bg-muted cursor-pointer transition-colors"
            >
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getMethodColor(status.method).replace('text-', 'bg-')}`}></div>
                  <span className={`text-sm font-medium ${getMethodColor(status.method)}`}>
                    {status.method}
                  </span>
                </div>
              </td>
              <td className="py-3 text-right">
                <span className="text-sm font-semibold">{status.count}</span>
              </td>
              <td className="py-3 text-right">
                <span className="text-sm text-foreground">{status.avgResponseTime.toFixed(0)}ms</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border">
            <td className="pt-3 text-sm font-semibold text-muted-foreground">Total</td>
            <td className="pt-3 text-right text-sm font-bold text-orange-400">{totalCount}</td>
            <td className="pt-3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}


