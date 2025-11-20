'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogEntry {
    id: string | number;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    message: string;
    source?: string;
}

interface LogTableWidgetProps {
    title: string;
    logs: LogEntry[];
    height?: number;
}

export default function LogTableWidget({
    title,
    logs,
    height = 300
}: LogTableWidgetProps) {
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'ERROR': return 'text-red-500';
            case 'WARN': return 'text-yellow-500';
            case 'INFO': return 'text-blue-500';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full rounded-md border" style={{ height: `${height}px` }}>
                    <table className="w-full text-xs">
                        <thead className="bg-muted/50 sticky top-0">
                            <tr className="text-left">
                                <th className="p-2 font-medium">Time</th>
                                <th className="p-2 font-medium">Level</th>
                                <th className="p-2 font-medium">Source</th>
                                <th className="p-2 font-medium">Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                    <td className="p-2 font-mono text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                                    <td className={`p-2 font-bold ${getLevelColor(log.level)}`}>{log.level}</td>
                                    <td className="p-2 text-muted-foreground">{log.source || '-'}</td>
                                    <td className="p-2">{log.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
