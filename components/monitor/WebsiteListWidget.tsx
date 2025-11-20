'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, MoreVertical, Search } from 'lucide-react';
import { WebsiteSummary } from '@/types/apm';

interface WebsiteListWidgetProps {
  websites?: WebsiteSummary[];
  onSelect?: (website: WebsiteSummary) => void;
  onDetail?: (website: WebsiteSummary) => void;
}

const mockWebsites: WebsiteSummary[] = Array.from({ length: 10 }, (_, idx) => ({
  id: `web-${idx + 1}`,
  name: `Website-${idx + 1}`,
  project: ['E-Commerce Platform', 'Banking System', 'Payment Gateway', 'Analytics Dashboard'][idx % 4],
  status: Math.random() > 0.85 ? 'warning' : 'healthy',
  pageLoadTime: 900 + Math.random() * 800,
  domContentLoaded: 300 + Math.random() * 400,
  sessionCount: 200 + Math.random() * 900,
  jsErrorRate: +(Math.random() * 2).toFixed(2),
  httpErrorRate: +(Math.random() * 1.5).toFixed(2),
}));

export default function WebsiteListWidget({ websites = mockWebsites, onSelect, onDetail }: WebsiteListWidgetProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return websites.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.project.toLowerCase().includes(search.toLowerCase()));
  }, [websites, search]);

  const getStatusIcon = (status: WebsiteSummary['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getErrorColor = (value: number) => {
    if (value < 0.5) return 'text-green-400';
    if (value < 1.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSpeedColor = (value: number) => {
    if (value < 1000) return 'text-green-400';
    if (value < 2000) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Websites</h3>
          <span className="text-sm text-muted-foreground">{filtered.length} items</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search website or project..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted text-xs text-muted-foreground font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Website</th>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-right">Page Load</th>
              <th className="px-4 py-3 text-right">DOM Load</th>
              <th className="px-4 py-3 text-right">Sessions</th>
              <th className="px-4 py-3 text-right">JS Err</th>
              <th className="px-4 py-3 text-right">HTTP Err</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filtered.map((w) => (
              <tr
                key={w.id}
                onClick={() => {
                  setSelectedId(w.id);
                  onSelect?.(w);
                  onDetail?.(w); // open detail directly on row click
                }}
                className={`group border-t border-border hover:bg-muted cursor-pointer transition-colors ${selectedId === w.id ? 'bg-blue-500/5' : ''}`}
              >
                <td className="px-4 py-3 font-medium">{w.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{w.project}</td>
                <td className={`px-4 py-3 text-right font-mono ${getSpeedColor(w.pageLoadTime)}`}>{w.pageLoadTime.toFixed(0)}ms</td>
                <td className={`px-4 py-3 text-right font-mono ${getSpeedColor(w.domContentLoaded)}`}>{w.domContentLoaded.toFixed(0)}ms</td>
                <td className="px-4 py-3 text-right font-mono">{w.sessionCount.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-mono ${getErrorColor(w.jsErrorRate)}`}>{w.jsErrorRate}%</td>
                <td className={`px-4 py-3 text-right font-mono ${getErrorColor(w.httpErrorRate)}`}>{w.httpErrorRate}%</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center">{getStatusIcon(w.status)}</div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetail?.(w);
                      setSelectedId(w.id);
                    }}
                    className="p-1 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Website detail"
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
