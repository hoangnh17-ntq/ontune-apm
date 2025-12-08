import React from 'react';
import { X, ExternalLink, Activity, FileText, GitBranch, ArrowRightLeft, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigation } from '@/contexts/NavigationContext';
import { Button } from '@/components/ui/button';
import { mockWASNames } from '@/lib/mockData';

interface NodeDetailSidebarProps {
    nodeData: any;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export const NodeDetailSidebar = ({ nodeData, isOpen, onClose, className }: NodeDetailSidebarProps) => {
    if (!nodeData) return null;

    const { label, subLabel, type, status, technology } = nodeData;
    // Mock Data
    const inboundRPS = Math.floor(Math.random() * 1500) + 500;
    const outboundRPS = Math.floor(Math.random() * 800) + 200;
    const errorRate = (Math.random() * 2).toFixed(2);
    const p95 = Math.floor(Math.random() * 200) + 50;

    return (
        <div
            className={cn(
                "fixed top-0 right-0 h-full w-[450px] bg-[#1a1a20] border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[100] flex flex-col font-sans",
                isOpen ? "translate-x-0" : "translate-x-full",
                className
            )}
        >
            {/* Header */}
            <div className="p-5 border-b border-gray-800 bg-[#111115]">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-gray-700",
                            status === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500')}>
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">{label}</h2>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">{type}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* K8s Labels (Slide 3.6) */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] bg-[#2a2a35] text-blue-300 px-2 py-1 rounded border border-blue-900/30 font-mono">app={label.toLowerCase().split(' ')[0]}</span>
                    <span className="text-[10px] bg-[#2a2a35] text-gray-300 px-2 py-1 rounded border border-gray-700 font-mono">env=production</span>
                    <span className="text-[10px] bg-[#2a2a35] text-gray-300 px-2 py-1 rounded border border-gray-700 font-mono">tier=backend</span>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-y-auto bg-[#1a1a20]">
                <Tabs defaultValue="overview" className="w-full">
                    <div className="px-5 pt-4 border-b border-gray-800 sticky top-0 bg-[#1a1a20] z-10">
                        <TabsList className="bg-transparent h-auto p-0 w-full justify-start space-x-6">
                            <TabsTrigger
                                value="overview"
                                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 data-[state=active]:shadow-none text-gray-400 hover:text-gray-200 transition-all"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="apm"
                                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 data-[state=active]:shadow-none text-gray-400 hover:text-gray-200 transition-all"
                            >
                                APM
                            </TabsTrigger>
                            <TabsTrigger
                                value="traces"
                                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 data-[state=active]:shadow-none text-gray-400 hover:text-gray-200 transition-all"
                            >
                                Traces
                            </TabsTrigger>
                            <TabsTrigger
                                value="metrics"
                                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 data-[state=active]:shadow-none text-gray-400 hover:text-gray-200 transition-all"
                            >
                                Metrics
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="p-5 space-y-6 mt-0">
                        {/* Service Map Summary */}
                        <div className="bg-[#1e1e24] rounded-lg border border-gray-800 p-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <GitBranch size={12} /> Dependency Map
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-white">5</span>
                                    <span className="text-xs text-gray-400">Upstream Dependencies</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-2xl font-bold text-white">12</span>
                                    <span className="text-xs text-gray-400">Downstream Dependents</span>
                                </div>
                            </div>
                        </div>

                        {/* Flow Map Metrics (Slide 5.1) */}
                        <div className="bg-[#1e1e24] rounded-lg border border-gray-800 p-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <ArrowRightLeft size={12} /> Flow Metrics
                            </h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                    <span className="text-xs text-gray-400">Inbound RPS</span>
                                    <span className="text-sm font-mono text-white font-medium">{inboundRPS}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                    <span className="text-xs text-gray-400">Outbound RPS</span>
                                    <span className="text-sm font-mono text-white font-medium">{outboundRPS}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Error Rate</span>
                                    <span className={cn("text-sm font-mono font-medium", parseFloat(errorRate) > 1 ? "text-red-400" : "text-green-400")}>{errorRate}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">P95 Latency</span>
                                    <span className="text-sm font-mono text-yellow-400 font-medium">{p95}ms</span>
                                </div>
                            </div>
                        </div>

                        {/* Drill Down (Slide 4) */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Deep Links</h3>
                            <button className="w-full flex justify-between items-center bg-[#2a2a35] hover:bg-[#32323f] p-3 rounded text-left transition-colors group">
                                <div className="flex items-center gap-3">
                                    <FileText size={16} className="text-blue-400" />
                                    <div>
                                        <div className="text-sm text-gray-200 font-medium">View Logs</div>
                                        <div className="text-[10px] text-gray-500">Live stream via Loki</div>
                                    </div>
                                </div>
                                <ExternalLink size={14} className="text-gray-500 group-hover:text-white" />
                            </button>
                            <button className="w-full flex justify-between items-center bg-[#2a2a35] hover:bg-[#32323f] p-3 rounded text-left transition-colors group">
                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-purple-400" />
                                    <div>
                                        <div className="text-sm text-gray-200 font-medium">Distributed Traces</div>
                                        <div className="text-[10px] text-gray-500">Search by TraceID</div>
                                    </div>
                                </div>
                                <ExternalLink size={14} className="text-gray-500 group-hover:text-white" />
                            </button>
                        </div>
                    </TabsContent>

                    <TabsContent value="apm" className="p-5 space-y-6 mt-0">
                        <APMTabContent nodeLabel={label} />
                    </TabsContent>

                    <TabsContent value="traces" className="p-5 space-y-6 mt-0">
                        <div className="text-center text-gray-500 text-sm py-10">Trace List Placeholder</div>
                    </TabsContent>
                    <TabsContent value="metrics" className="p-5">
                        <div className="text-center text-gray-500 text-sm py-10">Metric Charts Placeholder</div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Footer Status */}
            <div className="p-3 border-t border-gray-800 bg-[#111115] text-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    eBPF Agent Active
                </span>
            </div>
        </div>
    );
};

function APMTabContent({ nodeLabel }: { nodeLabel: string }) {
    const { navigateToApmWas } = useNavigation();

    // Find WAS ID based on label
    // Mock logic matching mockData.ts generation: id = `was-${index + 1}`
    // Use findIndex with includes to handle cases like 'order-service-deploy'
    const wasIndex = mockWASNames.findIndex(name => nodeLabel.includes(name));
    const targetWasId = wasIndex !== -1 ? `was-${wasIndex + 1}` : 'was-1'; // Fallback to was-1

    return (
        <div className="space-y-6">
            <div className="bg-[#111115] border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-200">APM Integration</h3>
                    <div className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-medium">Connected</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Response Time</div>
                        <div className="text-xl font-mono text-white">124<span className="text-xs text-gray-500 ml-1">ms</span></div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Throughput</div>
                        <div className="text-xl font-mono text-white">840<span className="text-xs text-gray-500 ml-1">tps</span></div>
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
        </div>
    );
}
