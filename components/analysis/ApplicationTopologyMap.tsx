'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Monitor, 
  Database, 
  Globe, 
  Server, 
  Layers, 
  Activity, 
  RefreshCw, 
  Search,
  AlertTriangle,
  Phone,
  Settings,
  LocateFixed,
  Square,
  StopCircle
} from 'lucide-react';

interface ApplicationTopologyMapProps {
  onSelectApp?: (appId: string) => void;
}

interface TopologyNode {
  id: string;
  label: string;
  type: 'group' | 'db' | 'external' | 'inbound' | 'system';
  group?: string;
  icon?: string;
  color?: string;
  agents?: number;
  activeTx?: number;
  latency?: number;
  errorRate?: number;
  errorCount?: number;
  order?: number; // Số thứ tự hiển thị
}

interface TopologyEdge {
  from: string;
  to: string;
  label: string;
  color?: string;
  dashes?: boolean;
  arrows?: { to: { enabled: boolean } };
  avgResTime?: number; // Average Response Time (ms)
  count?: number; // Total count
  errorCount?: number; // Error count
  activeTx?: number; // Active transactions
  fetchTime?: number; // For DB calls
  fetchCount?: number; // For DB calls
}

export default function ApplicationTopologyMap({ onSelectApp }: ApplicationTopologyMapProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);
  
  const [selectAll, setSelectAll] = useState(true);
  const [activeAgents, setActiveAgents] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showInbound, setShowInbound] = useState(true);
  const [showSystemCall, setShowSystemCall] = useState(true);
  const [showDBCall, setShowDBCall] = useState(true);
  const [showCallInfo, setShowCallInfo] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Generate topology data
  const generateTopologyData = useCallback(() => {
    const nodes: TopologyNode[] = [
      // System call node
      {
        id: 'system-call',
        label: 'System call\n127.0.0.1',
        type: 'system',
        icon: 'system',
        color: '#3b82f6',
        activeTx: 0,
        latency: 0,
        errorRate: 0,
        errorCount: 0,
        order: 1
      },
      // Inbound node
      {
        id: 'inbound',
        label: 'Inbound',
        type: 'inbound',
        icon: 'inbound',
        color: '#22c55e',
        activeTx: 0,
        latency: 0,
        errorRate: 0,
        errorCount: 0
      },
      // Application nodes
      {
        id: 'demo-8100',
        label: 'Application\ndemo-8100\n(Java APM Demo)',
        type: 'group',
        group: 'OTE_APM_YARD',
        agents: 1,
        activeTx: 28,
        latency: 142,
        errorRate: 0.1,
        errorCount: 0,
        color: '#22c55e',
        order: 2
      },
      {
        id: 'demo-8101',
        label: 'Application\ndemo-8101\n(Java APM Demo)',
        type: 'group',
        group: 'OTE_APM_YARD',
        agents: 2,
        activeTx: 45,
        latency: 125,
        errorRate: 0.2,
        errorCount: 1,
        color: '#22c55e',
        order: 3
      },
      {
        id: 'demo-8102',
        label: 'Application\ndemo-8102\n(Java APM Demo)',
        type: 'group',
        group: 'OTE_APM_YARD',
        agents: 3,
        activeTx: 120,
        latency: 180,
        errorRate: 0.1,
        errorCount: 2,
        color: '#22c55e',
        order: 4
      },
      {
        id: 'demo-8103',
        label: 'Application\ndemo-8103\n(Java APM Demo)',
        type: 'group',
        group: 'OTE_APM_YARD',
        agents: 1,
        activeTx: 89,
        latency: 520,
        errorRate: 2.5,
        errorCount: 8,
        color: '#ef4444',
        order: 5
      },
      {
        id: 'demo-8104',
        label: 'Application\ndemo-8104\n(Java APM Demo)',
        type: 'group',
        group: 'OTE_APM_YARD',
        agents: 4,
        activeTx: 310,
        latency: 125,
        errorRate: 0.3,
        errorCount: 3,
        color: '#22c55e',
        order: 6
      },
      {
        id: 'demo-8105',
        label: 'Application\ndemo-8105\n(Java APM Demo)',
        type: 'group',
        group: 'OTE_APM_YARD',
        agents: 2,
        activeTx: 67,
        latency: 95,
        errorRate: 0.5,
        errorCount: 1,
        color: '#22c55e',
        order: 7
      },
      // DB call node
      {
        id: 'db-call',
        label: 'DB call\nlocalhost:3306\nlocalhost:3310/fake',
        type: 'db',
        icon: 'db',
        color: '#f97316',
        activeTx: 0,
        latency: 0,
        errorRate: 0,
        errorCount: 5,
        order: 8
      },
      // External call node
      {
        id: 'external-call',
        label: 'Outbound call\n192.168.1.102',
        type: 'external',
        icon: 'external',
        color: '#3b82f6',
        activeTx: 0,
        latency: 0,
        errorRate: 0,
        errorCount: 0,
        order: 9
      }
    ];

    const edges: TopologyEdge[] = [
      // System call to applications
      {
        from: 'system-call',
        to: 'demo-8100',
        avgResTime: 1182.11,
        count: 112,
        errorCount: 0,
        activeTx: 26,
        label: '1,228.01ms(1(1))\n(ERR: 0.00%)\nACTX(26)',
        color: '#3b82f6',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'system-call',
        to: 'demo-8101',
        label: '1,257.61ms (109)\n(ERR: 0.00%)',
        color: '#3b82f6',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'system-call',
        to: 'demo-8102',
        label: '1,198.45ms (115)\n(ERR: 0.00%)',
        color: '#3b82f6',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'system-call',
        to: 'demo-8103',
        label: '1,520.33ms (89)\n(ERR: 2.50%)',
        color: '#ef4444',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'system-call',
        to: 'demo-8104',
        label: '1,125.78ms (310)\n(ERR: 0.30%)',
        color: '#3b82f6',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'system-call',
        to: 'demo-8105',
        label: '1,095.42ms (67)\n(ERR: 0.50%)',
        color: '#3b82f6',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      // Inbound to applications
      {
        from: 'inbound',
        to: 'demo-8101',
        label: 'ACTX(45)',
        color: '#22c55e',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'inbound',
        to: 'demo-8102',
        label: 'ACTX(120)',
        color: '#22c55e',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'inbound',
        to: 'demo-8104',
        label: 'ACTX(310)',
        color: '#22c55e',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      // Inter-application calls
      {
        from: 'demo-8101',
        to: 'demo-8102',
        label: '1,125.61ms (450)\n(ERR: 0.00%)',
        color: '#f97316',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'demo-8101',
        to: 'demo-8103',
        label: '1,520.33ms (280)\n(ERR: 2.50%)',
        color: '#ef4444',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'demo-8102',
        to: 'demo-8104',
        label: '1,125.78ms (380)\n(ERR: 0.00%)',
        color: '#06b6d4',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'demo-8103',
        to: 'demo-8105',
        label: '1,095.42ms (120)\n(ERR: 0.00%)',
        color: '#eab308',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      // Applications to DB
      {
        from: 'demo-8102',
        to: 'db-call',
        label: '850.25ms (620)\n(ERR: 0.00%)',
        color: '#f59e0b',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'demo-8104',
        to: 'db-call',
        label: '1,125.78ms (850)\n(ERR: 0.00%)',
        color: '#f59e0b',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'demo-8103',
        to: 'db-call',
        label: '1,520.33ms (89)\n(ERR: 2.50%)',
        color: '#ef4444',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      // Applications to external call
      {
        from: 'demo-8101',
        to: 'external-call',
        label: '1,179.43ms (100)\n(ERR: 0.00%)\nACTX(24)',
        color: '#3b82f6',
        dashes: true,
        arrows: { to: { enabled: true } }
      },
      {
        from: 'demo-8102',
        to: 'external-call',
        label: '1,259.15ms (101)\n(ERR: 0.00%)\nACTX(27)',
        color: '#3b82f6',
        dashes: true,
        arrows: { to: { enabled: true } }
      }
    ];

    return { nodes, edges };
  }, []);

  // Initialize network
  useEffect(() => {
    if (!networkRef.current) return;

    const { nodes, edges } = generateTopologyData();

    // Filter nodes and edges based on filters
    const filteredNodes = nodes.filter(node => {
      if (!selectAll && node.type === 'group') return false;
      if (!activeAgents && node.agents === 0) return false;
      if (searchKeyword && !node.label.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
      return true;
    });

    const filteredEdges = edges.filter(edge => {
      if (!showInbound && edge.from === 'inbound') return false;
      if (!showSystemCall && edge.from === 'system-call') return false;
      if (!showDBCall && edge.to === 'db-call') return false;
      return true;
    });

    // Convert to vis-network format with custom HTML labels
    const visNodes = filteredNodes.map(node => {
      let nodeSize = 45;
      if (node.type === 'db' || node.type === 'external') {
        nodeSize = 40;
      } else if (node.type === 'inbound' || node.type === 'system') {
        nodeSize = 35;
      }

      // Create custom HTML label with order badge and error weight
      let title = node.label;
      if (node.order) {
        title = `<div style="position: relative;">
          <div style="position: absolute; top: -20px; right: -20px; background: #f59e0b; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">
            ${node.order}
          </div>
          ${node.errorCount && node.errorCount > 0 ? `
          <div style="position: absolute; top: -20px; left: -25px; background: #ef4444; color: white; border-radius: 10px; padding: 2px 6px; font-size: 10px; font-weight: bold;">
            ${node.errorCount}
          </div>` : ''}
        </div>`;
      }

      return {
        id: node.id,
        label: node.label,
        title: title, // HTML tooltip
        shape: 'circle',
        color: {
          background: node.color || '#22c55e',
          border: '#ffffff',
          highlight: {
            background: node.color || '#22c55e',
            border: '#ffffff',
            borderWidth: 3
          }
        },
        size: nodeSize,
        font: {
          color: '#ffffff',
          size: 10,
          face: 'Arial',
          align: 'center'
        },
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.5)',
          size: 10,
          x: 2,
          y: 2
        },
        // Custom data for rendering
        order: node.order,
        errorCount: node.errorCount
      };
    });

    const visEdges = filteredEdges.map(edge => ({
      from: edge.from,
      to: edge.to,
      label: edge.label,
      color: {
        color: edge.color || '#3b82f6',
        highlight: edge.color || '#3b82f6',
        opacity: 0.8
      },
      dashes: edge.dashes || false,
      arrows: edge.arrows || { 
        to: { 
          enabled: true,
          scaleFactor: 1.2,
          type: 'arrow'
        }
      },
      font: {
        color: edge.color || '#3b82f6',
        size: 10,
        face: 'Arial',
        align: 'middle',
        strokeWidth: 3,
        strokeColor: '#000000'
      },
      width: 2,
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0.5
      },
      labelHighlightBold: false,
      selectionWidth: 3
    }));

    const data = { nodes: visNodes, edges: visEdges };

    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'LR', // Left to Right
          sortMethod: 'directed',
          levelSeparation: 200,
          nodeSpacing: 250,
          treeSpacing: 350,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
          shakeTowards: 'leaves'
        }
      },
      physics: {
        enabled: false // Disable physics for hierarchical layout
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.5
        },
        font: {
          size: 10,
          align: 'middle',
          strokeWidth: 3,
          strokeColor: '#000000'
        },
        labelHighlightBold: false,
        width: 2,
        selectionWidth: 3
      },
      nodes: {
        shape: 'circle',
        font: {
          size: 11,
          align: 'center'
        },
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.5)',
          size: 10,
          x: 2,
          y: 2
        }
      },
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
        hover: true,
        tooltipDelay: 100,
        hideEdgesOnDrag: false,
        hideEdgesOnZoom: false
      }
    };

    const network = new Network(networkRef.current, data, options);

    // Handle node click
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        if (nodeId.startsWith('demo-')) {
          onSelectApp?.(nodeId);
        }
      }
    });

    networkInstanceRef.current = network;

    return () => {
      network.destroy();
    };
  }, [selectAll, activeAgents, searchKeyword, showInbound, showSystemCall, showDBCall, generateTopologyData, onSelectApp]);

  // Auto refresh
  useEffect(() => {
    if (!isAutoRefresh) return;
    
    const timer = setInterval(() => {
      setLastRefresh(new Date());
      // Trigger refresh
    }, refreshInterval * 1000);
    
    return () => clearInterval(timer);
  }, [isAutoRefresh, refreshInterval]);

  const handleClearPosition = () => {
    if (networkInstanceRef.current) {
      networkInstanceRef.current.fit();
    }
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Trigger data refresh
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle>APP Topology</CardTitle>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="space-y-2">
          {/* Row 1: Select All, Active Agents, App Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={(e) => setSelectAll(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="select-all" className="text-sm cursor-pointer">Select all</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active-agents"
                checked={activeAgents}
                onChange={(e) => setActiveAgents(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="active-agents" className="text-sm cursor-pointer">Active agents</label>
            </div>
            <Badge variant="secondary" className="cursor-pointer">demo-8100</Badge>
            <Badge variant="secondary" className="cursor-pointer">demo-8101</Badge>
            <Badge variant="secondary" className="cursor-pointer">demo-8102</Badge>
            <Badge variant="secondary" className="cursor-pointer">demo-8103</Badge>
            <Badge variant="secondary" className="cursor-pointer">demo-8104</Badge>
            <Badge variant="secondary" className="cursor-pointer">demo-8105</Badge>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Insert keywords"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Row 2: Call Type Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant={showInbound ? "default" : "outline"}
              onClick={() => setShowInbound(!showInbound)}
              className="h-8 gap-2"
            >
              <Phone className="h-3 w-3" />
              Inbound
            </Button>
            <Button
              size="sm"
              variant={showSystemCall ? "default" : "outline"}
              onClick={() => setShowSystemCall(!showSystemCall)}
              className="h-8 gap-2"
            >
              <Server className="h-3 w-3" />
              System call
            </Button>
            <Button
              size="sm"
              variant={showDBCall ? "default" : "outline"}
              onClick={() => setShowDBCall(!showDBCall)}
              className="h-8 gap-2"
            >
              <Database className="h-3 w-3" />
              DB call
            </Button>
            <Button
              size="sm"
              variant={showCallInfo ? "default" : "outline"}
              onClick={() => setShowCallInfo(!showCallInfo)}
              className="h-8 gap-2"
            >
              <Activity className="h-3 w-3" />
              Call INFO
            </Button>
            <Button
              size="sm"
              variant={showWarnings ? "default" : "outline"}
              onClick={() => setShowWarnings(!showWarnings)}
              className="h-8 gap-2"
            >
              <AlertTriangle className="h-3 w-3" />
              Warning sign
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-2"
            >
              <Square className="h-3 w-3" />
              Node Selection
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-2"
            >
              <StopCircle className="h-3 w-3" />
              Stop
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearPosition}
                className="h-8 gap-2"
              >
                <LocateFixed className="h-3 w-3" />
                Clear Position
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="h-8 gap-2"
              >
                <RefreshCw className={`h-3 w-3 ${isAutoRefresh ? 'animate-spin' : ''}`} />
                refresh
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(100vh-320px)] border-t border-border bg-background relative">
          <div ref={networkRef} className="w-full h-full" />
          
          {/* Stats overlay */}
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur border border-border rounded p-2 text-xs">
            <div className="flex gap-4">
              <div>
                <span className="text-muted-foreground">Nodes:</span>
                <span className="ml-1 font-semibold">8</span>
              </div>
              <div>
                <span className="text-muted-foreground">Connections:</span>
                <span className="ml-1 font-semibold">16</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last refresh:</span>
                <span className="ml-1 font-semibold">{lastRefresh.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
