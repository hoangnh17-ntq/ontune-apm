'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Database, Globe, Server } from 'lucide-react';

interface ServiceTopologyMapProps {
  selectedApp: string;
}

interface ServiceNode {
  id: string;
  label: string;
  type: 'system' | 'inbound' | 'group' | 'db' | 'external';
  instance?: string;
  metric?: string;
  color: string;
  activeTx?: number;
  latency?: number;
  errorRate?: number;
  agentCount?: number;
}

interface ServiceEdge {
  from: string;
  to: string;
  label: string;
  latency?: number;
  color: string;
  dashes?: boolean;
}

export default function ServiceTopologyMap({ selectedApp }: ServiceTopologyMapProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'live' | '1h' | '24h'>('live');

  // Generate complete application topology (all ASM apps)
  const generateServiceTopology = useCallback(() => {
    const nodes: ServiceNode[] = [
      {
        id: 'system-call',
        label: 'System call\n127.0.0.1',
        type: 'system',
        color: '#3b82f6',
        activeTx: 0,
        latency: 0,
        errorRate: 0
      },
      {
        id: 'inbound',
        label: 'Inbound',
        type: 'inbound',
        color: '#22c55e',
        activeTx: 0,
        latency: 0,
        errorRate: 0
      },
      {
        id: 'demo-8100',
        label: 'Application\ndemo-8100\n(Java)',
        type: 'group',
        color: '#22c55e',
        activeTx: 28,
        latency: 142,
        errorRate: 0.1,
        agentCount: 1
      },
      {
        id: 'demo-8101',
        label: 'Application\ndemo-8101\n(Java)',
        type: 'group',
        color: '#22c55e',
        activeTx: 45,
        latency: 125,
        errorRate: 0.2,
        agentCount: 2
      },
      {
        id: 'demo-8102',
        label: 'Application\ndemo-8102\n(Java)',
        type: 'group',
        color: '#22c55e',
        activeTx: 120,
        latency: 180,
        errorRate: 0.1,
        agentCount: 3
      },
      {
        id: 'demo-8103',
        label: 'Application\ndemo-8103\n(Java)',
        type: 'group',
        color: '#ef4444',
        activeTx: 89,
        latency: 520,
        errorRate: 2.5,
        agentCount: 1
      },
      {
        id: 'demo-8104',
        label: 'Application\ndemo-8104\n(Java)',
        type: 'group',
        color: '#22c55e',
        activeTx: 310,
        latency: 125,
        errorRate: 0.3,
        agentCount: 4
      },
      {
        id: 'demo-8105',
        label: 'Application\ndemo-8105\n(Java)',
        type: 'group',
        color: '#22c55e',
        activeTx: 67,
        latency: 95,
        errorRate: 0.5,
        agentCount: 2
      },
      {
        id: 'db-call',
        label: 'DB call\nlocalhost:3306\nlocalhost:3310',
        type: 'db',
        color: '#f97316',
        activeTx: 0,
        latency: 0,
        errorRate: 0
      },
      {
        id: 'external-call',
        label: 'Outbound call\n192.168.1.102',
        type: 'external',
        color: '#3b82f6',
        activeTx: 0,
        latency: 0,
        errorRate: 0
      }
    ];

    const edges: ServiceEdge[] = [
      { from: 'system-call', to: 'demo-8100', label: '1,182ms (112)\n(ERR: 0.00%)', color: '#3b82f6', dashes: true },
      { from: 'system-call', to: 'demo-8101', label: '1,258ms (109)\n(ERR: 0.00%)', color: '#3b82f6', dashes: true },
      { from: 'system-call', to: 'demo-8102', label: '1,198ms (115)\n(ERR: 0.00%)', color: '#3b82f6', dashes: true },
      { from: 'system-call', to: 'demo-8103', label: '1,520ms (89)\n(ERR: 2.50%)', color: '#ef4444', dashes: true },
      { from: 'system-call', to: 'demo-8104', label: '1,126ms (310)\n(ERR: 0.30%)', color: '#3b82f6', dashes: true },
      { from: 'system-call', to: 'demo-8105', label: '1,095ms (67)\n(ERR: 0.50%)', color: '#3b82f6', dashes: true },
      { from: 'inbound', to: 'demo-8101', label: 'ACTX(45)', color: '#22c55e', dashes: true },
      { from: 'inbound', to: 'demo-8102', label: 'ACTX(120)', color: '#22c55e', dashes: true },
      { from: 'inbound', to: 'demo-8104', label: 'ACTX(310)', color: '#22c55e', dashes: true },
      { from: 'demo-8101', to: 'demo-8102', label: '1,126ms (450)\n(ERR: 0.00%)', color: '#f97316', dashes: true },
      { from: 'demo-8101', to: 'demo-8103', label: '1,520ms (280)\n(ERR: 2.50%)', color: '#ef4444', dashes: true },
      { from: 'demo-8102', to: 'demo-8104', label: '1,126ms (380)\n(ERR: 0.00%)', color: '#06b6d4', dashes: true },
      { from: 'demo-8103', to: 'demo-8105', label: '1,095ms (120)\n(ERR: 0.00%)', color: '#eab308', dashes: true },
      { from: 'demo-8102', to: 'db-call', label: '850ms (620)\n(ERR: 0.00%)', color: '#f97316', dashes: true },
      { from: 'demo-8104', to: 'db-call', label: '1,126ms (850)\n(ERR: 0.00%)', color: '#f97316', dashes: true },
      { from: 'demo-8103', to: 'db-call', label: '1,520ms (89)\n(ERR: 2.50%)', color: '#ef4444', dashes: true },
      { from: 'demo-8105', to: 'external-call', label: '1,095ms (67)\n(ERR: 0.50%)', color: '#3b82f6', dashes: true }
    ];

    return { nodes, edges };
  }, []);

  // Initialize network
  useEffect(() => {
    if (!networkRef.current) return;

    const { nodes, edges } = generateServiceTopology();

    // Convert to vis-network format with rectangular nodes
    const visNodes = nodes.map(node => {
      let nodeColor = node.color;
      if (node.type === 'system' || node.type === 'external') nodeColor = '#3b82f6';
      else if (node.type === 'inbound') nodeColor = '#22c55e';
      else if (node.type === 'group') {
        if (node.errorRate && node.errorRate > 2.0) nodeColor = '#ef4444';
        else if (node.latency && node.latency > 500) nodeColor = '#ef4444';
        else if (node.latency && node.latency > 200) nodeColor = '#f97316';
        else nodeColor = '#22c55e';
      }
      else if (node.type === 'db') nodeColor = '#f97316';

      let nodeSize = 40;
      if (node.type === 'db' || node.type === 'external') nodeSize = 35;
      else if (node.type === 'inbound' || node.type === 'system') nodeSize = 30;
      
      return {
        id: node.id,
        label: node.label,
        shape: 'circle',
        size: nodeSize,
        color: {
          background: nodeColor,
          border: '#ffffff',
          highlight: {
            background: nodeColor,
            border: '#ffffff',
            borderWidth: 3
          }
        },
        font: {
          color: '#ffffff',
          size: 11,
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
        }
      };
    });

    const visEdges = edges.map(edge => {
      return {
        from: edge.from,
        to: edge.to,
        label: edge.label,
        color: {
          color: edge.color,
          highlight: edge.color,
          opacity: 0.8
        },
        dashes: edge.dashes !== false,
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 1.2,
            type: 'arrow'
          }
        },
        font: {
          color: edge.color,
          size: 10,
          face: 'Arial',
          align: 'middle',
          strokeWidth: 3,
          strokeColor: '#000000'
        },
        width: 3,
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.5
        },
        labelHighlightBold: false
      };
    });

    const data = { nodes: visNodes, edges: visEdges };

    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'LR', // Left to Right
          sortMethod: 'directed',
          levelSeparation: 250,
          nodeSpacing: 300,
          treeSpacing: 400,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true
        }
      },
      physics: {
        enabled: false
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.5
        },
        font: {
          size: 12,
          align: 'middle',
          strokeWidth: 3,
          strokeColor: '#000000'
        },
        labelHighlightBold: false,
        width: 3,
        selectionWidth: 4
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
        tooltipDelay: 100
      }
    };

    const network = new Network(networkRef.current, data, options);

    // Handle node click
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        setSelectedNodeId(params.nodes[0]);
      } else {
        setSelectedNodeId(null);
      }
    });

    networkInstanceRef.current = network;

    return () => {
      network.destroy();
    };
  }, [generateServiceTopology]);

  const { nodes, edges } = generateServiceTopology();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Application Topology Map</CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={timeRange === 'live' ? 'default' : 'outline'}
                  onClick={() => setTimeRange('live')}
                >
                  Live
                </Button>
                <Button 
                  size="sm" 
                  variant={timeRange === '1h' ? 'default' : 'outline'}
                  onClick={() => setTimeRange('1h')}
                >
                  1H
                </Button>
                <Button 
                  size="sm" 
                  variant={timeRange === '24h' ? 'default' : 'outline'}
                  onClick={() => setTimeRange('24h')}
                >
                  24H
                </Button>
              </div>
            </div>
            <CardDescription>
              All applications running with ASM monitoring agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] max-h-[60vh] min-h-[320px] bg-[#0a0a0a] rounded-lg border border-border overflow-hidden relative">
              <div ref={networkRef} className="w-full h-full" />
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-green-500"></div>
                <span className="text-muted-foreground">Healthy (&lt; 100ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-orange-500"></div>
                <span className="text-muted-foreground">Warning (100-500ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500"></div>
                <span className="text-muted-foreground">Critical (&gt; 500ms)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Details */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-2">Service Info</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono">{selectedNode.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{selectedNode.type}</Badge>
                    </div>
                    {selectedNode.instance && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Instance:</span>
                        <span className="font-mono text-xs">{selectedNode.instance}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Performance Metrics</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Latency:</span>
                      <span className="text-green-400 font-mono">125ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">P95 Latency:</span>
                      <span className="text-yellow-400 font-mono">340ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">P99 Latency:</span>
                      <span className="text-red-400 font-mono">580ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Error Rate:</span>
                      <span className="text-green-400 font-mono">0.3%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Dependencies</div>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">PostgreSQL</Badge>
                    <Badge variant="secondary" className="text-xs ml-1">Redis Cache</Badge>
                  </div>
                </div>

                <Button size="sm" className="w-full">View Service Details</Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                Click on a service node to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
