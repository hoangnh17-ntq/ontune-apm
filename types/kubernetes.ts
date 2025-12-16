// Kubernetes Type Definitions

export type KubernetesTab =
  | 'overview'
  | 'cluster'
  | 'node'
  | 'pod'
  | 'namespace'
  | 'network'
  | 'storage'
  | 'workloads'
  | 'topology-flow';
export type ResourceStatus = 'running' | 'error' | 'warning' | 'pending' | 'terminated' | 'unknown';
export type HealthStatus = 'healthy' | 'warning' | 'critical';

// Cluster
export interface ClusterSummary {
  id: string;
  name: string;
  version: string;
  status: HealthStatus;
  nodeCount: number;
  podCount: number;
  namespaceCount: number;
  cpuUsage: number;
  memoryUsage: number;
  createdAt: string;
}

export interface ClusterMetrics {
  cpuUsage: Array<{ time: string; value: number }>;
  memoryUsage: Array<{ time: string; value: number }>;
  podUsage: Array<{ time: string; value: number }>;
  networkIn: Array<{ time: string; value: number }>;
  networkOut: Array<{ time: string; value: number }>;
}

// Node
export interface NodeSummary {
  id: string;
  name: string;
  clusterId: string;
  clusterName: string;
  status: ResourceStatus;
  role: 'master' | 'worker';
  version: string;
  osImage: string;
  containerRuntime: string;
  cpuCapacity: number;
  memoryCapacity: number;
  cpuUsage: number;
  memoryUsage: number;
  podCount: number;
  conditions: Array<{ type: string; status: string; message?: string }>;
  labels: Record<string, string>;
  createdAt: string;
}

// Pod
export interface PodSummary {
  id: string;
  name: string;
  namespace: string;
  clusterId: string;
  clusterName: string;
  nodeName: string;
  status: ResourceStatus;
  phase: 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Unknown';
  restartCount: number;
  cpuUsage: number;
  memoryUsage: number;
  containers: Array<{
    name: string;
    image: string;
    status: ResourceStatus;
    restarts: number;
  }>;
  labels: Record<string, string>;
  createdAt: string;
}

// Namespace
export interface NamespaceSummary {
  id: string;
  name: string;
  clusterId: string;
  clusterName: string;
  status: 'Active' | 'Terminating';
  podCount: number;
  serviceCount: number;
  deploymentCount: number;
  cpuQuota?: number;
  memoryQuota?: number;
  cpuUsage: number;
  memoryUsage: number;
  labels: Record<string, string>;
  createdAt: string;
}

// Workload
export interface WorkloadSummary {
  id: string;
  name: string;
  namespace: string;
  clusterId: string;
  clusterName: string;
  type: 'Deployment' | 'StatefulSet' | 'DaemonSet' | 'Job' | 'CronJob';
  status: HealthStatus;
  replicas: {
    desired: number;
    current: number;
    ready: number;
    available: number;
  };
  image: string;
  labels: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Network
export interface ServiceSummary {
  id: string;
  name: string;
  namespace: string;
  clusterId: string;
  clusterName: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
  clusterIP: string;
  externalIP?: string;
  ports: Array<{ name?: string; port: number; targetPort: number; protocol: string }>;
  selector: Record<string, string>;
  createdAt: string;
}

export interface IngressSummary {
  id: string;
  name: string;
  namespace: string;
  clusterId: string;
  clusterName: string;
  className?: string;
  hosts: Array<{ host: string; paths: Array<{ path: string; backend: string }> }>;
  tls?: Array<{ hosts: string[]; secretName: string }>;
  createdAt: string;
}

// Storage
export interface PersistentVolumeSummary {
  id: string;
  name: string;
  clusterId: string;
  clusterName: string;
  status: 'Available' | 'Bound' | 'Released' | 'Failed';
  capacity: number; // GB
  storageClass: string;
  accessModes: string[];
  reclaimPolicy: string;
  claim?: string;
  createdAt: string;
}

export interface PersistentVolumeClaimSummary {
  id: string;
  name: string;
  namespace: string;
  clusterId: string;
  clusterName: string;
  status: 'Pending' | 'Bound' | 'Lost';
  volumeName?: string;
  storageClass: string;
  capacity: number; // GB
  accessModes: string[];
  createdAt: string;
}

// Events
export interface KubernetesEvent {
  id: string;
  clusterId: string;
  clusterName: string;
  namespace: string;
  type: 'Normal' | 'Warning' | 'Error';
  reason: string;
  message: string;
  involvedObject: {
    kind: string;
    name: string;
    namespace?: string;
  };
  source: string;
  count: number;
  firstTimestamp: string;
  lastTimestamp: string;
}

// Monitoring
export interface ResourceMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskIO: number;
  networkIO: number;
}

export interface TopResource {
  rank: number;
  name: string;
  value: number;
  unit?: string;
}

// Topology Flow Types
export interface TopologyNode {
  id: string;
  type: 'cluster' | 'node' | 'pod' | 'container';
  label: string;
  parentId?: string;
  status: ResourceStatus;
  metrics?: {
    cpu?: number;
    memory?: number;
  };
  metadata?: Record<string, string>;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  type?: 'hierarchy' | 'network';
}

export interface K8sTopologyData {
  clusters: ClusterSummary[];
  nodes: NodeSummary[];
  pods: PodSummary[];
}
