import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
    Monitor,
    Share2,
    Box,
    Server,
    Building2,
    Activity,
    Cpu,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
// We simulate OS/Tech icons with Lucide or available SVGs for the demo
// In a real app we'd use proper SVG assets for Windows/Linux/AWS/Java/Nginx
import { Command, Terminal, Cloud, Codepen, Smartphone, Globe } from 'lucide-react';
import { ExtendedNodeLabel } from './ExtendedNodeLabel';

interface SmartscapeNodeData {
    label: string;
    subLabel?: string;
    type: 'application' | 'service' | 'process' | 'host' | 'datacenter';
    status?: 'healthy' | 'warning' | 'critical';
    metrics?: { cpu?: number; memory?: number; };
    notificationCount?: number;
    // New props
    technology?: 'java' | 'nginx' | 'postgres' | 'windows' | 'linux' | 'aws' | 'azure' | 'apple' | 'confluence';
    vulnerability?: 'critical' | 'high' | 'medium' | 'low';
    showVulnerability?: boolean; // Control flag from parent
}

interface SmartscapeNodeProps {
    data: SmartscapeNodeData;
    selected: boolean;
}

const SmartscapeNode = ({ data, selected }: SmartscapeNodeProps) => {
    const { label, subLabel, type, status = 'healthy', notificationCount, technology, vulnerability, showVulnerability } = data;
    const [isHovered, setIsHovered] = React.useState(false);

    // Configuration for aesthetic
    const getConfig = (t: string) => {
        switch (t) {
            case 'application': return { icon: Monitor, color: '#00a6fb' };
            case 'service': return { icon: Share2, color: '#73be28' };
            case 'process': return { icon: Box, color: '#9355b7' };
            case 'host': return { icon: Server, color: '#ffa400' };
            case 'datacenter': return { icon: Building2, color: '#6d747e' };
            default: return { icon: Activity, color: '#888' };
        }
    };

    const { icon: BaseIcon, color } = getConfig(type);

    // Override Icon based on Technology (Simulating the Logos)
    const getTechIcon = () => {
        switch (technology) {
            case 'windows': return Command; // Proxy for Windows Logo
            case 'linux': return Terminal; // Proxy for Linux
            case 'aws': return Cloud;    // Proxy for AWS
            case 'java': return Codepen;  // Proxy for Java
            case 'nginx': return Activity;
            case 'apple': return Smartphone; // Mobile App
            case 'confluence': return Globe; // Web App
            default: return BaseIcon;
        }
    };

    const Icon = getTechIcon();

    // Vulnerability Styling (Overrides standard color if present and mode is active)
    let displayColor = status === 'critical' ? '#ef4444' : color;
    if (showVulnerability && vulnerability) {
        if (vulnerability === 'critical') displayColor = '#8B0000'; // Dark Red
        if (vulnerability === 'high') displayColor = '#ef4444'; // Red
        if (vulnerability === 'medium') displayColor = '#eab308'; // Yellow
        if (vulnerability === 'low') displayColor = '#3b82f6'; // Blue
    }

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Extended Label Box (Shows on Hover ONLY now, click opens Sidebar) */}
            {(isHovered) && (
                <ExtendedNodeLabel
                    label={label}
                    subLabel={subLabel}
                    type={technology ? technology : type}
                    icon={Icon}
                    styleColor={displayColor}
                    vulnerability={vulnerability}
                />
            )}

            {/* Floating Notification Badge */}
            {notificationCount && notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 z-20 animate-bounce-slow">
                    <div className="bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-[#1a1a1a] shadow-lg">
                        {notificationCount}
                    </div>
                </div>
            )}

            {/* Main Hexagon Container */}
            <div
                className={cn(
                    "w-[140px] h-[160px] flex flex-col items-center justify-center relative transition-transform duration-300",
                    selected ? "scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "hover:scale-105"
                )}
            >
                {/* Hexagon Background SVG */}
                <svg
                    viewBox="0 0 100 115"
                    className="absolute inset-0 w-full h-full drop-shadow-xl"
                    style={{ filter: `drop-shadow(0 0 8px ${displayColor}40)` }}
                >
                    <path
                        d="M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z"
                        fill="#1e1e24"
                        stroke={selected ? '#fff' : displayColor}
                        strokeWidth={status === 'critical' || vulnerability ? 3 : 2}
                        className="transition-colors duration-300"
                    />
                    {/* Inner decorative ring */}
                    <path
                        d="M50 10 L85 30 V70 L50 90 L15 70 V30 Z"
                        fill="none"
                        stroke={displayColor}
                        strokeWidth="1"
                        strokeOpacity="0.3"
                        strokeDasharray="4 2"
                    />
                </svg>

                {/* Content Container (Centered) */}
                <div className="z-10 flex flex-col items-center gap-2 text-center px-4 w-full">
                    {/* Icon with Glow */}
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1 text-white shadow-inner bg-black/20"
                        style={{
                            boxShadow: `0 0 15px ${displayColor}60`,
                            color: displayColor
                        }}
                    >
                        <Icon size={20} />
                    </div>

                    {/* Labels */}
                    <div className="flex flex-col items-center max-w-full">
                        <span className="text-white font-bold text-xs truncate w-full px-2 leading-tight">
                            {label}
                        </span>
                        {subLabel && (
                            <span className="text-gray-400 text-[9px] mt-1 truncate w-full opacity-80">
                                {subLabel}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Top} className="opacity-0 w-8 h-8 -top-2 left-1/2" />
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-8 h-8 -bottom-2 left-1/2" />
        </div>
    );
};

export default memo(SmartscapeNode);
