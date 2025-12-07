import React from 'react';
import {
    Monitor,
    Share2,
    Box,
    Server,
    Building2,
    ChevronRight,
    Layers,
    Container
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the layers structure matching the screenshot
const layers = [
    { id: 'namespace', icon: Box, label: 'Namespaces', count: 4, related: 0 },
    { id: 'service', icon: Share2, label: 'Services', count: 18, related: 0 },
    { id: 'workload', icon: Layers, label: 'Workloads', count: 12, related: 0 },
    { id: 'pod', icon: Container, label: 'Pods', count: 45, related: 0 },
    { id: 'node', icon: Server, label: 'Nodes', count: 6, related: 0 },
];

interface SmartscapeSidebarProps {
    activeLayer: string | null;
    onLayerSelect: (id: string) => void;
    // New prop: Counts of entities related to the currently selected node
    relatedCounts?: Record<string, number>;
}

export const SmartscapeSidebar = ({ activeLayer, onLayerSelect, relatedCounts }: SmartscapeSidebarProps) => {
    return (
        <div className="w-[200px] h-full bg-[#1e1e1e] border-r border-[#333] flex flex-col shrink-0 z-20 shadow-xl">
            {/* List of Layers */}
            <div className="flex-1 overflow-y-auto py-2">
                {layers.map((layer) => {
                    const Icon = layer.icon;
                    const isActive = activeLayer === layer.id;

                    // If we have a related count for this layer, show it (e.g. "1/33")
                    // Otherwise just show total
                    const relatedCount = relatedCounts ? (relatedCounts[layer.id] ?? 0) : null;
                    const hasRelation = relatedCount !== null && relatedCount > 0;

                    return (
                        <div
                            key={layer.id}
                            onClick={() => onLayerSelect(layer.id)}
                            className={cn(
                                "relative h-[100px] flex flex-col justify-center px-6 cursor-pointer transition-all border-l-4 group",
                                isActive
                                    ? "bg-[#252526] border-blue-500"
                                    : "border-transparent hover:bg-[#252526]"
                            )}
                        >
                            {/* Label Row */}
                            <div className="flex items-center gap-3 text-gray-400 group-hover:text-white mb-2 transition-colors">
                                <Icon size={18} className={cn(hasRelation ? "text-white" : "")} />
                                <span className={cn("font-medium text-sm", hasRelation ? "text-white" : "")}>{layer.label}</span>
                            </div>

                            {/* Styling Graphic (The diagonal line + count from screenshot) */}
                            <div className="relative h-8 w-full">
                                {/* The visual "bar" graphic */}
                                <div className={cn(
                                    "absolute left-0 bottom-1 h-2 w-16 transform -skew-x-[45deg] transition-colors",
                                    isActive ? "bg-blue-500" : (hasRelation ? "bg-gray-500" : "bg-gray-700 group-hover:bg-gray-600")
                                )} />

                                {/* Count Display (Related / Total) */}
                                <div className="absolute right-0 bottom-0 flex items-baseline gap-1">
                                    {relatedCounts && (
                                        <span className="text-xl font-bold text-blue-400">
                                            {relatedCount}
                                        </span>
                                    )}
                                    <span className={cn(
                                        "text-xl font-light",
                                        relatedCounts ? "text-gray-500 text-sm" : "text-white"
                                    )}>
                                        {relatedCounts ? `/${layer.count}` : layer.count}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Branding or Config */}
            <div className="p-4 border-t border-[#333]">
                <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span>Viewing:</span>
                    <span className="text-blue-400 font-semibold">{activeLayer ? activeLayer.toUpperCase() : 'ALL'}</span>
                </div>
            </div>
        </div>
    );
};
