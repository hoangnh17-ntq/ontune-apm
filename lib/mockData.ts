// Mock Data Generator for APM

import {
  Transaction,
  TransactionMethod,
  TransactionStatus,
  ActiveStatus,
  APMMetrics,
  Span,
  JVMMetrics,
  WorkerThreadState,
  DBTransaction,
  Issue,
  AgentProfile,
  ASMConfig,
  WebsiteSummary,
  WebsiteMetrics,
  RumError,
  RumSession,
  WasSummary,
  WasMetrics
} from '@/types/apm';

import type {
  ClusterSummary,
  NodeSummary,
  PodSummary,
  HealthStatus,
  ResourceStatus,
  K8sTopologyData
} from '@/types/kubernetes';

const methods: TransactionMethod[] = ['METHOD', 'SQL', 'HTTPC', 'DBC', 'SOCKET'];
const endpoints = [
  '/api/users',
  '/api/orders',
  '/api/products',
  '/api/payments',
  '/api/inventory',
  '/api/analytics',
  '/api/reports',
  '/api/auth/login',
];
const agents = [
  { id: 'demo-8101', name: 'demo-8101' },
  { id: 'demo-8102', name: 'demo-8102' },
  { id: 'demo-8103', name: 'demo-8103' },
  { id: 'demo-8104', name: 'demo-8104' },
  { id: 'demo-8105', name: 'demo-8105' },
];

const projects = ['E-Commerce Platform', 'Banking System', 'Payment Gateway', 'Analytics Dashboard'];
const mockDomains = [
  'shop.example.com',
  'bank.example.com',
  'payments.example.com',
  'analytics.example.com',
  'news.example.net',
  'portal.example.net',
  'iot.example.io',
  'media.example.dev',
  'cdn.example.dev',
  'status.example.io'
];

export const mockWASNames = [
  'auth-service',
  'payment-gateway',
  'order-service',
  'inventory-service',
  'notification-service',
  'user-profile',
  'analytics-worker',
  'reporting-api'
];

function getTransactionStatus(responseTime: number): TransactionStatus {
  if (responseTime < 100) return 'fast';
  if (responseTime < 500) return 'normal';
  if (responseTime < 2000) return 'slow';
  return 'very_slow';
}

export function generateTransaction(timestamp?: number): Transaction {
  const method = methods[Math.floor(Math.random() * methods.length)];
  const agent = agents[Math.floor(Math.random() * agents.length)];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  // Generate response time with realistic distribution matching WhaTap categories
  let responseTime: number;
  const random = Math.random();
  const hasError = Math.random() > 0.99;

  if (hasError) {
    responseTime = 8000 + Math.random() * 4000; // Error: 8-12s
  } else if (random > 0.85) {
    // 15% very slow (8s+) - RED
    responseTime = 8000 + Math.random() * 5000;
  } else if (random > 0.65) {
    // 20% slow (3-8s) - ORANGE
    responseTime = 3000 + Math.random() * 5000;
  } else {
    // 65% normal (0-3s) - BLUE
    responseTime = 100 + Math.random() * 2900;
  }

  const status = hasError ? 'error' : getTransactionStatus(responseTime);
  const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const traceId = `trace-${txId}`;

  return {
    id: txId,
    traceId,
    timestamp: timestamp || Date.now(),
    responseTime,
    status,
    method,
    endpoint,
    agentId: agent.id,
    agentName: agent.name,
    userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
    errorMessage: hasError ? 'NullPointerException at OrderService.java:245' : undefined,
    errorStack: hasError ? 'java.lang.NullPointerException\n\tat com.ontune.order.OrderService.processOrder(OrderService.java:245)\n\tat com.ontune.order.OrderController.createOrder(OrderController.java:89)' : undefined,
    sqlQuery: method === 'SQL' ? `SELECT * FROM users WHERE id = ${Math.floor(Math.random() * 1000)}` : undefined,
    httpMethod: method === 'HTTPC' ? ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)] : undefined,
    httpStatusCode: hasError ? 500 : (random > 0.95 ? 404 : 200),
    spans: Math.random() > 0.7 ? generateSpans(txId) : undefined // 30% have full span data
  };
}

export function generateTransactionHistory(count: number = 500, timeRangeMinutes: number = 15): Transaction[] {
  const transactions: Transaction[] = [];
  const now = Date.now();
  const timeRange = timeRangeMinutes * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const timestamp = now - Math.random() * timeRange;
    transactions.push(generateTransaction(timestamp));
  }

  return transactions.sort((a, b) => a.timestamp - b.timestamp);
}

