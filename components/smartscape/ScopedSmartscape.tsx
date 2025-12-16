'use client';

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    ReactFlowProvider,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import SmartscapeNode from '@/components/smartscape/SmartscapeNode';
import { SmartscapeSidebar } from '@/components/smartscape/SmartscapeSidebar';
import { NodeDetailSidebar } from '@/components/smartscape/NodeDetailSidebar';
import { SmartscapeFilterBar } from '@/components/smartscape/SmartscapeControls';

import {
    generateVerticalStackLayout,
    generateStarLayout
} from '@/components/smartscape/layouts';
import { Cuboid, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Types
type ScopeType = 'global' | 'namespace' | 'cluster' | 'pod' | 'node';

interface ScopedSmartscapeProps {
    scope: ScopeType;
    id: string; // The ID of the current scope item (e.g., node-1, pod-xyz)
    label: string;
}

const ScopedSmartscapeInternal = ({ scope, id, label }: ScopedSmartscapeProps) => {
    // --- State ---
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowInstance = useReactFlow();

    const [activeLayer, setActiveLayer] = React.useState<string | null>(null);
    const [viewMode, setViewMode] = React.useState<'topology' | 'vulnerability'>('topology');

    // Sidebar State
    const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
    const [selectedNodeData, setSelectedNodeData] = React.useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [relatedCounts, setRelatedCounts] = React.useState<Record<string, number> | undefined>(undefined);

    // Filtering State
    const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
    const [filteredNodes, setFilteredNodes] = React.useState<Node[]>([]);
    const [filteredEdges, setFilteredEdges] = React.useState<Edge[]>([]);

    const nodeTypes = useMemo(() => ({ smartscape: SmartscapeNode }), []);

    // --- 1. Initial Data Generation & Scoping ---
    useEffect(() => {
        // User Request: 'cluster' and 'pod' should also show the FULL view (Vertical Stack), just like 'namespace'.
        // So we switch everything to use generateVerticalStackLayout.
        const initialData = generateVerticalStackLayout();

        let { nodes: allNodes, edges: allEdges } = initialData;

        // Apply Scope Filtering -> CHANGED: User wants FULL view, just focus/highlight.
        // We do NOT filter the nodes data anymore.
        setNodes(allNodes);
        setEdges(allEdges);
        // Initialize filtered set to match all nodes initially
        setFilteredNodes(allNodes);
        setFilteredEdges(allEdges);

        // Find Target for Focus/Highlight
        let targetNodeId: string | null = null;

        if (scope === 'node') {
            const targetNode = allNodes.find(n => n.id === id || n.id.includes(id) || (n.data.type === 'node' && n.data.label === label));
            if (targetNode) targetNodeId = targetNode.id;
        } else if (scope === 'namespace') {
            let targetNsId = 'ns-default';
            if (label.includes('system')) targetNsId = 'ns-system';
            const nsNode = allNodes.find(n => n.id === targetNsId);
            if (nsNode) targetNodeId = nsNode.id;
        } else if (scope === 'cluster') {
            // For Cluster: Center on a Representative Node or just the "Node Layer"?
            // The passed ID might be a cluster ID, but in vertical layout we have Physical Nodes.
            // Let's try to focus on the first "Node" type element we find, or maybe a "Cluster" node if it existed (it usually doesn't in this layout).
            // Strategy: Find a node that represents "Infrastructure".
            const firstNode = allNodes.find(n => n.data.type === 'node');
            if (firstNode) targetNodeId = firstNode.id;
        } else if (scope === 'pod') {
            // For Pod: Try to find the specific pod ID.
            // Note: Vertical layout generates random Pod IDs (e.g. 'pod-0'..). 
            // The passed 'id' from detail panel might be real (mock) ID.
            // We search for exact or partial match, or fallback to ANY pod for demo purposes.
            const targetPod = allNodes.find(n => n.id === id || (n.data.type === 'pod' && n.data.label === label));
            if (targetPod) {
                targetNodeId = targetPod.id;
            } else {
                // Fallback: Just focus on *a* pod if we can't find the exact one in the demo layout
                // (since demo layout and list data might not share same seed)
                const anyPod = allNodes.find(n => n.data.type === 'pod');
                if (anyPod) targetNodeId = anyPod.id;
            }
        }

        // Focus Effect
        if (targetNodeId) {
            // 1. Highlight connections (Select it)
            setTimeout(() => {
                setSelectedNodeId(targetNodeId);

                const node = allNodes.find(n => n.id === targetNodeId);
                if (node && reactFlowInstance) {
                    reactFlowInstance.setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 1000 });
                }
            }, 100);
        } else {
            setTimeout(() => {
                reactFlowInstance?.fitView({ duration: 800, padding: 0.2 });
            }, 100);
        }

    }, [scope, id, label, setNodes, setEdges, reactFlowInstance]); // Run ONCE on mount + strict prop changes

    // --- 2. Filter Bar Logic (Apply filters on TOP of scoped nodes) ---
    useEffect(() => {
        // If no filters, show all *scoped* nodes
        if (activeFilters.length === 0) {
            setFilteredNodes(nodes);
            setFilteredEdges(edges);
            return;
        }

        const visibleNodeIds = new Set<string>();
        const fNodes = nodes.filter(node => {
            let visible = true;
            // Example Logic from Demo Page
            if (activeFilters.includes('ns:default')) {
                if (node.id.includes('system') || node.data.label.includes('system')) visible = false;
            }
            if (activeFilters.some(f => f.startsWith('app:'))) {
                const appFilters = activeFilters.filter(f => f.startsWith('app:'));
                const matchesApp = appFilters.some(f => {
                    const appName = f.split(':')[1];
                    return node.data.label.toLowerCase().includes(appName) ||
                        (node.data.subLabel && node.data.subLabel.toLowerCase().includes(appName));
                });
                const isInfra = node.type === 'smartscape' && (node.data.type === 'node' || node.data.type === 'namespace' || node.data.type === 'external');
                if (!matchesApp && !isInfra) visible = false;
            }
            if (visible) visibleNodeIds.add(node.id);
            return visible;
        });
        const fEdges = edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));

        setFilteredNodes(fNodes);
        setFilteredEdges(fEdges);

    }, [nodes, edges, activeFilters]);

    const handleToggleFilter = (filterKey: string) => {
        setActiveFilters(prev =>
            prev.includes(filterKey)
                ? prev.filter(f => f !== filterKey)
                : [...prev, filterKey]
        );
    };

    // --- 3. Interaction & Path Highlighting ---
    const calculateDependencyPath = useCallback((nodeId: string | null) => {
        if (!nodeId) {
            // Reset
            setFilteredEdges((eds) => eds.map(e => ({
                ...e,
                animated: true,
                style: { ...e.style, strokeOpacity: 0.6, stroke: '#555' }
            })));
            setFilteredNodes((nds) => nds.map(n => ({
                ...n,
                style: { opacity: 1 }
            })));
            setRelatedCounts(undefined);
            return;
        }

        const relatedNodeIds = new Set<string>([nodeId]);
        const relatedEdgeIds = new Set<string>();
        let changed = true;
        // Search within *filtered* edges to respect current view
        while (changed) {
            changed = false;
            filteredEdges.forEach(edge => {
                if (relatedNodeIds.has(edge.source) || relatedNodeIds.has(edge.target)) {
                    if (!relatedEdgeIds.has(edge.id)) {
                        relatedEdgeIds.add(edge.id);
                        if (!relatedNodeIds.has(edge.source)) { relatedNodeIds.add(edge.source); changed = true; }
                        if (!relatedNodeIds.has(edge.target)) { relatedNodeIds.add(edge.target); changed = true; }
                    }
                }
            });
        }

        setFilteredEdges((eds) => eds.map(e => ({
            ...e,
            animated: relatedEdgeIds.has(e.id),
            style: {
                ...e.style,
                stroke: relatedEdgeIds.has(e.id) ? '#00a6fb' : '#333',
                strokeOpacity: relatedEdgeIds.has(e.id) ? 1 : 0.1,
                strokeWidth: relatedEdgeIds.has(e.id) ? 3 : 1
            }
        })));
        setFilteredNodes((nds) => nds.map(n => ({
            ...n,
            style: {
                opacity: relatedNodeIds.has(n.id) ? 1 : 0.2,
                filter: relatedNodeIds.has(n.id) ? 'none' : 'grayscale(100%)'
            }
        })));

        // Counts for Sidebar
        const counts: Record<string, number> = {};
        filteredNodes.forEach(n => {
            if (relatedNodeIds.has(n.id)) {
                const type = n.data.type;
                counts[type] = (counts[type] || 0) + 1;
            }
        });
        setRelatedCounts(counts);

    }, [filteredNodes, filteredEdges, setFilteredNodes, setFilteredEdges]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        event.stopPropagation();
        setSelectedNodeId(node.id);
        setSelectedNodeData(node.data);
        setIsSidebarOpen(true);
        calculateDependencyPath(node.id);
    }, [calculateDependencyPath]);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
        setSelectedNodeData(null);
        setIsSidebarOpen(false);
        calculateDependencyPath(null);
    }, [calculateDependencyPath]);

    // Layer Select (Pan to layer)
    const handleLayerSelect = (layerId: string) => {
        setActiveLayer(layerId);
        const layerNodes = filteredNodes.filter(n => n.data.type === layerId);
        if (layerNodes.length > 0 && reactFlowInstance) {
            const xs = layerNodes.map(n => n.position.x);
            const ys = layerNodes.map(n => n.position.y);
            const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
            const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
            reactFlowInstance.setCenter(centerX, centerY, { zoom: 1.0, duration: 1000 });
        }
    };

    // View Mode Toggle logic
    useEffect(() => {
        setFilteredNodes((nds) => nds.map((node) => ({
            ...node,
            data: { ...node.data, showVulnerability: viewMode === 'vulnerability' }
        })));
    }, [viewMode, setFilteredNodes]);


    return (
        <div className="w-full h-full bg-background relative flex overflow-hidden border border-border rounded-lg">

            {/* 1. Left Sidebar */}
            <SmartscapeSidebar
                activeLayer={activeLayer}
                onLayerSelect={handleLayerSelect}
                relatedCounts={relatedCounts}
            />

            {/* 2. Main Content */}
            <div className="flex-1 flex flex-col relative h-full bg-background">
                {/* Mini Header Over The Graph */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
                    <div className="bg-background/80 backdrop-blur px-3 py-1.5 rounded border border-border flex items-center gap-2 pointer-events-auto">
                        <Cuboid size={14} className="text-blue-500" />
                        <span className="text-xs font-mono text-gray-300 uppercase">{scope}: {label}</span>
                    </div>

                    {/* View Switcher */}
                    <div className="flex bg-muted border border-border rounded-md p-0.5 gap-1 pointer-events-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('topology')}
                            className={cn("h-6 text-[10px]", viewMode === 'topology' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white")}
                        >
                            Topology
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('vulnerability')}
                            className={cn("h-6 text-[10px]", viewMode === 'vulnerability' ? "bg-red-900/50 text-red-200" : "text-gray-400 hover:text-white")}
                        >
                            <ShieldAlert size={12} className="mr-1" />
                            Vuln
                        </Button>
                    </div>
                </div>

                <ReactFlow
                    nodes={filteredNodes}
                    edges={filteredEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    className="bg-background"
                    minZoom={0.1}
                    maxZoom={2}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="#555" gap={20} size={1} variant={BackgroundVariant.Dots} />
                    <Controls className="bg-card border-border text-foreground fill-foreground" showInteractive={false} />
                </ReactFlow>

                {/* Bottom Filter Bar */}
                <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none flex justify-center">
                    <div className="pointer-events-auto">
                        <SmartscapeFilterBar
                            activeFilters={activeFilters}
                            onToggleFilter={handleToggleFilter}
                        />
                    </div>
                </div>
            </div>

            {/* 3. Right Sidebar (Overlay or Flex?) 
                Demo page uses absolute fixed. Here we want it inside THIS container.
                NodeDetailSidebar is 'fixed' in default implementation. 
                We might need to wrap it specifically or override class?
                
                Checking NodeDetailSidebar code: `className="fixed top-0 right-0 ..."`
                This refers to viewport. That's a problem if we want it confined to the tab.
                
                However, if we want "full info", maybe viewport fixed is okay?
                But the user context is "Tab".
                
                If `NodeDetailSidebar` has `fixed`, it will cover the whole screen.
                We should likely modify `NodeDetailSidebar` to accept `className` or style overrides,
                OR wrap it in a `div` with `transform: translate(0,0)` to trap the fixed position (if that works in CSS for `fixed`? No, `fixed` escapes. `absolute` inside `relative` is what we want).
                
                Let's assume we can pass `className` to override `fixed` to `absolute`.
                Looking at `NodeDetailSidebar` props... `className` is not explicit but `...props`?
                Wait, I viewed `NodeDetailSidebar` earlier. It accepts `NodeDetailSidebarProps`.
                Let's check `NodeDetailSidebar.tsx` again or just wrap it.
                
                Actually, I can just modify `NodeDetailSidebar` to use `absolute` if I pass a prop, or just use it as is if I accept it overlaying the whole app (which might be annoying if user wants to see other parts of the panel).
                
                Let's try to override via `className` prop if it exists, or just styling.
                Actually `tailscale` fixed is hard to override without changing the component.
                
                Idea: Modify `NodeDetailSidebar` to take `position` prop or `className`.
                
                Let's look at `NodeDetailSidebar.tsx` again briefly to follow up.
            */}

            <NodeDetailSidebar
                nodeData={selectedNodeData}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                className="absolute top-0 right-0 h-full shadow-2xl z-[50]"
            />

        </div>
    );
};

// Wrapper
export default function ScopedSmartscape(props: ScopedSmartscapeProps) {
    return (
        <ReactFlowProvider>
            <ScopedSmartscapeInternal {...props} />
        </ReactFlowProvider>
    );
}
