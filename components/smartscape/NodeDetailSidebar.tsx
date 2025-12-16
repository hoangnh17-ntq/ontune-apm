import React, { useMemo } from 'react';
import {
    X, ExternalLink, Activity, FileText, GitBranch, ArrowRightLeft, Clock,
    Cpu, HardDrive, Server, Layers, Box, AlertCircle, CheckCircle2, Cloud, Network, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigation } from '@/contexts/NavigationContext';
import { Button } from '@/components/ui/button';
import { mockWASNames, generateTransactionHistory } from '@/lib/mockData';
import { formatTime, formatDuration } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface NodeDetailSidebarProps {
    nodeData: any;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

const generateMockDependencies = (direction: 'upstream' | 'downstream', count: number) => {
    const services = [];
    const serviceTypes = ['redis', 'postgres', 'kafka', 'payment-service', 'auth-service', 'user-service', 'inventory-service'];

    for (let i = 0; i < count; i++) {
        const name = serviceTypes[Math.floor(Math.random() * serviceTypes.length)] + '-' + (Math.floor(Math.random() * 10) + 1);
        services.push({
            id: `dep-${direction}-${i}`,
            name,
            rps: Math.floor(Math.random() * 1000) + 100,
            errorRate: (Math.random() * 5).toFixed(2),
            p95: Math.floor(Math.random() * 500) + 20,
            throughput: Math.floor(Math.random() * 2000) + 500
        });
    }
    return services;
};

// Generate Mock K8s Events
const generateMockEvents = (count: number) => {
    const reasons = ['Scheduled', 'Pulling', 'Pulled', 'Created', 'Started', 'Failed', 'BackOff', 'Unhealthy'];
    const types = ['Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Warning', 'Warning', 'Warning'];

    return Array.from({ length: count }, (_, i) => {
        const index = Math.floor(Math.random() * reasons.length);
        return {
            id: `evt-${i}`,
            reason: reasons[index],
            type: types[index],
            message: index > 4 ? `Container failed with exit code 1. Back-off restarting failed container.` : `Successfully ${reasons[index].toLowerCase()} container image "nginx:1.25".`,
            count: Math.floor(Math.random() * 10) + 1,
            lastSeen: new Date(Date.now() - Math.random() * 1000 * 60 * 60).toLocaleTimeString()
        };
    }).sort((a, b) => a.lastSeen > b.lastSeen ? -1 : 1);
}

export const NodeDetailSidebar = ({ nodeData, isOpen, onClose, className }: NodeDetailSidebarProps) => {
    if (!nodeData) return null;

    const { label, subLabel, type, status, technology, labels } = nodeData;
    const isPod = type === 'Pod' || type === 'pod';

    // Check if the node is a Pod and has an APM ID
    const apmId = labels?.['apm-id'];
    const apmIdFromTags = labels && Array.isArray(labels)
        ? labels.find((l: string) => l.startsWith('apm-id='))?.split('=')[1]
        : undefined;

    const showApmTab = isPod && (apmId || apmIdFromTags || label.includes('apm'));

    const normalizedType = type?.toLowerCase();

    // Determine view type
    let ViewComponent = DefaultDetailView;
    if (normalizedType === 'node') ViewComponent = NodeDetailView;
    else if (normalizedType === 'workload' || normalizedType === 'deployment' || normalizedType === 'replicaset' || normalizedType === 'statefulset' || normalizedType === 'daemonset') ViewComponent = WorkloadDetailView;
    else if (normalizedType === 'pod') ViewComponent = PodDetailView;
    else if (normalizedType === 'namespace') ViewComponent = NamespaceDetailView;
    else if (normalizedType === 'service') ViewComponent = ServiceDetailView;
    else if (normalizedType === 'external' || normalizedType === 'cloud') ViewComponent = ExternalDetailView;

    // Mock Data for Loops
    const upstreamServices = useMemo(() => generateMockDependencies('upstream', 3), [nodeData.id]);
    const downstreamServices = useMemo(() => generateMockDependencies('downstream', 4), [nodeData.id]);
    const mockEvents = useMemo(() => generateMockEvents(5), [nodeData.id]);

    return (

        <div
            className={cn(
                "fixed top-0 right-0 h-full w-[450px] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-[100] flex flex-col font-sans",
                isOpen ? "translate-x-0" : "translate-x-full",
                className
            )}
        >
            {/* Header */}
            <div className="p-5 border-b border-border bg-card">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border",
                            status === 'critical' ? 'bg-red-500/10 text-red-500' :
                                status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-blue-500/10 text-blue-500')}>
                            {normalizedType === 'external' ? <Globe size={20} /> : <Activity size={20} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground leading-tight">{label}</h2>
                            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{type}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* K8s Labels */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] bg-muted/50 text-blue-500 px-2 py-1 rounded border border-blue-500/20 font-mono">app={label.toLowerCase().split(' ')[0]}</span>
                    <span className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-1 rounded border border-border font-mono">env=production</span>
                    {showApmTab && !apmId && !apmIdFromTags && (
                        <span className="text-[10px] bg-muted/50 text-purple-500 px-2 py-1 rounded border border-purple-500/20 font-mono">apm-id=8104</span>
                    )}
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-y-auto bg-background">
                <Tabs defaultValue="overview" className="w-full">
                    <div className="px-5 pt-4 border-b border-border sticky top-0 bg-background z-10 w-full overflow-x-auto no-scrollbar">
                        <TabsList className="bg-transparent h-auto p-0 w-full justify-start space-x-6">
                            <TabsTrigger
                                value="overview"
                                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all font-medium"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="network"
                                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all font-medium"
                            >
                                Network
                            </TabsTrigger>
                            {showApmTab && (
                                <TabsTrigger
                                    value="apm"
                                    className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all font-medium"
                                >
                                    APM
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="events"
                                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all font-medium"
                            >
                                Events
                            </TabsTrigger>
                            <TabsTrigger
                                value="yaml"
                                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all font-medium"
                            >
                                YAML
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="p-5 space-y-6 mt-0">
                        <ViewComponent nodeData={nodeData} />
                    </TabsContent>

                    {/* Network Tab - Reintroduced */}
                    <TabsContent value="network" className="p-5 space-y-6 mt-0">
                        {/* Service Map Summary */}
                        <div className="bg-card rounded-lg border border-border p-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                                <GitBranch size={12} /> Dependency Summary
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-foreground">3</span>
                                    <span className="text-xs text-muted-foreground">Upstream (Inbound)</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-2xl font-bold text-foreground">4</span>
                                    <span className="text-xs text-muted-foreground">Downstream (Outbound)</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Upstream */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                    <ArrowRightLeft size={12} className="rotate-90" /> Upstream (Inbound)
                                </h3>
                                <div className="space-y-2">
                                    {upstreamServices.map(service => (
                                        <div key={service.id} className="bg-card border border-border rounded p-3 flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-foreground">{service.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-xs font-mono", parseFloat(service.errorRate) > 1 ? "text-red-400" : "text-green-400")}>
                                                        Err: {service.errorRate}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                                                <div>
                                                    <span className="block text-[10px] uppercase">RPS</span>
                                                    <span className="text-white font-mono">{service.rps}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase">P95</span>
                                                    <span className="text-yellow-400 font-mono">{service.p95}ms</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase">Throughput</span>
                                                    <span className="text-blue-400 font-mono">{service.throughput}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Downstream */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                    <ArrowRightLeft size={12} className="rotate-90" /> Downstream (Outbound)
                                </h3>
                                <div className="space-y-2">
                                    {downstreamServices.map(service => (
                                        <div key={service.id} className="bg-card border border-border rounded p-3 flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-foreground">{service.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-xs font-mono", parseFloat(service.errorRate) > 1 ? "text-red-400" : "text-green-400")}>
                                                        Err: {service.errorRate}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                                                <div>
                                                    <span className="block text-[10px] uppercase">RPS</span>
                                                    <span className="text-white font-mono">{service.rps}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase">P95</span>
                                                    <span className="text-yellow-400 font-mono">{service.p95} ms</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase">Throughput</span>
                                                    <span className="text-blue-400 font-mono">{service.throughput} kbps</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="apm" className="p-5 space-y-6 mt-0">
                        <APMTabContent nodeLabel={label} apmId={apmId || apmIdFromTags} />
                    </TabsContent>

                    <TabsContent value="events" className="p-5 space-y-4 mt-0">
                        {mockEvents.map(evt => (
                            <div key={evt.id} className="bg-card border border-border rounded p-3 flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                            evt.type === 'Warning' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400")}>
                                            {evt.type}
                                        </span>
                                        <span className="text-xs font-bold text-foreground">{evt.reason}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Clock size={10} /> {evt.lastSeen}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{evt.message}</p>
                                <div className="text-[10px] text-muted-foreground mt-1">Count: {evt.count}</div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="yaml" className="p-5 space-y-6 mt-0">
                        <div className="bg-muted p-3 rounded border border-border font-mono text-xs text-muted-foreground overflow-auto max-h-[400px]">
                            <pre>{`apiVersion: v1
kind: ${type}
metadata:
  name: ${label}
  namespace: default
  labels:
    app: ${label}
spec:
  # Mock YAML content
  containers:
  - name: ${label}
    image: nginx:latest
    ports:
    - containerPort: 80`}</pre>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Footer Status */}
            <div className="p-3 border-t border-border bg-card text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Updated: {new Date().toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
};

// --- Specific Views ---

const SectionHeader = ({ title, icon: Icon }: { title: string, icon?: any }) => (
    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
        {Icon && <Icon size={12} />} {title}
    </h3>
);

const InfoRow = ({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) => (
    <div className="flex justify-between items-center py-1 border-b border-border/50 last:border-0 hover:bg-muted/30 px-1 rounded transition-colors">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className={cn("text-foreground text-sm font-medium font-mono", className)}>{value}</span>
    </div>
);

// 1. Node View
const NodeDetailView = ({ nodeData }: { nodeData: any }) => {
    const cpuUsage = Math.floor(Math.random() * 60) + 10;
    const memUsage = Math.floor(Math.random() * 70) + 20;

    return (
        <div className="space-y-6">
            <div>
                <SectionHeader title="Resource Usage" icon={Activity} />
                <div className="bg-card rounded-lg border border-border p-4 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">CPU Usage</span>
                            <span className="text-foreground font-mono">{cpuUsage}%</span>
                        </div>
                        <Progress value={cpuUsage} className="h-1.5 bg-gray-700" indicatorClassName="bg-blue-500" />
                        <div className="text-[10px] text-gray-500">4 / 16 Cores used</div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Memory Usage</span>
                            <span className="text-foreground font-mono">{memUsage}%</span>
                        </div>
                        <Progress value={memUsage} className="h-1.5 bg-secondary" indicatorClassName="bg-purple-500" />
                        <div className="text-[10px] text-muted-foreground">12.4 / 32 GB used</div>
                    </div>
                </div>
            </div>

            <div>
                <SectionHeader title="System Info" icon={Server} />
                <div className="bg-card rounded-lg border border-border p-4">
                    <InfoRow label="Kernel" value="5.15.0-89-generic" />
                    <InfoRow label="OS Image" value="Ubuntu 22.04.3 LTS" />
                    <InfoRow label="Container Runtime" value="containerd://1.6.26" />
                    <InfoRow label="Kubelet Version" value="v1.28.1" />
                    <InfoRow label="Architecture" value="amd64" />
                </div>
            </div>

            <div>
                <SectionHeader title="Conditions" icon={CheckCircle2} />
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card border border-border rounded p-2 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-sm text-foreground">Ready</span>
                    </div>
                    <div className="bg-card border border-border rounded p-2 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-sm text-foreground">DiskPressure</span>
                    </div>
                    <div className="bg-card border border-border rounded p-2 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-sm text-foreground">PIDPressure</span>
                    </div>
                    <div className="bg-card border border-border rounded p-2 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-sm text-foreground">MemoryPressure</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Workload View
const WorkloadDetailView = ({ nodeData }: { nodeData: any }) => {
    // Mocking replica counts
    const desired = 3;
    const ready = Math.random() > 0.8 ? 2 : 3;
    const available = ready;

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Desired</div>
                    <div className="text-xl font-bold text-foreground font-mono">{desired}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Ready</div>
                    <div className={cn("text-xl font-bold font-mono", ready < desired ? "text-yellow-500" : "text-green-500")}>{ready}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Available</div>
                    <div className={cn("text-xl font-bold font-mono", available < desired ? "text-yellow-500" : "text-green-500")}>{available}</div>
                </div>
            </div>

            {/* Pod Status Chart */}
            <div>
                <SectionHeader title="Pod Status Breakdown" icon={Box} />
                <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden flex">
                            <div style={{ width: `${(ready / desired) * 100}%` }} className="bg-green-500 h-full"></div>
                            {desired - ready > 0 && <div style={{ width: `${((desired - ready) / desired) * 100}%` }} className="bg-yellow-500 h-full"></div>}
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Running ({ready})</span>
                        </div>
                        {desired - ready > 0 && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span>Pending ({desired - ready})</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span>Failed (0)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controller Info */}
            <div>
                <SectionHeader title="Controller" icon={Layers} />
                <div className="bg-card rounded-lg border border-border p-4">
                    <InfoRow label="Strategy" value="RollingUpdate" />
                    <InfoRow label="Max Unavailable" value="25%" />
                    <InfoRow label="Max Surge" value="25%" />
                    <InfoRow label="Selector" value={<span className="text-[10px] px-1 bg-muted rounded border border-border">app={nodeData.label}</span>} />
                </div>
            </div>
        </div>
    );
};

// 3. Pod View
const PodDetailView = ({ nodeData }: { nodeData: any }) => {
    const restartCount = Math.floor(Math.random() * 5);
    const uptime = "2d 4h 12m";
    const nodeName = "worker-node-01";

    return (
        <div className="space-y-6">
            {/* Health & Status */}
            <div>
                <SectionHeader title="Health & Status" icon={Activity} />
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-card rounded-lg border border-border p-3">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Phase</div>
                        <div className="text-green-400 font-bold">Running</div>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-3">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Restarts</div>
                        <div className={cn("font-bold font-mono", restartCount > 2 ? "text-yellow-500" : "text-foreground")}>{restartCount}</div>
                    </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                    <InfoRow label="Node" value={nodeName} className="text-blue-400" />
                    <InfoRow label="Pod IP" value="10.244.1.45" />
                    <InfoRow label="QoS Class" value="Burstable" />
                    <InfoRow label="Service Account" value="default" />
                    <InfoRow label="Uptime" value={uptime} />
                </div>
            </div>

            {/* Containers */}
            <div>
                <SectionHeader title="Containers" icon={Box} />
                <div className="space-y-2">
                    {[1].map((_, i) => (
                        <div key={i} className="bg-card rounded-lg border border-border p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-foreground">{nodeData.label}</span>
                                <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">Running</span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                                <span>Image:</span>
                                <span className="text-right text-foreground truncate">nginx:1.25.3-alpine</span>
                                <span>Ready:</span>
                                <span className="text-right text-green-400">True</span>
                                <span>Restarts:</span>
                                <span className="text-right text-foreground font-mono">{restartCount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 4. Namespace View
const NamespaceDetailView = ({ nodeData }: { nodeData: any }) => {
    return (
        <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
                <div>
                    <div className="text-xs text-muted-foreground uppercase">Status</div>
                    <div className="text-lg font-bold text-green-400">Active</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground uppercase text-right">Age</div>
                    <div className="text-lg font-bold text-foreground font-mono text-right">14d</div>
                </div>
            </div>

            <div>
                <SectionHeader title="Resource Quotas" icon={HardDrive} />
                <div className="bg-card rounded-lg border border-border p-4 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">CPU Requests</span>
                            <span className="text-foreground font-mono">2.5 / 10 Cores</span>
                        </div>
                        <Progress value={25} className="h-1.5 bg-secondary" indicatorClassName="bg-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Memory Requests</span>
                            <span className="text-foreground font-mono">{12} / {64} GB</span>
                        </div>
                        <Progress value={18} className="h-1.5 bg-secondary" indicatorClassName="bg-purple-500" />
                    </div>
                </div>
            </div>

            <div>
                <SectionHeader title="Summary" icon={Layers} />
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card border border-border rounded p-3 text-center">
                        <div className="text-xl font-bold text-foreground font-mono">24</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Pods</div>
                    </div>
                    <div className="bg-card border border-border rounded p-3 text-center">
                        <div className="text-xl font-bold text-foreground font-mono">8</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Services</div>
                    </div>
                    <div className="bg-card border border-border rounded p-3 text-center">
                        <div className="text-xl font-bold text-foreground font-mono">5</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Deployments</div>
                    </div>
                    <div className="bg-card border border-border rounded p-3 text-center">
                        <div className="text-xl font-bold text-foreground font-mono">0</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Errors</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 5. Service View (New)
const ServiceDetailView = ({ nodeData }: { nodeData: any }) => {
    return (
        <div className="space-y-6">
            <div>
                <SectionHeader title="Service Details" icon={Network} />
                <div className="bg-card rounded-lg border border-border p-4">
                    <InfoRow label="Type" value="ClusterIP" />
                    <InfoRow label="Cluster IP" value="10.96.0.1" />
                    <InfoRow label="Session Affinity" value="None" />
                    <InfoRow label="Selector" value={<span className="text-[10px] px-1 bg-muted rounded border border-border font-mono">app={nodeData.label}</span>} />
                </div>
            </div>

            <div>
                <SectionHeader title="Ports" icon={Layers} />
                <div className="space-y-2">
                    {[
                        { port: 80, targetPort: 8080, protocol: 'TCP', name: 'http' },
                        { port: 443, targetPort: 8443, protocol: 'TCP', name: 'https' }
                    ].map((p, i) => (
                        <div key={i} className="bg-card rounded-lg border border-border p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">{p.protocol}</span>
                                <span className="text-sm text-foreground font-mono">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                <span className="text-foreground">{p.port}</span>
                                <ArrowRightLeft size={10} />
                                <span className="text-foreground">{p.targetPort}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 6. External View (New)
const ExternalDetailView = ({ nodeData }: { nodeData: any }) => {
    return (
        <div className="space-y-6">
            <div>
                <SectionHeader title="External Entity" icon={Globe} />
                <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                            <Cloud size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-foreground">{nodeData.label}</div>
                            <div className="text-xs text-muted-foreground">External Service</div>
                        </div>
                    </div>
                    <InfoRow label="Endpoint" value="api.stripe.com" />
                    <InfoRow label="Protocol" value="HTTPS" />
                    <InfoRow label="Port" value="443" />
                </div>
            </div>

            <div>
                <SectionHeader title="Traffic Metrics" icon={Activity} />
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card border border-border rounded p-3">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Latency (Avg)</div>
                        <div className="text-lg font-bold text-foreground font-mono">145ms</div>
                    </div>
                    <div className="bg-card border border-border rounded p-3">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Success Rate</div>
                        <div className="text-lg font-bold text-green-400 font-mono">99.9%</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Default (Fallback) View
const DefaultDetailView = ({ nodeData }: { nodeData: any }) => {
    return (
        <div className="text-center text-muted-foreground py-10 space-y-2">
            <Cloud size={48} className="mx-auto opacity-20" />
            <p>No specific detail view for type: <span className="text-foreground font-mono">{nodeData.type}</span></p>
        </div>
    )
};


function APMTabContent({ nodeLabel, apmId }: { nodeLabel: string; apmId?: string }) {
    const { navigateToApmWas, navigateToTransaction } = useNavigation();

    // Find WAS ID based on label
    // Mock logic matching mockData.ts generation: id = `was - ${ index + 1} `
    // Use findIndex with includes to handle cases like 'order-service-deploy'
    const wasIndex = mockWASNames.findIndex(name => nodeLabel.includes(name));
    const targetWasId = wasIndex !== -1 ? `was-${wasIndex + 1}` : 'was-1'; // Fallback to was-1

    // Generate mock transactions
    const transactions = React.useMemo(() => generateTransactionHistory(20, 15), []);

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">APM Integration</h3>
                        {apmId && <span className="text-[10px] text-muted-foreground font-mono">ID: {apmId}</span>}
                    </div>
                    <div className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-medium">Connected</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <div className="text-xs text-muted-foreground mb-1">Response Time</div>
                        <div className="text-xl font-mono text-foreground">124<span className="text-xs text-muted-foreground ml-1">ms</span></div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground mb-1">Throughput</div>
                        <div className="text-xl font-mono text-foreground">840<span className="text-xs text-muted-foreground ml-1">tps</span></div>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full border-blue-500/30 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 transition-colors gap-2"
                    onClick={() => navigateToApmWas(targetWasId)}
                >
                    <Activity size={16} />
                    View Detail
                </Button>
            </div>

            {/* Recent Transactions List */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 px-1">Recent Transactions</h3>
                <div className="space-y-2">
                    {transactions.slice(0, 5).map(tx => (
                        <div
                            key={tx.id}
                            onClick={() => navigateToTransaction(tx.id)}
                            className="bg-card border border-border rounded p-3 text-sm cursor-pointer hover:bg-muted hover:border-border transition-all select-none"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-foreground truncate pr-2 max-w-[200px]" title={tx.endpoint}>
                                    {tx.endpoint}
                                </span>
                                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                                    {formatTime(tx.timestamp)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                        tx.method === 'HTTPC' && tx.httpMethod === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                            tx.method === 'HTTPC' && tx.httpMethod === 'POST' ? 'bg-green-500/20 text-green-400' :
                                                tx.method === 'SQL' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                    )}>
                                        {tx.method === 'HTTPC' && tx.httpMethod ? tx.httpMethod : tx.method}
                                    </span>
                                    <span className="text-gray-500">{tx.status}</span>
                                </div>
                                <span className={cn(
                                    "font-mono font-medium",
                                    tx.responseTime < 500 ? 'text-blue-400' :
                                        tx.responseTime < 2000 ? 'text-yellow-400' :
                                            'text-red-400'
                                )}>
                                    {formatDuration(tx.responseTime)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
