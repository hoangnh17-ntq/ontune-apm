'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types/apm';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Cpu, Activity, Clock, AlertCircle, CheckCircle, XCircle, Layers } from 'lucide-react';

interface TransactionResourcesViewProps {
  transaction: Transaction;
}

interface DBTransaction {
  id: string;
  sql: string;
  duration: number;
  status: 'committed' | 'rollback' | 'active';
  connectionId: string;
  rowsAffected?: number;
  startTime: number;
}

interface ThreadSnapshot {
  threadId: string;
  threadName: string;
  state: 'RUNNABLE' | 'BLOCKED' | 'WAITING' | 'TIMED_WAITING';
  cpuTime: number;
  waitTime: number;
  stackTrace: string[];
}

export default function TransactionResourcesView({ transaction }: TransactionResourcesViewProps) {
  const [dbTransactions, setDbTransactions] = useState<DBTransaction[]>([]);
  const [threadSnapshot, setThreadSnapshot] = useState<ThreadSnapshot | null>(null);
  const [jvmSnapshot, setJvmSnapshot] = useState({
    heapUsed: 1024,
    heapMax: 2048,
    cpuUsage: 45.2,
    threadCount: 78,
    gcCount: 3,
    gcTime: 125
  });

  useEffect(() => {
    // Generate mock DB transactions for this Java transaction
    const mockDBTransactions: DBTransaction[] = [
      {
        id: 'db-1',
        sql: 'SELECT * FROM users WHERE user_id = ? AND status = ?',
        duration: 12.5,
        status: 'committed',
        connectionId: 'conn-pool-01',
        rowsAffected: 1,
        startTime: transaction.timestamp + 10
      },
      {
        id: 'db-2',
        sql: 'SELECT product_id, name, price FROM products WHERE category = ? ORDER BY popularity DESC LIMIT 20',
        duration: 28.3,
        status: 'committed',
        connectionId: 'conn-pool-02',
        rowsAffected: 20,
        startTime: transaction.timestamp + 45
      },
      {
        id: 'db-3',
        sql: 'INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
        duration: 8.7,
        status: 'committed',
        connectionId: 'conn-pool-01',
        rowsAffected: 1,
        startTime: transaction.timestamp + 95
      },
      {
        id: 'db-4',
        sql: 'UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND quantity >= ?',
        duration: 15.2,
        status: 'committed',
        connectionId: 'conn-pool-03',
        rowsAffected: 1,
        startTime: transaction.timestamp + 118
      },
      {
        id: 'db-5',
        sql: 'SELECT COUNT(*) FROM order_items WHERE order_id = ?',
        duration: 5.1,
        status: 'committed',
        connectionId: 'conn-pool-02',
        rowsAffected: 1,
        startTime: transaction.timestamp + 155
      }
    ];

    setDbTransactions(mockDBTransactions);

    // Generate mock thread snapshot
    setThreadSnapshot({
      threadId: 'thread-' + Math.floor(Math.random() * 100),
      threadName: `http-nio-8080-exec-${Math.floor(Math.random() * 20) + 1}`,
      state: 'RUNNABLE',
      cpuTime: transaction.responseTime * 0.7,
      waitTime: transaction.responseTime * 0.3,
      stackTrace: [
        'com.ontune.api.controller.OrderController.createOrder(OrderController.java:93)',
        'com.ontune.service.OrderService.processOrder(OrderService.java:156)',
        'com.ontune.service.PaymentService.validatePayment(PaymentService.java:78)',
        'com.ontune.repository.OrderRepository.save(OrderRepository.java:45)',
        'org.springframework.data.jpa.repository.support.SimpleJpaRepository.save(SimpleJpaRepository.java:559)',
        'javax.servlet.http.HttpServlet.service(HttpServlet.java:741)'
      ]
    });
  }, [transaction]);

  const totalDBTime = dbTransactions.reduce((sum, db) => sum + db.duration, 0);
  const dbPercentage = ((totalDBTime / transaction.responseTime) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded">
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dbTransactions.length}</div>
                <div className="text-xs text-muted-foreground">DB Queries</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalDBTime.toFixed(1)}ms</div>
                <div className="text-xs text-muted-foreground">DB Time ({dbPercentage}%)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{threadSnapshot?.threadName.split('-').pop()}</div>
                <div className="text-xs text-muted-foreground">Thread ID</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded">
                <Cpu className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{jvmSnapshot.cpuUsage.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">CPU at Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DB Transactions (Java Context) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                DB Transactions in This Request
              </CardTitle>
              <CardDescription className="mt-1">
                SQL queries executed within transaction <span className="font-mono text-xs">{transaction.id}</span>
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {dbTransactions.length} queries • {totalDBTime.toFixed(1)}ms total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-blue-500/10 border-blue-500/20">
            <Database className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-xs">
              <strong>DB Transaction Context:</strong> These are the actual SQL queries executed during this Java transaction. 
              The timing shows when each query started relative to the transaction start time.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {dbTransactions.map((db, index) => (
              <div key={db.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <Badge variant={db.status === 'committed' ? 'default' : db.status === 'rollback' ? 'destructive' : 'secondary'}>
                      {db.status === 'committed' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Committed</>
                      ) : db.status === 'rollback' ? (
                        <><XCircle className="h-3 w-3 mr-1" /> Rollback</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" /> Active</>
                      )}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400">{db.duration.toFixed(1)}ms</div>
                    <div className="text-xs text-muted-foreground">
                      +{(db.startTime - transaction.timestamp).toFixed(0)}ms from start
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded font-mono text-xs mb-2 overflow-x-auto">
                  {db.sql}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Connection: <span className="font-mono text-foreground">{db.connectionId}</span></span>
                  {db.rowsAffected !== undefined && (
                    <span>Rows: <span className="font-semibold text-foreground">{db.rowsAffected}</span></span>
                  )}
                  <span className="ml-auto">
                    {((db.duration / transaction.responseTime) * 100).toFixed(1)}% of total time
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thread Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Thread State Snapshot
          </CardTitle>
          <CardDescription>Worker thread that handled this transaction</CardDescription>
        </CardHeader>
        <CardContent>
          {threadSnapshot && (
            <div className="space-y-4">
              <Alert className="bg-purple-500/10 border-purple-500/20">
                <Activity className="h-4 w-4 text-purple-400" />
                <AlertDescription className="text-xs">
                  <strong>Thread Context:</strong> This transaction was processed by thread <span className="font-mono">{threadSnapshot.threadName}</span>. 
                  The snapshot shows the thread state at transaction execution time.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Thread Name</div>
                  <div className="font-mono text-sm font-semibold">{threadSnapshot.threadName}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Thread ID</div>
                  <div className="font-mono text-sm font-semibold">{threadSnapshot.threadId}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">State</div>
                  <Badge variant="default">{threadSnapshot.state}</Badge>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">CPU Time</div>
                  <div className="text-sm font-semibold">{threadSnapshot.cpuTime.toFixed(1)}ms</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Stack Trace at Transaction Time
                </div>
                <div className="bg-muted/50 p-4 rounded font-mono text-xs space-y-1 max-h-[200px] overflow-y-auto">
                  {threadSnapshot.stackTrace.map((line, i) => (
                    <div key={i} className="text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-0.5 rounded cursor-pointer">
                      <span className="text-blue-400 mr-2">#{i}</span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* JVM Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            JVM Metrics Snapshot
          </CardTitle>
          <CardDescription>Java Virtual Machine state at transaction execution time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Heap Memory</div>
              <div className="text-2xl font-bold">{jvmSnapshot.heapUsed} MB</div>
              <div className="text-xs text-muted-foreground mt-1">/ {jvmSnapshot.heapMax} MB</div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(jvmSnapshot.heapUsed / jvmSnapshot.heapMax) * 100}%` }}
                />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">CPU Usage</div>
              <div className="text-2xl font-bold">{jvmSnapshot.cpuUsage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">at execution time</div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500"
                  style={{ width: `${jvmSnapshot.cpuUsage}%` }}
                />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Active Threads</div>
              <div className="text-2xl font-bold">{jvmSnapshot.threadCount}</div>
              <div className="text-xs text-muted-foreground mt-1">worker threads</div>
              <Badge variant="secondary" className="mt-2">Normal</Badge>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">GC Collections</div>
              <div className="text-2xl font-bold">{jvmSnapshot.gcCount}</div>
              <div className="text-xs text-muted-foreground mt-1">during transaction</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">GC Time</div>
              <div className="text-2xl font-bold">{jvmSnapshot.gcTime}ms</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((jvmSnapshot.gcTime / transaction.responseTime) * 100).toFixed(1)}% of response time
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Thread Pool</div>
              <div className="text-2xl font-bold">78/200</div>
              <div className="text-xs text-muted-foreground mt-1">39% utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





