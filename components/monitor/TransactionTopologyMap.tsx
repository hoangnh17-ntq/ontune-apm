'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Database, Globe, Server } from 'lucide-react';
import { Transaction } from '@/types/apm';

interface TransactionTopologyMapProps {
  transaction: Transaction;
  className?: string;
}

interface TransactionNode {
  id: string;
  label: string;
  type: 'entry' | 'service' | 'db' | 'external';
  instance?: string;
  metric?: string;
  color: string;
  duration?: number;
  latency?: number;
  errorRate?: number;
}

interface TransactionEdge {
  from: string;
  to: string;
  label: string;
  latency?: number;
  color: string;
  dashes?: boolean;
}

export default function TransactionTopologyMap({ transaction, className }: TransactionTopologyMapProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Generate transaction topology based on spans
  const generateTransactionTopology = useCallback(() => {
    const spans = transaction.spans || [];
    const nodes: TransactionNode[] = [];
    const edges: TransactionEdge[] = [];

    // Entry node
    nodes.push({
      id: 'entry',
      label: `Entry\n${transaction.endpoint}`,
      type: 'entry',
      color: '#22c55e',
      duration: transaction.responseTime,
      latency: transaction.responseTime,
      errorRate: transaction.status === 'error' ? 100 : 0
    });

    // Service node
    nodes.push({
      id: 'service',
      label: `Service\n${transaction.agentName || 'Application'}`,
      type: 'service',
      color: transaction.status === 'error' ? '#ef4444' : 
              transaction.responseTime > 500 ? '#f97316' : 
              transaction.responseTime > 200 ? '#eab308' : '#22c55e',
      duration: transaction.responseTime,
      latency: transaction.responseTime,
      errorRate: transaction.status === 'error' ? 100 : 0
    });

    // Create edge from entry to service
    edges.push({
      from: 'entry',
      to: 'service',
      label: `${transaction.responseTime}ms\n(ERR: ${transaction.status === 'error' ? '100.00%' : '0.00%'})`,
      latency: transaction.responseTime,
      color: transaction.status === 'error' ? '#ef4444' : '#3b82f6',
      dashes: true
    });

    let previousNode = 'service';

    // Process spans to create additional nodes
    spans.forEach((span, index) => {
      const spanId = `span-${index}`;
      let nodeType: 'service' | 'db' | 'external' = 'service';
      let nodeColor = '#3b82f6';
      
      if ((span.kind || '').toLowerCase() === 'sql' || span.sqlStatement) {
        nodeType = 'db';
        nodeColor = '#f97316';
      } else if (span.tags?.['http.url']) {
        nodeType = 'external';
        nodeColor = '#8b5cf6';
      }

      const label = span.operationName || 
                   span.methodName || 
                   span.className?.split('.').pop() || 
                   `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} ${index + 1}`;

      nodes.push({
        id: spanId,
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}\n${label}`,
        type: nodeType,
        color: nodeColor,
        duration: span.duration || 0,
        latency: span.duration || 0
      });

      // Create edge from previous node
      const edgeLabel = span.duration ? 
        `${span.duration}ms\n(ERR: 0.00%)` : 
        'Call';
      
      edges.push({
        from: previousNode,
        to: spanId,
        label: edgeLabel,
        latency: span.duration,
        color: '#3b82f6',
        dashes: true
      });

      previousNode = spanId;
    });

    // Add final DB/External nodes if needed
    if (spans.length === 0) {
      nodes.push({
        id: 'db',
        label: 'Database\nlocalhost:3306',
        type: 'db',
        color: '#f97316',
        duration: 0,
        latency: 0,
        errorRate: 0
      });

      edges.push({
        from: 'service',
        to: 'db',
        label: `${transaction.responseTime}ms\n(ERR: 0.00%)`,
        latency: transaction.responseTime,
        color: '#f97316',
        dashes: true
      });
    }

    return { nodes, edges };
  }, [transaction]);

  // Initialize network
  useEffect(() => {
    if (!networkRef.current) return;

    const { nodes, edges } = generateTransactionTopology();

    // Convert to vis-network format with rectangular nodes
    const visNodes = nodes.map(node => {
      let nodeColor = node.color;
      if (node.type === 'entry') nodeColor = '#22c55e';
      else if (node.type === 'service') {
        if (node.errorRate && node.errorRate > 2.0) nodeColor = '#ef4444';
        else if (node.latency && node.latency > 500) nodeColor = '#ef4444';
        else if (node.latency && node.latency > 200) nodeColor = '#f97316';
        else nodeColor = '#22c55e';
      }
      else if (node.type === 'db') nodeColor = '#f97316';
      else if (node.type === 'external') nodeColor = '#8b5cf6';

      let nodeSize = 40;
      if (node.type === 'db' || node.type === 'external') nodeSize = 35;
      else if (node.type === 'entry') nodeSize = 30;
      
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
  }, [generateTransactionTopology]);

  const { nodes, edges } = generateTransactionTopology();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction Topology Map</CardTitle>
            </div>
            <CardDescription>
              Service flow and dependencies for this specific transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] bg-[#0a0a0a] rounded-lg border border-border overflow-hidden relative">
              <div ref={networkRef} className="w-full h-full" />
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-green-500"></div>
                <span className="text-muted-foreground">Entry Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span className="text-muted-foreground">Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-orange-500"></div>
                <span className="text-muted-foreground">Database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-purple-500"></div>
                <span className="text-muted-foreground">External</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Details */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Node Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-2">Node Info</div>
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
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="text-green-400 font-mono">{selectedNode.duration || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latency:</span>
                      <span className="text-yellow-400 font-mono">{selectedNode.latency || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Error Rate:</span>
                      <span className="text-red-400 font-mono">{selectedNode.errorRate || 0}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Dependencies</div>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">Transaction Flow</Badge>
                    <Badge variant="secondary" className="text-xs ml-1">Span Analysis</Badge>
                  </div>
                </div>

                <Button size="sm" className="w-full">View Node Details</Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                Click on a node to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}