import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Monitor, Layers, Box, Server, Database } from 'lucide-react';

interface SmartscapeLayerProps {
    label: string;
    type: 'application' | 'service' | 'process' | 'host' | 'datacenter';
    width: number;
    height: number;
}

const SmartscapeLayer = ({ label, type, width, height }: SmartscapeLayerProps) => {
    // Config for icon and subtle color tint
    const getConfig = (t: string) => {
        switch (t) {
            case 'application': return { icon: Monitor, color: 'border-l-blue-500/50 bg-blue-500/5' };
            case 'service': return { icon: Layers, color: 'border-l-green-500/50 bg-green-500/5' };
            case 'process': return { icon: Box, color: 'border-l-purple-500/50 bg-purple-500/5' };
            case 'host': return { icon: Server, color: 'border-l-orange-500/50 bg-orange-500/5' };
            case 'datacenter': return { icon: Database, color: 'border-l-gray-500/50 bg-gray-500/5' };
            default: return { icon: Layers, color: 'bg-gray-500/5' };
        }
    };

    const { icon: Icon, color } = getConfig(type);

    return (
        <div
            className={cn(
                "absolute top-0 left-0 w-full h-full border-l-4 border-t border-b border-t-white/10 border-b-white/10 transition-colors pointer-events-none flex items-start",
                color
            )}
            style={{ width, height }}
        >
            {/* Label Area */}
            <div className="absolute left-4 top-4 flex items-center gap-3 opacity-60">
                <div className="p-2 bg-background/50 rounded-lg backdrop-blur-sm border border-white/10">
                    <Icon size={24} className="text-foreground" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold uppercase tracking-widest text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Layer</span>
                </div>
            </div>

            {/* Perspective grid lines to fake depth */}
            <div className="absolute right-0 top-0 bottom-0 w-full opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
    );
};

export default memo(SmartscapeLayer);
