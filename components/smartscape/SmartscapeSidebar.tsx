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
        <div className="w-[200px] h-full bg-card border-r border-border flex flex-col shrink-0 z-20 shadow-xl">
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
                                    ? "bg-accent border-primary"
                                    : "border-transparent hover:bg-muted/50"
                            )}
                        >
                            {/* Label Row */}
                            <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground mb-2 transition-colors">
                                <Icon size={18} className={cn(hasRelation ? "text-foreground" : "")} />
                                <span className={cn("font-medium text-sm", hasRelation ? "text-foreground" : "")}>{layer.label}</span>
                            </div>

                            {/* Styling Graphic (The diagonal line + count from screenshot) */}
                            <div className="relative h-8 w-full">
                                {/* The visual "bar" graphic */}
                                <div className={cn(
                                    "absolute left-0 bottom-1 h-2 w-16 transform -skew-x-[45deg] transition-colors",
                                    isActive ? "bg-primary" : (hasRelation ? "bg-muted-foreground" : "bg-muted group-hover:bg-muted-foreground/50")
                                )} />

                                {/* Count Display (Related / Total) */}
                                <div className="absolute right-0 bottom-0 flex items-baseline gap-1">
                                    {relatedCounts && (
                                        <span className="text-xl font-bold text-primary">
                                            {relatedCount}
                                        </span>
                                    )}
                                    <span className={cn(
                                        "text-xl font-light",
                                        relatedCounts ? "text-muted-foreground text-sm" : "text-foreground"
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
            <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Viewing:</span>
                    <span className="text-primary font-semibold">{activeLayer ? activeLayer.toUpperCase() : 'ALL'}</span>
                </div>
            </div>
        </div>
    );
};