export function generateActiveStatus(): ActiveStatus[] {
  return methods.map(method => ({
    method,
    count: Math.floor(Math.random() * 200),
    avgResponseTime: 20 + Math.random() * 300,
  }));
}

export function generateAPMMetrics(): APMMetrics {
  const now = Date.now();
  const hoursInDay = 24;

  // Generate TPS data for today (hourly)
  const todayTPS = Array.from({ length: hoursInDay }, () =>
    Math.floor(50 + Math.random() * 150)
  );

  // Generate visits data for today (hourly)
  const todayVisits = Array.from({ length: hoursInDay }, () =>
    Math.floor(500 + Math.random() * 1500)
  );

  const avgResponseTime = 100 + Math.random() * 200;

  return {
    totalTransactions: 12458,
    activeTransactions: 310,
    tps: Math.floor(100 + Math.random() * 80),
    apdex: 65 + Math.random() * 25,
    avgResponseTime,
    p95ResponseTime: avgResponseTime * 1.5,
    p99ResponseTime: avgResponseTime * 2.2,
    errorRate: Math.random() * 2,
    systemCpu: 40 + Math.random() * 40,
    heapMemory: {
      used: 35 + Math.random() * 20,
      max: 80,
      committed: 60
    },
    todayTPS,
    todayVisits,
    concurrentUsers: Math.floor(800 + Math.random() * 500),
  };
}

// Real-time transaction stream simulator
export class TransactionStream {
  private interval: NodeJS.Timeout | null = null;
  private callbacks: Array<(transaction: Transaction) => void> = [];

