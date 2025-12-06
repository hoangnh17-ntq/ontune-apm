import React from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, ShieldAlert } from 'lucide-react';

interface ExtendedNodeLabelProps {
    label: string;
    subLabel?: string;
    type: string;
    icon: React.ElementType;
    styleColor: string;
    vulnerability?: 'critical' | 'high' | 'medium' | 'low';
}

export const ExtendedNodeLabel = ({ label, subLabel, type, icon: Icon, styleColor, vulnerability }: ExtendedNodeLabelProps) => {
    return (
        <div className="absolute left-[70%] top-1/2 -translate-y-1/2 z-50 flex items-center animate-in fade-in slide-in-from-left-4 duration-200">
            {/* Connector Line */}
            <div className="w-8 h-[2px]" style={{ backgroundColor: styleColor }} />

            {/* The Box */}
            <div
                className="flex items-center bg-[#1e1e24] border-l-4 pr-3 pl-2 py-2 shadow-2xl min-w-[180px] max-w-[250px]"
                style={{ borderLeftColor: styleColor }}
            >
                {/* Icon Circle */}
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0"
                    style={{ backgroundColor: `${styleColor}20` }}
                >
                    <Icon size={16} style={{ color: styleColor }} />
                </div>

                {/* Text Content */}
                <div className="flex flex-col flex-1 mr-2 overflow-hidden">
                    <span className="text-white text-xs font-bold truncate leading-tight">{label}</span>
                    <span className="text-gray-400 text-[9px] uppercase tracking-wider truncate">{type}</span>
                    {subLabel && <span className="text-gray-500 text-[9px] truncate">{subLabel}</span>}
                </div>

                {/* Action Icon */}
                <ExternalLink size={12} className="text-gray-500 hover:text-white cursor-pointer ml-auto" />
            </div>

            {/* Vulnerability Tag (if present) */}
            {vulnerability && (
                <div className={cn(
                    "absolute -top-3 right-0 bg-red-900 border border-red-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1",
                    vulnerability === 'critical' ? "bg-red-950 border-red-500 animate-pulse" : "bg-red-900/80 border-red-500/50"
                )}>
                    <ShieldAlert size={8} />
                    {vulnerability.toUpperCase()}
                </div>
            )}
        </div>
    );
};
