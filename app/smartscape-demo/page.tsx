'use client';

import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import SmartscapeNode from '@/components/smartscape/SmartscapeNode';
import { SmartscapeSidebar } from '@/components/smartscape/SmartscapeSidebar';
import { NodeDetailSidebar } from '@/components/smartscape/NodeDetailSidebar';
import { SmartscapeTimeline, SmartscapeFilterBar } from '@/components/smartscape/SmartscapeControls';
import {
    generateVerticalStackLayout,
    generateStarLayout
} from '@/components/smartscape/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cuboid, RefreshCw, X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SmartscapeDemoPage = () => {
    // Initial State: Vertical Stack
    const verticalData = useMemo(() => generateVerticalStackLayout(), []);

    // State
    const [nodes, setNodes, onNodesChange] = useNodesState(verticalData.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(verticalData.edges);
    const [activeLayer, setActiveLayer] = React.useState<string | null>(null);
    const [layoutMode, setLayoutMode] = React.useState<'vertical' | 'star'>('vertical');
    const [viewMode, setViewMode] = React.useState<'topology' | 'vulnerability'>('topology');

    const [selectedLayer, setSelectedLayer] = React.useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
    const [selectedNodeData, setSelectedNodeData] = React.useState<any>(null); // For Sidebar
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [relatedCounts, setRelatedCounts] = React.useState<Record<string, number> | undefined>(undefined);

    const nodeTypes = useMemo(() => ({ smartscape: SmartscapeNode }), []);

    // React Flow instance for camera control
    const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);

    // Effect to toggle View Mode in Nodes
    React.useEffect(() => {
        setNodes((nds) => nds.map((node) => ({
            ...node,
            data: {
                ...node.data,
                showVulnerability: viewMode === 'vulnerability'
            }
        })));
    }, [viewMode, setNodes]);

    // --- Path Finding Logic ---
    const calculateDependencyPath = useCallback((nodeId: string | null) => {
        if (!nodeId) {
            // Reset to default view
            setEdges((eds) => eds.map(e => ({
                ...e,
                animated: true,
                style: { ...e.style, strokeOpacity: 0.6, stroke: '#555' }
            })));
            setNodes((nds) => nds.map(n => ({
                ...n,
                style: { opacity: 1 }
            })));
            setRelatedCounts(undefined);
            return;
        }

        // 1. Find all connected nodes (BFS/DFS)
        // Simple implementation for this demo: Find Upstream and Downstream
        const relatedNodeIds = new Set<string>([nodeId]);
        const relatedEdgeIds = new Set<string>();

        // Find edges connected to already known related nodes until no new nodes found
        let changed = true;
        while (changed) {
            changed = false;
            edges.forEach(edge => {
                if (relatedNodeIds.has(edge.source) || relatedNodeIds.has(edge.target)) {
                    if (!relatedEdgeIds.has(edge.id)) {
                        relatedEdgeIds.add(edge.id);
                        if (!relatedNodeIds.has(edge.source)) { relatedNodeIds.add(edge.source); changed = true; }
                        if (!relatedNodeIds.has(edge.target)) { relatedNodeIds.add(edge.target); changed = true; }
                    }
                }
            });
        }

        // 2. Update Visuals
        setEdges((eds) => eds.map(e => {
            const isRelated = relatedEdgeIds.has(e.id);
            return {
                ...e,
                animated: isRelated, // Only animate path
                style: {
                    ...e.style,
                    stroke: isRelated ? '#00a6fb' : '#333', // Highlight Blue
                    strokeOpacity: isRelated ? 1 : 0.1, // Dim others
                    strokeWidth: isRelated ? 3 : 1
                }
            };
        }));

        setNodes((nds) => nds.map(n => ({
            ...n,
            style: {
                opacity: relatedNodeIds.has(n.id) ? 1 : 0.2, // Dim unrelated nodes
                filter: relatedNodeIds.has(n.id) ? 'none' : 'grayscale(100%)'
            }
        })));

        // 3. Calculate Counts per Layer for Sidebar
        const counts: Record<string, number> = {};
        nodes.forEach(n => {
            if (relatedNodeIds.has(n.id)) {
                // n.data.type maps to layer id (application, service, etc)
                const type = n.data.type;
                counts[type] = (counts[type] || 0) + 1;
            }
        });
        setRelatedCounts(counts);

    }, [nodes, edges, setEdges, setNodes, setRelatedCounts]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        event.stopPropagation(); // Prevents pane click from clearing
        setSelectedNodeId(node.id);
        setSelectedNodeData(node.data); // Set data for sidebar
        setIsSidebarOpen(true);         // Open sidebar
        calculateDependencyPath(node.id);
    }, [calculateDependencyPath]);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
        setSelectedNodeData(null);
        setIsSidebarOpen(false); // Close sidebar on bg click
        calculateDependencyPath(null);
    }, [calculateDependencyPath]);

    const [scope, setScope] = React.useState<'global' | 'namespace' | 'cluster' | 'pod'>('global');

    const handleScopeChange = (newScope: 'global' | 'namespace' | 'cluster' | 'pod') => {
        setScope(newScope);
        setActiveFilters([]); // Reset filters on scope change for clarity? Or keep them? Resetting is safer.

        if (newScope === 'global') {
            setLayoutMode('vertical');
            setNodes(verticalData.nodes);
            setEdges(verticalData.edges);
            setTimeout(() => reactFlowInstance?.fitView({ duration: 800 }), 100);
        } else if (newScope === 'namespace') {
            setLayoutMode('vertical');
            setNodes(verticalData.nodes);
            setEdges(verticalData.edges);
            // Auto-apply namespace filter
            setActiveFilters(['ns:default']);
            setTimeout(() => reactFlowInstance?.fitView({ duration: 800 }), 100);
        } else if (newScope === 'cluster') {
            setLayoutMode('star');
            // Generate star layout for a "Cluster" (Node-centric)
            const starData = generateStarLayout('node');
            setNodes(starData.nodes);
            setEdges(starData.edges);
            setTimeout(() => reactFlowInstance?.fitView({ duration: 800 }), 100);
        } else if (newScope === 'pod') {
            setLayoutMode('star');
            // Generate star layout for a "Pod" (Pod-centric)
            const starData = generateStarLayout('pod');
            setNodes(starData.nodes);
            setEdges(starData.edges);
            setTimeout(() => reactFlowInstance?.fitView({ duration: 800 }), 100);
        }
    };

    const handleLayerSelect = (layerId: string) => {
        setActiveLayer(layerId);
        // ... (keep existing layer select logic if needed, but Scope selector might supersede it eventually)
        // For now, let's keep the layer selection just for panning/highlighting primarily
        // But if user clicks 'node' layer, maybe we switch to Global view focused on Node layer?

        // Auto-switch layout for complex layers (K8s: Node & Pod)
        if (layerId === 'node' || layerId === 'pod') {
            // ... Logic kept existing but might need syncing with Scope ...
            // Let's just delegate to handleScopeChange for consistency if they click the layer sidebar?
            if (layerId === 'node') handleScopeChange('cluster');
            if (layerId === 'pod') handleScopeChange('pod');
        } else {
            // Default back to Vertical Stack for others
            if (layoutMode !== 'vertical') {
                handleScopeChange('global');
                // Wait for state update to process
                setTimeout(() => {
                    panToLayer(layerId);
                }, 100);
            } else {
                panToLayer(layerId);
            }
        }
    };

    const panToLayer = (layerId: string) => {
        if (!reactFlowInstance) return;

        // Find all nodes in this layer
        const layerNodes = nodes.filter(n => n.data.type === layerId);

        if (layerNodes.length > 0) {
            // Calculate center of bounding box
            const xs = layerNodes.map(n => n.position.x);
            const ys = layerNodes.map(n => n.position.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            // Adjust zoom based on breadth? For now fixed 1.0 is fine, or fitBounds
            reactFlowInstance.setCenter(centerX, centerY, { zoom: 1.0, duration: 1000 });
        }
    };

    // --- Filter Logic ---
    const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
    const [filteredNodes, setFilteredNodes] = React.useState<Node[]>(nodes);
    const [filteredEdges, setFilteredEdges] = React.useState<Edge[]>(edges);

    const handleToggleFilter = (filterKey: string) => {
        setActiveFilters(prev =>
            prev.includes(filterKey)
                ? prev.filter(f => f !== filterKey)
                : [...prev, filterKey]
        );
    };

    // Apply Filters Effect
    React.useEffect(() => {
        if (activeFilters.length === 0) {
            setFilteredNodes(nodes);
            setFilteredEdges(edges);
            return;
        }

        const visibleNodeIds = new Set<string>();

        const fNodes = nodes.filter(node => {
            let visible = true;
            // AND logic: Node must match ALL active filters (simplified for demo)
            // Or OR logic? Usually filters are "Show only X".

            // Check Namespace Filter
            if (activeFilters.includes('ns:default')) {
                // Crude check: Label or ID contains 'default' or it's connected to it?
                // For demo, let's say "If ns:default is on, hide kube-system stuff"
                if (node.id.includes('system') || node.data.label.includes('system')) visible = false;
            }

            // Check App Filters
            if (activeFilters.some(f => f.startsWith('app:'))) {
                const appFilters = activeFilters.filter(f => f.startsWith('app:'));
                // Show if node matches ANY of the selected apps
                const matchesApp = appFilters.some(f => {
                    const appName = f.split(':')[1];
                    return node.data.label.toLowerCase().includes(appName) ||
                        (node.data.subLabel && node.data.subLabel.toLowerCase().includes(appName));
                });

                // Keep structural nodes (Namespaces, Nodes, Externals) always visible for context?
                // Or hide them if unrelated? Let's keep Infra nodes visible.
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

    return (
        <div className="w-full h-screen bg-[#111115] text-foreground flex overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <SmartscapeSidebar
                activeLayer={activeLayer}
                onLayerSelect={handleLayerSelect}
                relatedCounts={relatedCounts}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative h-full">
                {/* Header */}
                <div className="absolute top-0 left-0 w-full z-10 p-4 flex justify-between items-center pointer-events-none">
                    <div className="bg-[#111115]/50 backdrop-blur-md p-2 rounded-lg border border-white/10 flex items-center pointer-events-auto">
                        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Cuboid className="text-blue-500" />
                            Smartscape
                        </h1>

                        {/* Context / Scope Switcher */}
                        <div className="flex items-center gap-2 ml-8 border-l border-gray-700 pl-4 h-6">
                            <span className="text-xs text-gray-500 uppercase font-mono">Scope:</span>
                            <div className="flex bg-[#1a1a20] rounded border border-gray-800 p-0.5">
                                <button
                                    onClick={() => handleScopeChange('global')}
                                    className={cn("text-[10px] px-2 py-0.5 rounded transition-colors", scope === 'global' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200")}
                                >
                                    Global
                                </button>
                                <button
                                    onClick={() => handleScopeChange('namespace')}
                                    className={cn("text-[10px] px-2 py-0.5 rounded transition-colors", scope === 'namespace' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200")}
                                >
                                    Namespace
                                </button>
                                <button
                                    onClick={() => handleScopeChange('cluster')}
                                    className={cn("text-[10px] px-2 py-0.5 rounded transition-colors", scope === 'cluster' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200")}
                                >
                                    Cluster
                                </button>
                                <button
                                    onClick={() => handleScopeChange('pod')}
                                    className={cn("text-[10px] px-2 py-0.5 rounded transition-colors", scope === 'pod' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200")}
                                >
                                    Pod
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* View Switcher (New Feature) */}
                    <div className="flex bg-[#111] border border-[#333] rounded-md p-1 gap-1 pointer-events-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('topology')}
                            className={viewMode === 'topology' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}
                        >
                            Topology
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('vulnerability')}
                            className={viewMode === 'vulnerability' ? "bg-red-900/50 text-red-200" : "text-gray-400 hover:text-white"}
                        >
                            <ShieldAlert size={14} className="mr-2" />
                            Vulnerabilities
                        </Button>
                    </div>

                    <div className="pointer-events-auto">
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="bg-black/50 border-gray-700 hover:bg-white/10 text-white">
                            <RefreshCw size={14} className="mr-2" /> Live Update
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
                    onInit={setReactFlowInstance}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    className="flex-1 bg-[#111115]"
                    minZoom={0.1}
                    maxZoom={1.5}
                    nodesDraggable={true}
                    nodesConnectable={false}
                >
                    <Background color="#333" gap={20} size={1} variant={BackgroundVariant.Dots} />
                    <Controls className="bg-[#1e1e24] border-gray-800 text-white fill-white" />
                </ReactFlow>

                {/* Right Slider / Details Panel */}
                <NodeDetailSidebar
                    nodeData={selectedNodeData}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Timeline & Filters (Slides 3.5, 3.6) */}
                {/* <SmartscapeTimeline /> Temporarily removed */}
                <SmartscapeFilterBar
                    activeFilters={activeFilters}
                    onToggleFilter={handleToggleFilter}
                />
            </div>
        </div>
    );
};

export default SmartscapeDemoPage;
