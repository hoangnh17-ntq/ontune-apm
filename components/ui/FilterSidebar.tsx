'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, ChevronRight, Search, X } from 'lucide-react';

interface FilterSidebarProps {
  onApplyFilters?: (filters: FilterState) => void;
  availableHosts?: string[];
}

export interface FilterState {
  selectedHosts: string[];
  dateFrom: string;
  dateTo: string;
  dataType: string;
  interval: string;
  aggregation: string;
}

export default function FilterSidebar({ onApplyFilters, availableHosts = [] }: FilterSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 16));
  const [dataType, setDataType] = useState('daily');
  const [interval, setInterval] = useState('1h');
  const [aggregation, setAggregation] = useState('avg');
  const [hostListExpanded, setHostListExpanded] = useState(true);
  const [dateTimeExpanded, setDateTimeExpanded] = useState(true);
  const [dataOptionExpanded, setDataOptionExpanded] = useState(true);

  const defaultHosts = availableHosts.length > 0 ? availableHosts : [
    'demo-8101',
    'demo-8102', 
    'demo-8103',
    'demo-8104',
    'demo-8105',
    'star_star'
  ];

  const filteredHosts = defaultHosts.filter(host => 
    host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleHost = (host: string) => {
    setSelectedHosts(prev => 
      prev.includes(host) 
        ? prev.filter(h => h !== host)
        : [...prev, host]
    );
  };

  const handleApply = () => {
    const filters: FilterState = {
      selectedHosts,
      dateFrom,
      dateTo,
      dataType,
      interval,
      aggregation
    };
    onApplyFilters?.(filters);
  };

  const handleReset = () => {
    setSelectedHosts([]);
    setSearchTerm('');
    setDataType('daily');
    setInterval('1h');
    setAggregation('avg');
  };

  return (
    <div className="w-[280px] border-r bg-card flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {/* Host List */}
        <div className="space-y-2">
          <button
            onClick={() => setHostListExpanded(!hostListExpanded)}
            className="flex items-center justify-between w-full text-sm font-semibold hover:text-primary transition-colors"
          >
            <span className="text-orange-400">Host List</span>
            {hostListExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          {hostListExpanded && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin">
                {filteredHosts.map(host => (
                  <div
                    key={host}
                    onClick={() => toggleHost(host)}
                    className={`
                      px-3 py-1.5 rounded text-sm cursor-pointer transition-colors flex items-center justify-between
                      ${selectedHosts.includes(host) 
                        ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <span className="font-mono">{host}</span>
                    {selectedHosts.includes(host) && (
                      <X className="h-3 w-3" onClick={(e) => {
                        e.stopPropagation();
                        toggleHost(host);
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {selectedHosts.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedHosts.map(host => (
                    <Badge key={host} variant="secondary" className="text-xs">
                      {host}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date/Time */}
        <div className="space-y-2 pt-2 border-t">
          <button
            onClick={() => setDateTimeExpanded(!dateTimeExpanded)}
            className="flex items-center justify-between w-full text-sm font-semibold hover:text-primary transition-colors"
          >
            <span>Date/Time</span>
            {dateTimeExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          {dateTimeExpanded && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  From
                </label>
                <Input
                  type="datetime-local"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  To
                </label>
                <Input
                  type="datetime-local"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Quick Time Ranges */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Last 1h', hours: 1 },
                  { label: 'Last 6h', hours: 6 },
                  { label: 'Last 24h', hours: 24 },
                  { label: 'Last 7d', hours: 168 },
                ].map(range => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setDateFrom(new Date(Date.now() - range.hours * 60 * 60 * 1000).toISOString().slice(0, 16));
                      setDateTo(new Date().toISOString().slice(0, 16));
                    }}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Options */}
        <div className="space-y-2 pt-2 border-t">
          <button
            onClick={() => setDataOptionExpanded(!dataOptionExpanded)}
            className="flex items-center justify-between w-full text-sm font-semibold hover:text-primary transition-colors"
          >
            <span>Data Option</span>
            {dataOptionExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          {dataOptionExpanded && (
            <div className="space-y-3">
              {/* Data Type */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Data Type</label>
                <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value)}
                  className="w-full h-9 text-sm border rounded-md px-3 bg-background"
                >
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                  <option value="realtime">Real-time</option>
                </select>
              </div>

              {/* Interval */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Interval</label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full h-9 text-sm border rounded-md px-3 bg-background"
                >
                  <option value="1m">1 min</option>
                  <option value="5m">5 min</option>
                  <option value="15m">15 min</option>
                  <option value="1h">1 hour</option>
                  <option value="6h">6 hours</option>
                  <option value="1d">1 day</option>
                </select>
              </div>

              {/* Aggregation */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Aggregation</label>
                <div className="grid grid-cols-3 gap-1">
                  {['AVG', 'MAX', 'MIN'].map(agg => (
                    <button
                      key={agg}
                      onClick={() => setAggregation(agg.toLowerCase())}
                      className={`
                        h-8 text-xs font-medium rounded transition-colors
                        ${aggregation === agg.toLowerCase()
                          ? 'bg-orange-500 text-white'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }
                      `}
                    >
                      {agg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Button */}
      <div className="p-4 border-t space-y-2">
        <Button 
          onClick={handleApply} 
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          Apply Filters
        </Button>
        <Button 
          onClick={handleReset} 
          variant="outline"
          className="w-full"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}



