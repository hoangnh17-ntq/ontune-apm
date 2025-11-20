'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Transaction } from '@/types/apm';
import { formatTime } from '@/lib/utils';
import { Activity, Globe, Server, User, Hash, AlertCircle, Database, Zap, Cloud } from 'lucide-react';

interface TransactionContextProps {
    transaction: Transaction;
    problemSpans?: any[]; // Using any[] for now to avoid circular dependency or complex type imports, can be refined
}

export default function TransactionContext({ transaction, problemSpans = [] }: TransactionContextProps) {
    const breakdown = [
        { label: 'Database Queries', value: 0.6, color: 'bg-blue-500', icon: <Database className="h-3.5 w-3.5" /> },
        { label: 'Application Logic', value: 0.3, color: 'bg-green-500', icon: <Zap className="h-3.5 w-3.5" /> },
        { label: 'External API Calls', value: 0.1, color: 'bg-amber-500', icon: <Cloud className="h-3.5 w-3.5" /> },
    ];

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Transaction Context
                </CardTitle>
                <CardDescription>Full context and performance metrics for this transaction</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-4 gap-4">
                    {/* Transaction ID */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            Transaction ID
                        </div>
                        <div className="font-mono text-sm font-semibold truncate" title={transaction.id}>
                            {transaction.id}
                        </div>
                    </div>

                    {/* Endpoint */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            Endpoint
                        </div>
                        <div className="font-mono text-sm font-semibold truncate" title={transaction.endpoint}>
                            {transaction.endpoint}
                        </div>
                    </div>

                    {/* Agent */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Server className="h-3 w-3" />
                            Agent
                        </div>
                        <div className="text-sm font-semibold">{transaction.agentId}</div>
                    </div>

                    {/* User */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            User/Session
                        </div>
                        <div className="text-sm font-semibold truncate" title={transaction.userId || 'anonymous'}>
                            {transaction.userId || 'anonymous'}
                        </div>
                    </div>

                    {/* Response Time */}
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Response Time</div>
                        <div className={`text-2xl font-bold ${transaction.responseTime > 1000 ? 'text-red-500' : transaction.responseTime > 500 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {transaction.responseTime}ms
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Status</div>
                        <Badge variant={transaction.status === 'error' ? 'destructive' : 'default'} className="text-sm">
                            {transaction.status === 'error' ? 'ERROR' : 'SUCCESS'}
                        </Badge>
                    </div>

                    {/* Method */}
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">HTTP Method</div>
                        <Badge variant="outline" className="text-sm font-mono">
                            {transaction.method || 'GET'}
                        </Badge>
                    </div>

                    {/* Timestamp */}
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Timestamp</div>
                        <div className="text-sm font-mono">{formatTime(transaction.timestamp)}</div>
                    </div>
                </div>

                {/* Problem Areas Alert */}
                {problemSpans.length > 0 && (
                    <Alert className="mt-4 border-orange-500/50 bg-orange-500/10">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <AlertDescription>
                            <strong className="text-orange-500">⚠️ {problemSpans.length} Problem Areas Detected:</strong>
                            <div className="mt-2 space-y-1">
                                {problemSpans.slice(0, 3).map((span, idx) => (
                                    <div key={idx} className="text-xs flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px]">{span.type}</Badge>
                                        <span className="font-mono truncate max-w-[300px]">{span.name}</span>
                                        <span className="ml-auto font-semibold text-orange-400">{span.duration}ms</span>
                                    </div>
                                ))}
                                {problemSpans.length > 3 && (
                                    <div className="text-xs text-muted-foreground">... and {problemSpans.length - 3} more</div>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Performance breakdown moved here */}
                <div className="mt-6 space-y-3">
                    <div className="text-sm font-semibold">Performance Breakdown</div>
                    <div className="space-y-2">
                        {breakdown.map((item) => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        {item.icon}
                                        {item.label}
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {(transaction.responseTime * item.value).toFixed(0)}ms
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`${item.color}`}
                                        style={{ width: `${item.value * 100}%`, height: '100%' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
