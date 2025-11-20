'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/apm';
import { formatDuration } from '@/lib/utils';
import { ChevronRight, ChevronDown, Clock, Database, Globe, Code, AlertCircle, FileCode } from 'lucide-react';
import TransactionContext from './TransactionContext';
import JavaSourceViewer from './JavaSourceViewer';

interface DistributedTraceViewProps {
  transaction: Transaction;
  onViewSource?: (span: any) => void;
  showContext?: boolean;
}

interface SpanNode {
  id: string;
  name: string;
  type: 'controller' | 'service' | 'repository' | 'database' | 'http' | 'method';
  startTime: number;
  duration: number;
  status: 'success' | 'error';
  depth: number;
  className?: string;
  methodName?: string;
  sql?: string;
  url?: string;
  errorMessage?: string;
  children: SpanNode[];
}

export default function DistributedTraceView({ transaction, onViewSource, showContext = true }: DistributedTraceViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set()); // Will be expanded after tree built
  const [selectedSpan, setSelectedSpan] = useState<SpanNode | null>(null);
  const [showSource, setShowSource] = useState(false);

  // Generate mock trace tree from transaction
  const generateTraceTree = (): SpanNode => {
    const rootSpan: SpanNode = {
      id: 'span-0',
      name: transaction.endpoint,
      type: 'controller',
      startTime: 0,
      duration: transaction.responseTime,
      status: transaction.status === 'error' ? 'error' : 'success',
      depth: 0,
      className: 'com.ontune.api.controller.OrderController',
      methodName: 'createOrder',
      children: []
    };

    // Add child spans
    let currentTime = 10;

    // Service layer
    const serviceSpan: SpanNode = {
      id: 'span-1',
      name: 'OrderService.validateUser',
      type: 'service',
      startTime: currentTime,
      duration: 150,
      status: 'success',
      depth: 1,
      className: 'com.ontune.service.OrderService',
      methodName: 'validateUser',
      children: []
    };
    currentTime += 160;

    // Repository layer with DB query
    const repoSpan: SpanNode = {
      id: 'span-2',
      name: 'UserService.getUserProfile',
      type: 'service',
      startTime: currentTime,
      duration: 89,
      status: 'success',
      depth: 1,
      className: 'com.ontune.service.UserService',
      methodName: 'getUserProfile',
      children: [
        {
          id: 'span-2-1',
          name: 'SELECT * FROM users WHERE id = ?',
          type: 'database',
          startTime: currentTime + 5,
          duration: 10,
          status: 'success',
          depth: 2,
          sql: 'SELECT * FROM users WHERE user_id = ? AND status = ?',
          children: []
        }
      ]
    };
    currentTime += 95;

    // Inventory service
    const inventorySpan: SpanNode = {
      id: 'span-3',
      name: 'InventoryService.checkStock',
      type: 'service',
      startTime: currentTime,
      duration: 85,
      status: 'success',
      depth: 1,
      className: 'com.ontune.service.InventoryService',
      methodName: 'checkStock',
      children: [
        {
          id: 'span-3-1',
          name: 'SELECT * FROM inventory WHERE product_id = ?',
          type: 'database',
          startTime: currentTime + 8,
          duration: 18,
          status: 'success',
          depth: 2,
          sql: 'SELECT * FROM inventory WHERE product_id = ? AND warehouse_id = ?',
          children: []
        }
      ]
    };
    currentTime += 90;

    // Payment service (slow or error)
    const paymentSpan: SpanNode = {
      id: 'span-4',
      name: 'PaymentService.processPayment',
      type: 'service',
      startTime: currentTime,
      duration: transaction.status === 'error' ? 245 : 200,
      status: transaction.status === 'error' ? 'error' : 'success',
      depth: 1,
      className: 'com.ontune.service.PaymentService',
      methodName: 'processPayment',
      errorMessage: transaction.status === 'error' ? 'java.lang.NullPointerException: Cannot invoke "Order.getPaymentId()" because "order" is null' : undefined,
      children: [
        {
          id: 'span-4-1',
          name: 'POST /api/payment/charge',
          type: 'http',
          startTime: currentTime + 15,
          duration: 90,
          status: 'success',
          depth: 2,
          url: 'https://payment.external.com/api/charge',
          children: []
        }
      ]
    };
    currentTime += transaction.status === 'error' ? 250 : 205;

    // Email notification
    const emailSpan: SpanNode = {
      id: 'span-5',
      name: 'EmailService.sendConfirmation',
      type: 'service',
      startTime: currentTime,
      duration: 40,
      status: 'success',
      depth: 1,
      className: 'com.ontune.service.EmailService',
      methodName: 'sendConfirmation',
      children: [
        {
          id: 'span-5-1',
          name: 'INSERT INTO orders',
          type: 'database',
          startTime: currentTime + 5,
          duration: 15,
          status: 'success',
          depth: 2,
          sql: 'INSERT INTO orders (user_id, product_id, amount, status) VALUES (?, ?, ?, ?)',
          children: []
        }
      ]
    };

    rootSpan.children = [serviceSpan, repoSpan, inventorySpan, paymentSpan, emailSpan];
    return rootSpan;
  };

  const getAllSpanIds = (span: SpanNode): string[] => {
    const ids = [span.id];
    span.children.forEach(child => {
      ids.push(...getAllSpanIds(child));
    });
    return ids;
  };

  const traceTree = generateTraceTree();
  const totalDuration = transaction.responseTime;
  const spanCount = getAllSpanIds(traceTree).length;

  // Expand all spans when the detail screen is opened
  useEffect(() => {
    setExpandedNodes(new Set(getAllSpanIds(traceTree)));
    setShowSource(false); // reset source viewer when switching transaction
  }, [transaction]); // re-run for each transaction change

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getSpanIcon = (type: string) => {
    switch (type) {
      case 'controller': return <Code className="h-4 w-4" />;
      case 'service': return <Code className="h-4 w-4" />;
      case 'repository': return <Database className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'http': return <Globe className="h-4 w-4" />;
      case 'method': return <Code className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const getSpanColor = (type: string, status: string) => {
    if (status === 'error') return 'bg-red-500';
    switch (type) {
      case 'controller': return 'bg-purple-500';
      case 'service': return 'bg-blue-500';
      case 'repository': return 'bg-green-500';
      case 'database': return 'bg-orange-500';
      case 'http': return 'bg-cyan-500';
      case 'method': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'controller': return 'Controller';
      case 'service': return 'Service';
      case 'repository': return 'Repository';
      case 'database': return 'SQL';
      case 'http': return 'HTTP';
      case 'method': return 'Method';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'controller': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'service': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'repository': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'database': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'http': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const renderSpanNode = (span: SpanNode) => {
    const isExpanded = expandedNodes.has(span.id);
    const hasChildren = span.children.length > 0;
    const barWidth = (span.duration / totalDuration) * 100;
    const barOffset = (span.startTime / totalDuration) * 100;
    const percentage = ((span.duration / totalDuration) * 100).toFixed(1);

    return (
      <div key={span.id} className="space-y-1 w-full">
        {/* Span Row */}
        <div
          className={`
            group relative flex items-center gap-3 py-2.5 px-3 rounded-md
            border border-transparent hover:border-border hover:bg-muted/50
            cursor-pointer transition-all
            ${selectedSpan?.id === span.id ? 'bg-accent/50 border-primary' : ''}
          `}
          style={{
            marginLeft: `${span.depth * 24}px`,
            maxWidth: `calc(100% - ${span.depth * 24}px)`
          }}
          onClick={() => setSelectedSpan(span)}
        >
          {/* Left Border Indicator */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${getSpanColor(span.type, span.status)}`}
          />

          {/* Expand/Collapse Button */}
          <div className="w-5 flex-shrink-0">
            {hasChildren ? (
              <button
                onClick={(e) => { e.stopPropagation(); toggleNode(span.id); }}
                className="hover:bg-accent rounded p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}
          </div>

          {/* Type Icon & Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`p-1.5 rounded ${getSpanColor(span.type, span.status)}`}>
              {getSpanIcon(span.type)}
            </div>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium ${getTypeBadgeColor(span.type)}`}>
              {getTypeLabel(span.type)}
            </Badge>
          </div>

          {/* Span Name & Metadata */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm truncate font-medium">
                {span.name}
              </span>
              {span.status === 'error' && (
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
            </div>

            {/* Additional Info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {span.className && (
                <span className="truncate max-w-[300px]">
                  {span.className}.{span.methodName}()
                </span>
              )}
              {span.sql && (
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  SQL Query
                </span>
              )}
              {span.url && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {new URL(span.url).hostname}
                </span>
              )}
            </div>
          </div>

          {/* Duration & Percentage */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-sm font-mono font-semibold">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatDuration(span.duration)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Waterfall Timeline Bar */}
        <div
          className="relative h-8 bg-muted/20 rounded-sm border border-border/50 overflow-hidden"
          style={{
            marginLeft: `${span.depth * 24}px`,
            maxWidth: `calc(100% - ${span.depth * 24}px)`
          }}
        >
          {/* Time markers */}
          <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] text-muted-foreground/50 font-mono">
            <span>0ms</span>
            <span>{(totalDuration / 4).toFixed(0)}ms</span>
            <span>{(totalDuration / 2).toFixed(0)}ms</span>
            <span>{(totalDuration * 3 / 4).toFixed(0)}ms</span>
            <span>{totalDuration.toFixed(0)}ms</span>
          </div>

          {/* Duration Bar */}
          <div
            className={`
              absolute h-full rounded-sm ${getSpanColor(span.type, span.status)}
              opacity-90 shadow-sm transition-all
              hover:opacity-100 hover:shadow-md
            `}
            style={{
              left: `${barOffset}%`,
              width: `${barWidth}%`,
              minWidth: '2px'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {span.duration > 30 && (
                <span className="text-[10px] text-white font-bold drop-shadow">
                  {formatDuration(span.duration)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Children (when expanded) */}
        {isExpanded && hasChildren && (
          <div className="space-y-1 pt-1">
            {span.children.map(child => renderSpanNode(child))}
          </div>
        )}
      </div>
    );
  };

  const expandAll = () => {
    setExpandedNodes(new Set(getAllSpanIds(traceTree)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Identify slow/problem spans
  const avgSpanDuration = totalDuration / 12;
  const findSlowSpans = (node: SpanNode): SpanNode[] => {
    const slow: SpanNode[] = [];
    if (node.duration > avgSpanDuration * 2 || node.status === 'error') {
      slow.push(node);
    }
    node.children.forEach(child => slow.push(...findSlowSpans(child)));
    return slow;
  };
  const problemSpans = findSlowSpans(traceTree);

  return (
    <div className="space-y-4">
      {/* Transaction Context Header */}
      {showContext && (
        <TransactionContext transaction={transaction} problemSpans={problemSpans} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: call stack */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Distributed Trace <span className="text-blue-400">(Transaction Call Tree)</span></CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span>Trace ID: <span className="font-mono text-primary">{transaction.traceId}</span></span>
                    <span>•</span>
                    <span>Total Duration: <span className="font-semibold text-foreground">{formatDuration(totalDuration)}</span></span>
                    <span>•</span>
                    <span>Spans: <span className="font-semibold text-foreground">{spanCount}</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={expandAll}>
                    Expand All
                  </Button>
                  <Button size="sm" variant="outline" onClick={collapseAll}>
                    Collapse All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto overflow-x-hidden">
              <div className="w-full overflow-hidden">
                {renderSpanNode(traceTree)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: span details alongside call stack */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selected Span Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSpan ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold mb-1">Span Name</div>
                    <div className="text-sm font-mono bg-muted p-2 rounded">{selectedSpan.name}</div>
                  </div>

                  {selectedSpan.className && (
                    <div>
                      <div className="text-sm font-semibold mb-1">Class</div>
                      <div className="text-sm font-mono text-blue-400">{selectedSpan.className}</div>
                    </div>
                  )}

                  {selectedSpan.methodName && (
                    <div>
                      <div className="text-sm font-semibold mb-1">Method</div>
                      <div className="text-sm font-mono text-green-400">{selectedSpan.methodName}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-semibold mb-1">Duration</div>
                    <div className="text-sm font-mono">{formatDuration(selectedSpan.duration)}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-1">Start Time</div>
                    <div className="text-sm font-mono">{selectedSpan.startTime}ms</div>
                  </div>

                  {selectedSpan.sql && (
                    <div>
                      <div className="text-sm font-semibold mb-1">SQL Query</div>
                      <div className="text-xs font-mono bg-muted p-2 rounded whitespace-pre-wrap">{selectedSpan.sql}</div>
                    </div>
                  )}

                  {selectedSpan.url && (
                    <div>
                      <div className="text-sm font-semibold mb-1">HTTP URL</div>
                      <div className="text-xs font-mono text-cyan-400 break-all">{selectedSpan.url}</div>
                    </div>
                  )}

                  {selectedSpan.errorMessage && (
                    <div>
                      <div className="text-sm font-semibold mb-1 text-red-500">Error Stack Trace</div>
                      <div className="text-xs font-mono bg-red-500/10 text-red-400 p-2 rounded whitespace-pre-wrap border border-red-500/20">
                        {selectedSpan.errorMessage}
                      </div>
                    </div>
                  )}

                  {(selectedSpan.className && selectedSpan.methodName && !selectedSpan.sql) && (
                    <div className="pt-4 space-y-2">
                      <Button
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => {
                          setShowSource(true);
                          onViewSource?.(selectedSpan);
                        }}
                      >
                        <FileCode className="h-4 w-4" />
                        View Source Code (Line {Math.floor(Math.random() * 100) + 1})
                      </Button>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Badge variant="outline" className="w-full justify-center">
                      Type: {selectedSpan.type}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Click on a span to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inline Java source viewer toggled by "View Source Code" */}
      {showSource && (
        <div className="space-y-4">
          <JavaSourceViewer />
        </div>
      )}
    </div>
  );
}