  start(intervalMs: number = 2000) {
    if (this.interval) return;

    this.interval = setInterval(() => {
      const transaction = generateTransaction();
      this.callbacks.forEach(cb => cb(transaction));
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  subscribe(callback: (transaction: Transaction) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
}

// Generate Distributed Trace Spans
export function generateSpans(transactionId: string, depth: number = 3): Span[] {
  const spans: Span[] = [];
  const traceId = `trace-${transactionId}`;

  // Root span - Controller
  const rootSpan: Span = {
    spanId: `span-${Date.now()}-0`,
    traceId,
    serviceName: 'order-service',
    operationName: 'OrderController.createOrder',
    startTime: Date.now() - 500,
    duration: 450,
    tags: { 'http.method': 'POST', 'http.url': '/api/orders' },
    kind: 'SERVER',
    className: 'com.ontune.order.OrderController',
    methodName: 'createOrder'
  };
  spans.push(rootSpan);

  // Service layer span
  const serviceSpan: Span = {
    spanId: `span-${Date.now()}-1`,
    parentId: rootSpan.spanId,
    traceId,
    serviceName: 'order-service',
    operationName: 'OrderService.processOrder',
    startTime: rootSpan.startTime + 10,
    duration: 400,
    tags: { 'component': 'business-logic' },
    kind: 'INTERNAL',
    className: 'com.ontune.order.OrderService',
    methodName: 'processOrder'
  };
  spans.push(serviceSpan);

  // DB span
  const dbSpan: Span = {
    spanId: `span-${Date.now()}-2`,
    parentId: serviceSpan.spanId,
    traceId,
    serviceName: 'postgres-db',
    operationName: 'INSERT INTO orders',
    startTime: serviceSpan.startTime + 50,
    duration: 150,
    tags: { 'db.type': 'sql', 'db.instance': 'orders_db' },
    kind: 'CLIENT',
    sqlStatement: 'INSERT INTO orders (customer_id, total) VALUES (?, ?)'
  };
  spans.push(dbSpan);

  // External API call span
  const apiSpan: Span = {
    spanId: `span-${Date.now()}-3`,
    parentId: serviceSpan.spanId,
    traceId,
    serviceName: 'payment-service',
    operationName: 'PaymentAPI.charge',
    startTime: serviceSpan.startTime + 220,
    duration: 120,
    tags: { 'http.method': 'POST', 'http.url': 'https://payment.api/charge' },
    kind: 'CLIENT'
  };
  spans.push(apiSpan);

  return spans;
}

// Generate JVM Metrics
export function generateJVMMetrics(): JVMMetrics {
  return {
    heapUsed: 800 + Math.random() * 400,
    heapMax: 2048,
    heapCommitted: 1536,
    nonHeapUsed: 150 + Math.random() * 50,
    nonHeapMax: 256,
    threadCount: 50 + Math.floor(Math.random() * 30),
    threadPeakCount: 80,
    daemonThreadCount: 25,
    gcCollectionCount: Math.floor(100 + Math.random() * 50),
    gcCollectionTime: Math.floor(1000 + Math.random() * 500),
    youngGCCount: Math.floor(80 + Math.random() * 40),
    youngGCTime: Math.floor(600 + Math.random() * 300),
    oldGCCount: Math.floor(5 + Math.random() * 5),
    oldGCTime: Math.floor(400 + Math.random() * 200),
    threadPoolSize: 200,
    threadPoolActive: Math.floor(50 + Math.random() * 100),
    threadPoolQueue: Math.floor(Math.random() * 20)
  };
}

// Website (RUM) mock data
export function generateWebsiteSummaries(count: number = 8): WebsiteSummary[] {
  return Array.from({ length: count }, (_, idx) => {
    const health: WebsiteSummary['status'] = Math.random() > 0.8 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'healthy';
    return {
      id: `web-${idx + 1}`,
      name: mockDomains[idx % mockDomains.length],
      project: projects[idx % projects.length],
      status: health,
      pageLoadTime: 1000 + Math.random() * 1200,
      domContentLoaded: 400 + Math.random() * 500,
      sessionCount: 200 + Math.floor(Math.random() * 900),
      jsErrorRate: +(Math.random() * 2).toFixed(2),
      httpErrorRate: +(Math.random() * 1.5).toFixed(2),
    };
  });
}

export function generateWebsiteMetrics(websiteId: string): WebsiteMetrics {
  const timeline = Array.from({ length: 12 }, (_, i) => `${i * 5}m`);
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Safari', 'Edge', 'Firefox'];
  const countries = ['US', 'VN', 'KR', 'JP', 'DE', 'UK'];

  const recentErrors: RumError[] = Array.from({ length: 6 }, (_, i) => ({
    id: `${websiteId}-err-${i}`,
    type: Math.random() > 0.5 ? 'js' : 'http',
    message: Math.random() > 0.5 ? 'Unhandled promise rejection in checkout.js' : 'HTTP 502 from /api/cart',
    time: `${10 + i}:0${Math.floor(Math.random() * 6)}`,
    status: Math.random() > 0.5 ? 502 : 500
  }));

  const recentSessions: RumSession[] = Array.from({ length: 8 }, (_, i) => {
    const sessionErrors: RumError[] = Array.from({ length: Math.floor(Math.random() * 3) }, (__, j) => ({
      id: `${websiteId}-sess-${i}-err-${j}`,
      type: Math.random() > 0.5 ? 'js' : 'http' as const,
      message: Math.random() > 0.5 ? 'TypeError: Cannot read properties of undefined' : 'Failed to fetch /api/payment',
      time: `${12 + i}:${(10 + j * 3).toString().padStart(2, '0')}`,
      status: Math.random() > 0.6 ? 500 : 502
    }));

    return {
      id: `${websiteId}-sess-${i + 1}`,
      user: `user-${Math.floor(1000 + Math.random() * 9000)}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      startTime: `${9 + Math.floor(i / 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      duration: 120 + Math.floor(Math.random() * 900),
      pageViews: 3 + Math.floor(Math.random() * 7),
      errors: sessionErrors,
      transactions: Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (__, k) => ({
        id: `${websiteId}-sess-${i + 1}-txn-${k + 1}`,
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        status: Math.random() > 0.8 ? 'error' : 'ok',
        duration: 180 + Math.floor(Math.random() * 1200)
      }))
    };
  });

  return {
    resourceLoad: timeline.map(t => ({ time: t, value: 800 + Math.random() * 600 })),
    fid: timeline.map(t => ({ time: t, value: 40 + Math.random() * 60 })),
    inp: timeline.map(t => ({ time: t, value: 120 + Math.random() * 200 })),
    browserBreakdown: [
      { label: 'Chrome', value: 56, color: '#3b82f6' },
      { label: 'Safari', value: 22, color: '#a855f7' },
      { label: 'Edge', value: 12, color: '#0ea5e9' },
      { label: 'Firefox', value: 10, color: '#f97316' },
    ],
    deviceBreakdown: [
      { label: 'Desktop', value: 58, color: '#22c55e' },
      { label: 'Mobile', value: 32, color: '#f59e0b' },
      { label: 'Tablet', value: 10, color: '#6366f1' },
    ],
    osBreakdown: [
      { label: 'Windows', value: 45, color: '#3b82f6' },
      { label: 'macOS', value: 25, color: '#a855f7' },
      { label: 'Linux', value: 15, color: '#22c55e' },
      { label: 'Android', value: 10, color: '#f97316' },
      { label: 'iOS', value: 5, color: '#0ea5e9' },
    ],
    recentErrors,
    recentSessions,
  };
}

// WAS mock data
export function generateWasSummaries(count: number = 8): WasSummary[] {
  return Array.from({ length: count }, (_, idx) => {
    const health: WasSummary['status'] = Math.random() > 0.8 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'healthy';
    return {
      id: `was-${idx + 1}`,
      name: mockWASNames[idx % mockWASNames.length],
      project: projects[idx % projects.length],
      status: health,
      p95Latency: 800 + Math.random() * 500,
      p99Latency: 1200 + Math.random() * 700,
      tps: 200 + Math.random() * 500,
      throughput: 50 + Math.random() * 120,
      errorRate: +(Math.random() * 2.5).toFixed(2),
      cpu: 30 + Math.random() * 50,
      memory: 40 + Math.random() * 40,
    };
  });
}

export function generateWasMetrics(wasId: string): WasMetrics {
  const timeline = Array.from({ length: 12 }, (_, i) => `${i * 5}m`);
  return {
    latencySeries: timeline.map(t => ({ time: t, p95: 700 + Math.random() * 400, p99: 1100 + Math.random() * 600 })),
    transactionRate: timeline.map(t => ({ time: t, tps: 150 + Math.random() * 250 })),
    threadSeries: timeline.map(t => ({ time: t, active: 40 + Math.random() * 30, queue: 5 + Math.random() * 15 })),
    gcSeries: timeline.map(t => ({ time: t, ms: 50 + Math.random() * 120 })),
    resourceUsage: [
      { label: 'CPU', value: +(30 + Math.random() * 50).toFixed(1), unit: '%' },
      { label: 'Memory', value: +(40 + Math.random() * 40).toFixed(1), unit: '%' },
      { label: 'Disk Read', value: +(20 + Math.random() * 40).toFixed(1), unit: 'MB/s' },
      { label: 'Disk Write', value: +(10 + Math.random() * 20).toFixed(1), unit: 'MB/s' },
      { label: 'Free Disk', value: +(100 + Math.random() * 200).toFixed(0), unit: 'GB' },
    ],
    heapThreads: Array.from({ length: 5 }, (_, i) => ({
      id: `${wasId}-heap-${i}`,
      type: Math.random() > 0.5 ? 'heap' : 'thread',
      description: Math.random() > 0.5 ? 'Old Gen utilization rising' : 'Thread pool queue length spiking',
      severity: Math.random() > 0.7 ? 'warn' : 'info'
    })),
  };
}

// Generate Worker/Thread State
export function generateWorkerThreadState(): WorkerThreadState {
  const total = 200;
  const busy = Math.floor(50 + Math.random() * 100);
  const queueSize = Math.floor(Math.random() * 30);
  const queueCapacity = 500;

  return {
    total,
    busy,
    idle: total - busy,
    queueSize,
    queueCapacity,
    rejectedCount: Math.floor(Math.random() * 5),
    saturation: Math.round((busy / total + queueSize / queueCapacity) / 2 * 100)
  };
}

// Generate DB Transactions (in Java context)
export function generateDBTransactions(javaTransactionId: string, count: number = 5): DBTransaction[] {
  const transactions: DBTransaction[] = [];
  const sqlStatements = [
    'SELECT * FROM users WHERE id = ?',
    'INSERT INTO orders (user_id, total) VALUES (?, ?)',
    'UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?',
    'DELETE FROM cart WHERE user_id = ? AND session_expired = true',
    'SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = ?'
  ];

  for (let i = 0; i < count; i++) {
    transactions.push({
      id: `db-tx-${Date.now()}-${i}`,
      javaTransactionId,
      sqlText: sqlStatements[Math.floor(Math.random() * sqlStatements.length)],
      executionTime: 10 + Math.random() * 200,
      rowsAffected: Math.floor(Math.random() * 100),
      connectionPoolName: 'hikari-pool-1',
      isolationLevel: 'READ_COMMITTED',
      status: Math.random() > 0.95 ? 'rollback' : 'committed',
      waitClass: Math.random() > 0.9 ? 'db file sequential read' : undefined,
      sessionId: `session-${Math.floor(Math.random() * 100)}`
    });
  }

  return transactions;
}

// Generate Issues for Report
export function generateIssues(): Issue[] {
  return [
    {
      id: 'issue-1',
      severity: 'critical',
      type: 'slow_transaction',
      title: 'Slow Transaction Detected on /api/orders',
      description: 'Transaction response time exceeded 3 seconds threshold. Detected 15 occurrences in the last hour.',
      detectedAt: Date.now() - 3600000,
      affectedTransactions: ['tx-1', 'tx-2', 'tx-3'],
      metrics: { avgResponseTime: 3500, p95: 4200, occurrences: 15 },
      suggestedActions: [
        'Check database query performance',
        'Review method execution time in OrderService.processOrder',
        'Consider adding database indexes'
      ]
    },
    {
      id: 'issue-2',
      severity: 'high',
      type: 'gc_issue',
      title: 'High GC Pause Time',
      description: 'Old Generation GC taking longer than 1 second, causing application pauses.',
      detectedAt: Date.now() - 1800000,
      affectedTransactions: [],
      metrics: { oldGCTime: 1500, frequency: 8 },
      suggestedActions: [
        'Increase heap size',
        'Review memory leaks in application',
        'Tune GC parameters'
      ]
    },
    {
      id: 'issue-3',
      severity: 'medium',
      type: 'sql_slow',
      title: 'Slow SQL Query Detected',
      description: 'SELECT query on orders table taking > 500ms consistently.',
      detectedAt: Date.now() - 900000,
      affectedTransactions: ['tx-10', 'tx-11'],
      relatedSpans: ['span-5', 'span-6'],
      metrics: { avgExecutionTime: 650, occurrences: 25 },
      suggestedActions: [
        'Add index on orders.customer_id',
        'Review query execution plan',
        'Consider query optimization'
      ]
    }
  ];
}

// Generate Agent Profile
export function generateAgentProfile(): AgentProfile {
  return {
    id: 'agent-demo-8104',
    name: 'demo-8104',
    version: '1.0.5',
    registeredAt: Date.now() - 86400000,
    lastHeartbeat: Date.now() - 5000,
    status: 'active',
    config: generateASMConfig(),
    metadata: {
      hostname: 'app-server-01',
      ip: '192.168.1.100',
      os: 'Linux 5.15.0',
      jvmVersion: 'OpenJDK 17.0.2',
      applicationVersion: '2.3.1'
    }
  };
}

// Generate ASM Configuration
export function generateASMConfig(): ASMConfig {
  return {
    enabled: true,
    agentId: 'agent-demo-8104',
    agentName: 'demo-8104',
    javaVersion: 'JDK 17',
    applicationName: 'order-service',
    environment: 'prod',
    sampling: {
      enabled: true,
      rate: 10
    },
    decompile: {
      enabled: true,
      cacheSize: 512,
      excludePackages: ['java.*', 'javax.*', 'sun.*', 'com.sun.*']
    },
    tracing: {
      enabled: true,
      captureSQL: true,
      captureHTTP: true,
      captureMethod: true,
      maxSpanDepth: 10
    },
    jvm: {
      captureHeapDump: false,
      captureThreadDump: true,
      gcLogging: true
    }
  };
}

// ============================================
// Kubernetes Mock Data Generators
// ============================================

const k8sClusterNames = ['kubernetes-211-2', 'kubernetes_163', 'jslee-k3s', 'be-k8s'];
const k8sVersions = ['v1.28.2', 'v1.27.5', 'v1.28.0+k3s1', 'v1.29.0'];
const containerImages = [
  'nginx:1.25',
  'redis:7.2',
  'postgres:15',
  'node:20-alpine',
  'python:3.11-slim',
  'java:17-jdk',
  'go:1.21-alpine'
];

export function generateK8sClusters(count: number = 2): ClusterSummary[] {
  return Array.from({ length: count }, (_, idx) => {
    const healthRoll = Math.random();
    const status: HealthStatus = healthRoll > 0.9 ? 'critical' : healthRoll > 0.7 ? 'warning' : 'healthy';

    return {
      id: `cluster-${idx + 1}`,
      name: k8sClusterNames[idx % k8sClusterNames.length],
      version: k8sVersions[idx % k8sVersions.length],
      status,
      nodeCount: 2 + Math.floor(Math.random() * 4),
      podCount: 20 + Math.floor(Math.random() * 100),
      namespaceCount: 3 + Math.floor(Math.random() * 6),
      cpuUsage: 20 + Math.random() * 60,
      memoryUsage: 30 + Math.random() * 50,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
}

export function generateK8sNodes(clusterId: string, clusterName: string, count: number = 3): NodeSummary[] {
  return Array.from({ length: count }, (_, idx) => {
    const statusRoll = Math.random();
    const status: ResourceStatus = statusRoll > 0.95 ? 'error' : statusRoll > 0.85 ? 'warning' : 'running';
    const role: NodeSummary['role'] = idx === 0 ? 'master' : 'worker';

    return {
      id: `${clusterId}-node-${idx + 1}`,
      name: `${clusterName}-node-${idx + 1}`,
      clusterId,
      clusterName,
      status,
      role,
      version: k8sVersions[Math.floor(Math.random() * k8sVersions.length)],
      osImage: 'Ubuntu 22.04.3 LTS',
      containerRuntime: 'containerd://1.6.24',
      cpuCapacity: 4 + Math.floor(Math.random() * 12),
      memoryCapacity: 8 + Math.floor(Math.random() * 24),
      cpuUsage: 15 + Math.random() * 70,
      memoryUsage: 20 + Math.random() * 60,
      podCount: 5 + Math.floor(Math.random() * 20),
      conditions: [
        { type: 'Ready', status: status === 'running' ? 'True' : 'False' },
        { type: 'MemoryPressure', status: 'False' },
        { type: 'DiskPressure', status: 'False' }
      ],
      labels: {
        'kubernetes.io/os': 'linux',
        ...(role === 'master' ? { 'node-role.kubernetes.io/master': '' } : { 'node-role.kubernetes.io/worker': '' })
      },
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
}

export function generateK8sPods(
  clusterId: string,
  clusterName: string,
  nodeName: string,
  count: number = 5
): PodSummary[] {
  const namespaces = ['default', 'kube-system', 'monitoring', 'app'];
  const podPrefixes = ['nginx', 'redis', 'api-server', 'worker', 'scheduler', 'db-proxy'];

  return Array.from({ length: count }, (_, idx) => {
    const statusRoll = Math.random();
    const status: ResourceStatus = statusRoll > 0.92 ? 'error' : statusRoll > 0.85 ? 'warning' : 'running';
    const phase: PodSummary['phase'] = status === 'running' ? 'Running' : status === 'error' ? 'Failed' : 'Pending';
    const prefix = podPrefixes[Math.floor(Math.random() * podPrefixes.length)];
    const suffix = Math.random().toString(36).substring(2, 7);

    const containerCount = 1 + Math.floor(Math.random() * 3);
    const containers: PodSummary['containers'] = Array.from({ length: containerCount }, (__, cIdx) => ({
      name: cIdx === 0 ? prefix : `sidecar-${cIdx}`,
      image: containerImages[Math.floor(Math.random() * containerImages.length)],
      status,
      restarts: Math.floor(Math.random() * 5)
    }));

    return {
      id: `${clusterId}-${nodeName}-pod-${idx + 1}`,
      name: `${prefix}-${suffix}`,
      namespace: namespaces[Math.floor(Math.random() * namespaces.length)],
      clusterId,
      clusterName,
      nodeName,
      status,
      phase,
      restartCount: containers.reduce((sum, c) => sum + c.restarts, 0),
      cpuUsage: 5 + Math.random() * 80,
      memoryUsage: 10 + Math.random() * 70,
      containers,
      labels: {
        app: prefix,
        version: 'v1',
        'apm-id': `810${Math.floor(Math.random() * 5) + 1}` // Mock APM ID
      },
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
}

export function generateK8sTopologyData(): K8sTopologyData {
  const clusters = generateK8sClusters(2);
  const nodes: NodeSummary[] = [];
  const pods: PodSummary[] = [];

  clusters.forEach((cluster) => {
    const clusterNodes = generateK8sNodes(cluster.id, cluster.name, cluster.nodeCount);
    nodes.push(...clusterNodes);

    clusterNodes.forEach((node) => {
      const nodePods = generateK8sPods(cluster.id, cluster.name, node.name, node.podCount);
      pods.push(...nodePods);
    });
  });

  return { clusters, nodes, pods };
}
