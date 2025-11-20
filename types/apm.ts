// APM Type Definitions - Transaction-Centric Architecture

export type TransactionStatus = 'very_slow' | 'slow' | 'normal' | 'fast' | 'error';
export type TransactionMethod = 'METHOD' | 'SQL' | 'HTTPC' | 'DBC' | 'SOCKET';
export type APMTab = 'overview' | 'transaction' | 'rum' | 'was' | 'monitor' | 'analysis' | 'topology' | 'report' | 'config';

// Shared health/status + project summary used by contextual sidebars
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface ProjectSummary {
  id: string;
  name: string;
  websiteCount: number;
  wasCount: number;
  webserverCount: number;
  tps: number;
  apdexScore: number;
  avgResponseTime: number;
  errorRate: number;
  status: HealthStatus;
}

// RUM Website summary & detail structures
export interface WebsiteSummary {
  id: string;
  name: string;
  project: string;
  status: HealthStatus;
  pageLoadTime: number;
  domContentLoaded: number;
  sessionCount: number;
  jsErrorRate: number;
  httpErrorRate: number;
}

export interface RumError {
  id: string;
  type: 'js' | 'http';
  message: string;
  time: string;
  status?: number;
}

export interface RumSessionTransaction {
  id: string;
  endpoint: string;
  status: 'ok' | 'error';
  duration: number;
}

export interface RumSession {
  id: string;
  user: string;
  country: string;
  device: string;
  browser: string;
  startTime: string;
  duration: number;
  pageViews: number;
  errors: RumError[];
  transactions: RumSessionTransaction[];
}

export interface WebsiteMetrics {
  resourceLoad: { time: string; value: number }[];
  fid: { time: string; value: number }[];
  inp: { time: string; value: number }[];
  browserBreakdown: { label: string; value: number; color: string }[];
  deviceBreakdown: { label: string; value: number; color: string }[];
  osBreakdown: { label: string; value: number; color: string }[];
  recentErrors: RumError[];
  recentSessions: RumSession[];
}

// WAS summary & detail structures
export interface WasSummary {
  id: string;
  name: string;
  project: string;
  status: HealthStatus;
  p95Latency: number;
  p99Latency: number;
  tps: number;
  throughput: number;
  errorRate: number;
  cpu: number;
  memory: number;
}

export interface WasMetrics {
  latencySeries: { time: string; p95: number; p99: number }[];
  transactionRate: { time: string; tps: number }[];
  threadSeries: { time: string; active: number; queue: number }[];
  gcSeries: { time: string; ms: number }[];
  resourceUsage: { label: string; value: number; unit: string }[];
  heapThreads: { id: string; type: 'heap' | 'thread'; description: string; severity: 'info' | 'warn' | 'error' }[];
}

// Core Transaction with full span details
export interface Transaction {
  id: string;
  traceId: string;
  timestamp: number;
  responseTime: number; // in milliseconds
  status: TransactionStatus;
  method: TransactionMethod;
  endpoint: string;
  agentId: string;
  agentName: string;
  userId?: string;
  errorMessage?: string;
  errorStack?: string;
  sqlQuery?: string;
  httpMethod?: string;
  httpStatusCode?: number;
  dbConnection?: string;
  spans?: Span[]; // Distributed trace spans
}

// Span for distributed tracing
export interface Span {
  spanId: string;
  parentId?: string;
  traceId: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  duration: number;
  tags: Record<string, any>;
  logs?: SpanLog[];
  kind: 'CLIENT' | 'SERVER' | 'PRODUCER' | 'CONSUMER' | 'INTERNAL';
  // For Bullet View rendering
  className?: string;
  methodName?: string;
  sqlStatement?: string;
  errorMessage?: string;
}

export interface SpanLog {
  timestamp: number;
  fields: Record<string, any>;
}

// Active Status
export interface ActiveStatus {
  method: TransactionMethod;
  count: number;
  avgResponseTime: number;
}

