'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { APMTab, ProjectSummary } from '@/types/apm';
import { ChevronDown, ChevronRight, Folder, MapPin, Globe2, Server, Check } from 'lucide-react';
import { useGlobal } from '@/contexts/GlobalContext';

type ItemKind = 'project' | 'website' | 'was';

type SidebarItem = ProjectSummary & {
  kind: ItemKind;
  subtitle: string;
  indicator?: string;
};

// Mock lists aligned with UX.md per tab
const projectList: SidebarItem[] = [
  { id: 'proj-1', name: 'E-Commerce Platform', subtitle: 'Project • 3W / 5A / 2S', websiteCount: 3, wasCount: 5, webserverCount: 2, tps: 1250, apdexScore: 0.92, avgResponseTime: 145, errorRate: 0.3, status: 'healthy', kind: 'project' },
  { id: 'proj-2', name: 'Banking System', subtitle: 'Project • 2W / 4A / 3S', websiteCount: 2, wasCount: 4, webserverCount: 3, tps: 890, apdexScore: 0.88, avgResponseTime: 210, errorRate: 1.2, status: 'warning', kind: 'project' },
  { id: 'proj-3', name: 'Payment Gateway', subtitle: 'Project • 1W / 3A / 2S', websiteCount: 1, wasCount: 3, webserverCount: 2, tps: 2100, apdexScore: 0.95, avgResponseTime: 95, errorRate: 0.1, status: 'healthy', kind: 'project' }
];

const rumList: SidebarItem[] = [
  { id: 'web-1', name: 'shop.teemstone.com', subtitle: 'Project: E-Commerce', indicator: 'Sessions 5.4k', websiteCount: 0, wasCount: 0, webserverCount: 0, tps: 0, apdexScore: 0.9, avgResponseTime: 200, errorRate: 0.4, status: 'healthy', kind: 'website' },
  { id: 'web-2', name: 'pay.teemstone.com', subtitle: 'Project: Payment', indicator: 'Sessions 3.2k', websiteCount: 0, wasCount: 0, webserverCount: 0, tps: 0, apdexScore: 0.85, avgResponseTime: 240, errorRate: 1.4, status: 'warning', kind: 'website' },
  { id: 'web-3', name: 'banking.teemstone.com', subtitle: 'Project: Banking', indicator: 'Sessions 1.8k', websiteCount: 0, wasCount: 0, webserverCount: 0, tps: 0, apdexScore: 0.78, avgResponseTime: 260, errorRate: 3.6, status: 'critical', kind: 'website' }
];

const wasList: SidebarItem[] = [
  { id: 'was-1', name: 'WAS-Prod-01', subtitle: 'E-Commerce • TPS 720', indicator: 'P95 120ms', websiteCount: 0, wasCount: 0, webserverCount: 0, tps: 720, apdexScore: 0.9, avgResponseTime: 120, errorRate: 0.4, status: 'healthy', kind: 'was' },
  { id: 'was-2', name: 'WAS-Prod-02', subtitle: 'Banking • TPS 540', indicator: 'P95 210ms', websiteCount: 0, wasCount: 0, webserverCount: 0, tps: 540, apdexScore: 0.82, avgResponseTime: 210, errorRate: 1.6, status: 'warning', kind: 'was' },
  { id: 'was-3', name: 'WAS-Prod-03', subtitle: 'Payment • TPS 980', indicator: 'P95 95ms', websiteCount: 0, wasCount: 0, webserverCount: 0, tps: 980, apdexScore: 0.94, avgResponseTime: 95, errorRate: 0.2, status: 'healthy', kind: 'was' }
];

const statusDot: Record<ProjectSummary['status'], string> = {
  healthy: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical: 'bg-red-400'
};

const iconFor = (kind: ItemKind) => {
  switch (kind) {
    case 'website':
      return <Globe2 className="h-4 w-4 text-blue-500" />;
    case 'was':
      return <Server className="h-4 w-4 text-emerald-500" />;
    default:
      return <MapPin className="h-4 w-4 text-primary" />;
  }
};

export default function ContextSidebar() {
  const pathname = usePathname();
  const currentTab = pathname?.split('/').pop() as APMTab;
  const { projectSources, setProjectSources } = useGlobal();

  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<string[]>(projectSources);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Update global state when selection changes
    if (JSON.stringify(selected) !== JSON.stringify(projectSources)) {
      // This might cause loop if not careful.
      // Actually better to just sync local state from global on mount/update
      // and update global on interaction.
    }
  }, [selected, projectSources]);

  // Sync from global 
  // (Simplified: Just use global state setter directly in handlers)

  const currentList: SidebarItem[] = useMemo(() => {
    switch (currentTab) {
      case 'rum':
        return rumList;
      case 'was':
        return wasList;
      default:
        return projectList;
    }
  }, [currentTab]);

  const filtered = useMemo(
    () => currentList.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [currentList, search]
  );

  const label = (() => {
    switch (currentTab) {
      case 'rum':
        return 'Website (RUM)';
      case 'was':
        return 'WAS';
      default:
        return 'Projects';
    }
  })();

  const handleToggle = (id: string) => {
    // Logic to toggle and update Global
    const prev = projectSources;
    const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
    setProjectSources(next);
  };

  const shouldShow = ['transaction', 'rum', 'was', 'monitor'].includes(currentTab);
  // Also show for analysis/report/config maybe? Standardizing to show always for APM unless specific tabs opt-out

  if (!shouldShow) return <div className="w-0" />;

  const allIds = filtered.map((i) => i.id);
  const allSelected = projectSources.length > 0 && allIds.every((id) => projectSources.includes(id));

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Folder className="h-4 w-4 text-primary" />
          <span>{label}</span>
          <button
            className="ml-auto h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-accent"
            onClick={() => setExpanded((p) => !p)}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-9 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {expanded && (
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => {
                  if (allSelected) {
                    setProjectSources([]);
                  } else {
                    const projectIds = filtered.filter((i) => i.kind === 'project').map((i) => i.id);
                    // For RUM/WAS, logic might differ (selecting items vs projects). Assuming project selection for now.
                    // If we are in RUM, maybe we select websites. 
                    // But global state is "projectSources".
                    // Let's assume for now we just track IDs.
                    setProjectSources(allIds);
                  }
                }}
                className="h-3.5 w-3.5 accent-primary"
              />
              <span>Select all</span>
            </div>
            {filtered.map((item) => {
              const isActive = projectSources.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`w-full text-left rounded-lg border transition-colors px-3 py-2 flex items-start gap-3 ${isActive ? 'border-primary/40 bg-accent/40' : 'border-transparent hover:border-border hover:bg-accent/30'
                    }`}
                >
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleToggle(item.id)}
                      className="h-4 w-4 accent-primary"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="mt-1">{iconFor(item.kind)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{item.name}</span>
                      <span className={`h-2 w-2 rounded-full ${statusDot[item.status]}`} />
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                    {item.indicator && (
                      <div className="text-[11px] text-muted-foreground/90">{item.indicator}</div>
                    )}
                  </div>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-xs text-muted-foreground px-2 py-3">No items found</div>
            )}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
