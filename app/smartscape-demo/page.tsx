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
import { generateVerticalStackLayout, generateStarLayout } from '@/components/smartscape/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cuboid, RefreshCw, X, ShieldAlert, AlertTriangle } from 'lucide-react';

const SmartscapeDemoPage = () => {
    // Initial State: Vertical Stack
    const verticalData = useMemo(() => generateVerticalStackLayout(), []);

    // State
    const [nodes, setNodes, onNodesChange] = useNodesState(verticalData.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(verticalData.edges);
    const [activeLayer, setActiveLayer] = React.useState<string | null>(null);
    const [layoutMode, setLayoutMode] = React.useState<'vertical' | 'star'>('vertical');
    const [viewMode, setViewMode] = React.useState<'topology' | 'vulnerability'>('topology');

    // Cross-Tier Interaction State
    const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
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

    }, [nodes, edges]);

    const handleNodeClick = (_e: React.MouseEvent, node: Node) => {
        // Toggle selection
        if (selectedNodeId === node.id) {
            setSelectedNodeId(null);
            calculateDependencyPath(null);
        } else {
            setSelectedNodeId(node.id);
            calculateDependencyPath(node.id);
        }
    };

    const handleBgClick = () => {
        if (selectedNodeId) {
            setSelectedNodeId(null);
            calculateDependencyPath(null);
        }
    };

    const handleLayerSelect = (layerId: string) => {
        setActiveLayer(layerId);

        // Dynamic Layout Switching based on Layer
        // If selecting Process or Host, user might want "Cluster View" (Star)
        if (layerId === 'process' || layerId === 'host') {
            setLayoutMode('star');
            const starData = generateStarLayout(layerId as 'process' | 'host');
            setNodes(starData.nodes);
            setEdges(starData.edges);
            // Reset selection when changing layout to avoid confusion
            setSelectedNodeId(null);
            setRelatedCounts(undefined);

            setTimeout(() => reactFlowInstance?.fitView({ duration: 800 }), 100);
        } else {
            // Default back to Vertical Stack for others
            setLayoutMode('vertical');
            setNodes(verticalData.nodes);
            setEdges(verticalData.edges);
            setSelectedNodeId(null);
            setRelatedCounts(undefined);

            // Pan to layer
            if (activeLayer !== layerId && reactFlowInstance && verticalData.layerYPositions) {
                const y = verticalData.layerYPositions[layerId] || 0;
                reactFlowInstance.setCenter(0, y, { zoom: 1.0, duration: 1000 });
            }
        }
    };

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
                    <div className="bg-[#111115]/50 backdrop-blur-md p-2 rounded-lg border border-white/10">
                        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Cuboid className="text-blue-500" />
                            Smartscape
                        </h1>
                        <p className="text-gray-400 text-xs ml-9">environment: <span className="text-green-400">production-01</span></p>
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
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    onInit={setReactFlowInstance}
                    onNodeClick={handleNodeClick}
                    onPaneClick={handleBgClick}
                    className="flex-1 bg-[#111115]"
                    minZoom={0.5}
                    maxZoom={2}
                >
                    <Background color="#333" gap={30} size={1} variant={BackgroundVariant.Dots} />
                    <Controls className="bg-black border-gray-800 fill-white" />
                </ReactFlow>
            </div>
        </div>
    );
};

export default SmartscapeDemoPage;