// APM Metrics
export interface APMMetrics {
  totalTransactions: number;
  activeTransactions: number;
  tps: number; // Transactions per second
  apdex: number; // 0-100
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  systemCpu: number;
  heapMemory: {
    used: number;
    max: number;
    committed: number;
  };
  todayTPS: number[];
  todayVisits: number[];
  concurrentUsers: number;
}

// JVM Metrics for Java Applications
export interface JVMMetrics {
  heapUsed: number;
  heapMax: number;
  heapCommitted: number;
  nonHeapUsed: number;
  nonHeapMax: number;
  threadCount: number;
  threadPeakCount: number;
  daemonThreadCount: number;
  gcCollectionCount: number;
  gcCollectionTime: number;
  youngGCCount: number;
  youngGCTime: number;
  oldGCCount: number;
  oldGCTime: number;
  // Thread Pool metrics
  threadPoolSize?: number;
  threadPoolActive?: number;
  threadPoolQueue?: number;
}

// Worker/Thread State
export interface WorkerThreadState {
  total: number;
  busy: number;
  idle: number;
  queueSize: number;
  queueCapacity: number;
  rejectedCount: number;
  saturation: number; // 0-100 percentage
}

// Database Transaction (in Java context)
export interface DBTransaction {
  id: string;
  javaTransactionId: string; // Link to Java transaction
  sqlText: string;
  executionTime: number;
  rowsAffected: number;
  connectionPoolName: string;
  isolationLevel: string;
  status: 'committed' | 'rollback' | 'active';
  waitClass?: string;
  sessionId?: string;
}

// Search/Filter for Analysis
export interface TransactionFilter {
  timeRange?: {
    start: number;
    end: number;
  };
  responseTime?: {
    min?: number;
    max?: number;
    operator?: '>' | '<' | '>=' | '<=' | '=';
  };
  status?: TransactionStatus[];
  method?: TransactionMethod[];
  endpoint?: string[];
  agentId?: string[];
  errorOnly?: boolean;
  query?: string; // Advanced query like "transaction_time > 3s"
}

// ASM (Application Service Monitoring) Configuration
export interface ASMConfig {
  enabled: boolean;
  agentId: string;
  agentName: string;
  javaVersion: string; // JDK 17, 21, 25
  applicationName: string;
  environment: 'dev' | 'uat' | 'prod';
  sampling: {
    enabled: boolean;
    rate: number; // 0-100 percentage
  };
  decompile: {
    enabled: boolean;
    cacheSize: number; // MB
    excludePackages: string[];
  };
  tracing: {
    enabled: boolean;
    captureSQL: boolean;
    captureHTTP: boolean;
    captureMethod: boolean;
    maxSpanDepth: number;
  };
  jvm: {
    captureHeapDump: boolean;
    captureThreadDump: boolean;
    gcLogging: boolean;
  };
}

// Agent Profile
export interface AgentProfile {
  id: string;
  name: string;
  version: string;
  registeredAt: number;
  lastHeartbeat: number;
  status: 'active' | 'inactive' | 'error';
  config: ASMConfig;
  metadata: {
    hostname: string;
    ip: string;
    os: string;
    jvmVersion: string;
    applicationVersion?: string;
  };
}

// Issue Detection
export interface Issue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'slow_transaction' | 'error_spike' | 'memory_leak' | 'gc_issue' | 'thread_deadlock' | 'sql_slow';
  title: string;
  description: string;
  detectedAt: number;
  affectedTransactions: string[]; // Transaction IDs
  relatedSpans?: string[]; // Span IDs
  metrics: Record<string, number>;
  suggestedActions: string[];
}

// Context Menu Action
export interface ContextMenuAction {
  label: string;
  icon: string;
  action: (transaction: Transaction) => void;
  shortcut?: string;
  navigateTo?: APMTab;
}
