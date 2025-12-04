'use client';

import React, { useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Columns,
  RefreshCw,
  Copy,
  Download
} from 'lucide-react';

export type KubernetesResourceType = 'pod' | 'node' | 'cluster' | 'namespace' | 'workload' | 'service';

interface KubernetesContextMenuProps {
  x: number;
  y: number;
  resourceType: KubernetesResourceType;
  resourceName: string;
  onClose: () => void;
  onViewDetail: () => void;
  onUseFilter?: () => void;
  onColumnSort?: () => void;
  onResetColumns?: () => void;
  onCopyToClipboard?: () => void;
  onDownloadData?: () => void;
}

const resourceLabels: Record<KubernetesResourceType, string> = {
  pod: 'Pod Details',
  node: 'Node Details',
  cluster: 'Cluster Details',
  namespace: 'Namespace Details',
  workload: 'Workload Details',
  service: 'Service Details'
};

export default function KubernetesContextMenu({
  x,
  y,
  resourceType,
  resourceName,
  onClose,
  onViewDetail,
  onUseFilter,
  onColumnSort,
  onResetColumns,
  onCopyToClipboard,
  onDownloadData
}: KubernetesContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x, y });

  useEffect(() => {
    if (!menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }

    if (y + menuRect.height > viewportHeight) {
      adjustedY = Math.max(10, y - menuRect.height);
    }

    setPosition({
      x: Math.max(10, adjustedX),
      y: Math.max(10, adjustedY)
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

  const menuItems = [
    {
      icon: Search,
      label: resourceLabels[resourceType],
      action: () => {
        onViewDetail();
        onClose();
      }
    },
    {
      icon: Filter,
      label: 'Use Filter',
      action: () => {
        onUseFilter?.();
        onClose();
      }
    },
    {
      icon: Columns,
      label: 'Sort Columns',
      action: () => {
        onColumnSort?.();
        onClose();
      }
    },
    {
      icon: RefreshCw,
      label: 'Reset Hidden Columns',
      action: () => {
        onResetColumns?.();
        onClose();
      },
      disabled: true
    },
    {
      icon: Copy,
      label: 'Copy to Clipboard',
      action: () => {
        onCopyToClipboard?.();
        onClose();
      }
    },
    {
      icon: Download,
      label: 'Download Data',
      action: () => {
        onDownloadData?.();
        onClose();
      }
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-popover border border-border rounded-lg shadow-2xl z-[100] min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="py-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-sm
                transition-colors text-left
                ${item.disabled
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-foreground hover:bg-accent'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
