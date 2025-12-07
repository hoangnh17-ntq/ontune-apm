import React from 'react';
import { Play, Pause, FastForward, Filter, Search, Layers, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SmartscapeTimeline = () => {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[600px] bg-[#1a1a20] border border-gray-800 rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl z-50">
            <button className="p-2 hover:bg-gray-800 rounded-full text-blue-400 transition-colors">
                <Play size={16} fill="currentColor" />
            </button>

            <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>-1h</span>
                    <span>-30m</span>
                    <span>Now</span>
                </div>
                <div className="relative w-full h-1.5 bg-gray-800 rounded-full">
                    <div className="absolute left-0 top-0 h-full w-[85%] bg-blue-600 rounded-full"></div>
                    <div className="absolute left-[85%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer border-2 border-blue-600"></div>
                </div>
            </div>

            <div className="text-xs font-mono text-white whitespace-nowrap">
                15:42:00
            </div>
        </div>
    );
};

interface FilterBarProps {
    activeFilters: string[];
    onToggleFilter: (filter: string) => void;
}

export const SmartscapeFilterBar = ({ activeFilters, onToggleFilter }: FilterBarProps) => {
    const filters = [
        { label: 'namespace: default', key: 'ns:default', color: 'blue' },
        { label: 'app: payment', key: 'app:payment', color: 'green' },
        { label: 'app: inventory', key: 'app:inventory', color: 'orange' },
        { label: 'tier: backend', key: 'tier:backend', color: 'purple' }
    ];

    return (
        <div className="absolute top-20 left-4 z-40 flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search selector..."
                    className="bg-[#1a1a20]/90 backdrop-blur border border-gray-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-[240px]"
                />
            </div>

            {/* Chips (Slide 3.6) */}
            <div className="flex flex-wrap gap-2 max-w-[300px]">
                {filters.map(f => {
                    const isActive = activeFilters.includes(f.key);
                    return (
                        <div
                            key={f.key}
                            onClick={() => onToggleFilter(f.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] cursor-pointer transition-colors border",
                                isActive
                                    ? `bg-${f.color}-500/20 border-${f.color}-500 text-${f.color}-300`
                                    : "bg-[#2a2a35]/90 border-gray-700 text-gray-400 hover:bg-gray-700"
                            )}>
                            <Filter size={10} />
                            {f.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
