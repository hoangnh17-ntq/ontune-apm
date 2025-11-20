'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, MoreVertical, Search } from 'lucide-react';
import { WasSummary } from '@/types/apm';

interface WasListWidgetProps {
  wasList?: WasSummary[];
  onSelect?: (was: WasSummary) => void;
  onDetail?: (was: WasSummary) => void;
}

const mockWas: WasSummary[] = Array.from({ length: 10 }, (_, idx) => ({
  id: `was-${idx + 1}`,
  name: `WAS-${idx + 1}`,
  project: ['E-Commerce Platform', 'Banking System', 'Payment Gateway', 'Analytics Dashboard'][idx % 4],
  status: Math.random() > 0.85 ? 'warning' : 'healthy',
  p95Latency: 700 + Math.random() * 500,
  p99Latency: 1100 + Math.random() * 600,
  tps: 150 + Math.random() * 500,
  throughput: 60 + Math.random() * 150,
  errorRate: +(Math.random() * 2.5).toFixed(2),
  cpu: 30 + Math.random() * 50,
  memory: 40 + Math.random() * 40,
}));

export default function WasListWidget({ wasList = mockWas, onSelect, onDetail }: WasListWidgetProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return wasList.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.project.toLowerCase().includes(search.toLowerCase()));
  }, [wasList, search]);

  const getStatusIcon = (status: WasSummary['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getLatencyColor = (value: number) => {
    if (value < 800) return 'text-green-400';
    if (value < 1500) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getErrorColor = (value: number) => {
    if (value < 1) return 'text-green-400';
    if (value < 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">WAS List</h3>
          <span className="text-sm text-muted-foreground">{filtered.length} nodes</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search WAS or project..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted text-xs text-muted-foreground font-medium">
            <tr>
              <th className="px-4 py-3 text-left">WAS</th>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-right">P95</th>
              <th className="px-4 py-3 text-right">P99</th>
              <th className="px-4 py-3 text-right">TPS</th>
              <th className="px-4 py-3 text-right">Throughput</th>
              <th className="px-4 py-3 text-right">Error</th>
              <th className="px-4 py-3 text-right">CPU</th>
              <th className="px-4 py-3 text-right">Mem</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filtered.map((was) => (
              <tr
                key={was.id}
                onClick={() => {
                  setSelected(was.id);
                  onSelect?.(was);
                  onDetail?.(was); // open detail directly on row click
                }}
                className={`group border-t border-border hover:bg-muted cursor-pointer transition-colors ${selected === was.id ? 'bg-blue-500/5' : ''}`}
              >
                <td className="px-4 py-3 font-medium">{was.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{was.project}</td>
                <td className={`px-4 py-3 text-right font-mono ${getLatencyColor(was.p95Latency)}`}>{was.p95Latency.toFixed(0)}ms</td>
                <td className={`px-4 py-3 text-right font-mono ${getLatencyColor(was.p99Latency)}`}>{was.p99Latency.toFixed(0)}ms</td>
                <td className="px-4 py-3 text-right font-mono">{was.tps.toFixed(0)}</td>
                <td className="px-4 py-3 text-right font-mono">{was.throughput.toFixed(0)} rps</td>
                <td className={`px-4 py-3 text-right font-mono ${getErrorColor(was.errorRate)}`}>{was.errorRate}%</td>
                <td className="px-4 py-3 text-right font-mono">{was.cpu.toFixed(0)}%</td>
                <td className="px-4 py-3 text-right font-mono">{was.memory.toFixed(0)}%</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center">{getStatusIcon(was.status)}</div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetail?.(was);
                      setSelected(was.id);
                    }}
                    className="p-1 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="WAS detail"
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
