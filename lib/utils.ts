import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format time helpers
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format duration
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

// Parse advanced query
export function parseAdvancedQuery(query: string): any {
  // Parse queries like "transaction_time > 3s" or "status = error"
  const match = query.match(/(\w+)\s*(>|<|>=|<=|=|!=)\s*(.+)/);
  if (!match) return null;
  
  const [, field, operator, value] = match;
  
  // Convert value
  let parsedValue: any = value.trim();
  if (parsedValue.endsWith('s')) {
    parsedValue = parseFloat(parsedValue) * 1000; // Convert to ms
  } else if (parsedValue.endsWith('ms')) {
    parsedValue = parseFloat(parsedValue);
  } else if (!isNaN(parseFloat(parsedValue))) {
    parsedValue = parseFloat(parsedValue);
  }
  
  return { field, operator, value: parsedValue };
}

// Apply transaction filter
export function applyTransactionFilter(transactions: any[], filter: any): any[] {
  return transactions.filter(tx => {
    // Status filter
    if (filter.status && filter.status.length > 0) {
      if (!filter.status.includes(tx.status)) return false;
    }
    
    // Method filter
    if (filter.method && filter.method.length > 0) {
      if (!filter.method.includes(tx.method)) return false;
    }
    
    // Response time filter
    if (filter.responseTime) {
      if (filter.responseTime.min !== undefined && tx.responseTime < filter.responseTime.min) return false;
      if (filter.responseTime.max !== undefined && tx.responseTime > filter.responseTime.max) return false;
    }
    
    // Error only filter
    if (filter.errorOnly && tx.status !== 'error') return false;
    
    // Endpoint filter
    if (filter.endpoint && filter.endpoint.length > 0) {
      const matchesEndpoint = filter.endpoint.some((ep: string) => 
        tx.endpoint.toLowerCase().includes(ep.toLowerCase())
      );
      if (!matchesEndpoint) return false;
    }
    
    return true;
  });
}


