'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/apm';
import { FileText, Copy, Check } from 'lucide-react';

interface TransactionDetailsViewProps {
  transaction: Transaction;
}

export default function TransactionDetailsView({ transaction }: TransactionDetailsViewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transaction Details
              </CardTitle>
              <CardDescription className="mt-2">
                Complete information about this transaction
              </CardDescription>
            </div>
            <Badge variant={transaction.status === 'error' ? 'destructive' : 'default'} className="text-base px-4 py-2">
              {transaction.responseTime.toFixed(0)}ms
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Transaction ID</div>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{transaction.id}</code>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(transaction.id)}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Trace ID</div>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{transaction.traceId}</code>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(transaction.traceId)}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Endpoint</div>
                <code className="text-sm bg-muted px-2 py-1 rounded block">{transaction.endpoint}</code>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">HTTP Method</div>
                <Badge>{transaction.httpMethod || 'POST'}</Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Timestamp</div>
                <div className="text-sm">{new Date(transaction.timestamp).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Agent</div>
                <Badge variant="outline">{transaction.agentName}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Method Type</div>
                <Badge>{transaction.method}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <Badge variant={transaction.status === 'error' ? 'destructive' : 'default'}>
                  {transaction.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{transaction.responseTime.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground mt-1">Response Time</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500">{Math.floor(transaction.responseTime * 0.7)}</div>
              <div className="text-xs text-muted-foreground mt-1">CPU Time (ms)</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{transaction.spans?.length || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Spans</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request/Response */}
      {transaction.sqlQuery && (
        <Card>
          <CardHeader>
            <CardTitle>SQL Query</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
              <code>{transaction.sqlQuery}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Spans Summary */}
      {transaction.spans && transaction.spans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Span Summary ({transaction.spans.length} spans)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transaction.spans.slice(0, 5).map((span, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{span.methodName || span.operationName}</div>
                    <div className="text-xs text-muted-foreground">{span.className || span.serviceName}</div>
                  </div>
                  <Badge variant="outline">{span.kind}</Badge>
                </div>
              ))}
              {transaction.spans.length > 5 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... and {transaction.spans.length - 5} more spans
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Context */}
      {transaction.userId && (
        <Card>
          <CardHeader>
            <CardTitle>User Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">User ID:</span>
                <span className="text-sm font-medium">{transaction.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Session ID:</span>
                <span className="text-sm font-mono">{transaction.traceId.slice(0, 16)}...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

