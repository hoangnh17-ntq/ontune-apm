'use client';

import React, { useEffect, useRef } from 'react';
import {
  Search,
  LineChart,
  Database,
  Server,
  Users,
  AlertCircle,
  FileText,
  TrendingUp,
  GitBranch,
  Network
} from 'lucide-react';
import { Transaction } from '@/types/apm';

interface ContextMenuProps {
  x: number;
  y: number;
  transaction: Transaction;
  onClose: () => void;
  onNavigate?: (tab: string, action: string) => void;
  onViewTrace?: (transaction: Transaction) => void;
  onSelectTransaction?: (transaction: Transaction) => void;
}

export default function ContextMenu({ x, y, transaction, onClose, onNavigate, onViewTrace, onSelectTransaction }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x, y, maxHeight: '80vh' });

  useEffect(() => {
    if (!menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;
    let maxHeight = viewportHeight - y - 20; // 20px padding from bottom

    // Adjust horizontal position if menu overflows right
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10; // 10px padding from right
    }

    // Adjust vertical position if menu overflows bottom
    if (y + menuRect.height > viewportHeight) {
      // Check if there's more space above
      const spaceAbove = y;
      const spaceBelow = viewportHeight - y;

      if (spaceAbove > spaceBelow) {
        // Flip to above cursor
        adjustedY = Math.max(10, y - menuRect.height);
        maxHeight = y - 20; // 20px padding from top
      } else {
        // Keep below but adjust max height
        adjustedY = y;
        maxHeight = viewportHeight - y - 20;
      }
    }

    // Ensure minimum height
    maxHeight = Math.max(200, Math.min(maxHeight, viewportHeight - 40));

    setPosition({
      x: Math.max(10, adjustedX),
      y: Math.max(10, adjustedY),
      maxHeight: `${maxHeight}px`
    });
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleViewJavaSource = () => {
    sessionStorage.setItem('selectedTransaction', JSON.stringify(transaction));
    onNavigate?.('analysis', 'java-source');
    onClose();
  };

  const handleViewTopology = () => {
    sessionStorage.setItem('selectedTransaction', JSON.stringify(transaction));
    onNavigate?.('analysis', 'view-topology');
    onClose();
  };

  const menuItems = [
    {
      icon: Search,
      label: 'View Transaction Details',
      description: 'Open detailed analysis for this transaction',
      action: () => {
        sessionStorage.setItem('selectedTransaction', JSON.stringify(transaction));
        if (onSelectTransaction) {
          onSelectTransaction(transaction);
        } else {
          onNavigate?.('analysis', 'transaction-details');
        }
        onClose();
      }
    },
    {
      icon: GitBranch,
      label: 'View Call Stack (Bullet View)',
      description: 'Visualize transaction call hierarchy',
      action: () => {
        sessionStorage.setItem('selectedTransaction', JSON.stringify(transaction));
        if (onViewTrace) {
          onViewTrace(transaction);
        } else {
          onNavigate?.('analysis', 'bullet-view');
        }
        onClose();
      }
    },
    {
      icon: LineChart,
      label: 'View in Timeline',
      description: 'Show transaction in timeline view',
      action: () => {
        sessionStorage.setItem('selectedTransaction', JSON.stringify(transaction));
        onNavigate?.('analysis', 'timeline');
        onClose();
      }
    },
    {
      icon: Database,
      label: 'Related SQL Queries',
      description: 'Filter SQL queries for this transaction',
      action: () => {
        sessionStorage.setItem('sqlFilter', 'true');
        sessionStorage.setItem('selectedTransaction', JSON.stringify(transaction));
        onNavigate?.('analysis', 'sql-queries');
        onClose();
      }
    },
    {
      icon: FileText,
      label: 'View Java Source (ASM)',
      description: 'Decompile bytecode',
      action: handleViewJavaSource
    },
    {
      icon: Server,
      label: 'View Agent Details',
      description: '→ Config Tab',
      action: () => {
        sessionStorage.setItem('selectedAgentId', transaction.agentName);
        onNavigate?.('config', 'agent-details');
        onClose();
      }
    },
    {
      icon: Users,
      label: 'User Session History',
      description: 'View all transactions for this user',
      action: () => {
        sessionStorage.setItem('userIdFilter', transaction.userId || '');
        onNavigate?.('analysis', 'user-session');
        onClose();
      },
      disabled: !transaction.userId
    },
    {
      icon: TrendingUp,
      label: 'Find Similar Transactions',
      description: 'Search for similar patterns',
      action: () => {
        sessionStorage.setItem('similarEndpoint', transaction.endpoint);
        onNavigate?.('analysis', 'similar-transactions');
        onClose();
      }
    },
    {
      icon: AlertCircle,
      label: 'Create Alert Rule',
      description: 'Set up monitoring for this endpoint',
      action: () => {
        sessionStorage.setItem('alertEndpoint', transaction.endpoint);
        onNavigate?.('config', 'alerts');
        onClose();
      }
    },
    {
      icon: Network,
      label: 'View in Topology',
      description: 'Show service dependencies',
      action: handleViewTopology
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-popover border border-border rounded-lg shadow-2xl z-[100] min-w-[280px] max-w-[320px] flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: position.maxHeight
      }}
    >
      {/* Transaction Info Header - Sticky */}
      <div className="px-4 py-2 border-b border-border flex-shrink-0 bg-popover">
        <div className="text-xs text-muted-foreground">Transaction ID</div>
        <div className="text-sm font-mono truncate">{transaction.id}</div>
        <div className="text-xs text-muted-foreground mt-1">
          <span className={`
            inline-block px-2 py-0.5 rounded text-xs font-semibold
            ${transaction.status === 'fast' ? 'bg-green-500/20 text-green-400' : ''}
            ${transaction.status === 'normal' ? 'bg-blue-500/20 text-blue-400' : ''}
            ${transaction.status === 'slow' ? 'bg-orange-500/20 text-orange-400' : ''}
            ${transaction.status === 'very_slow' ? 'bg-red-500/20 text-red-400' : ''}
            ${transaction.status === 'error' ? 'bg-purple-500/20 text-purple-400' : ''}
          `}>
            {transaction.responseTime.toFixed(0)}ms
          </span>
          <span className="ml-2">{transaction.method}</span>
        </div>
      </div>

      {/* Menu Items - Scrollable */}
      <div className="overflow-y-auto flex-1 py-2 scrollbar-thin">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              disabled={item.disabled}
              className={`
                  w-full flex items-start gap-3 px-4 py-2.5 text-sm
                  transition-colors text-left
                  ${item.disabled
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'hover:bg-accent hover:text-accent-foreground'
                }
                `}
            >
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.label}</div>
                {(item as any).description && (
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{(item as any).description}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
