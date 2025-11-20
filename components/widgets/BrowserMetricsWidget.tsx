'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, Smartphone, Monitor } from 'lucide-react';
import { FaChrome, FaSafari, FaFirefoxBrowser, FaEdge } from 'react-icons/fa';

interface BrowserStat {
  name: string;
  percentage: number;
  color: string;
  icon?: string;
}

export default function BrowserMetricsWidget() {
  const browsers: BrowserStat[] = [
    { name: 'Chrome', percentage: 65, color: '#4285f4' },
    { name: 'Safari', percentage: 18, color: '#34aadc' },
    { name: 'Firefox', percentage: 10, color: '#ff7139' },
    { name: 'Edge', percentage: 5, color: '#0078d7' },
    { name: 'Others', percentage: 2, color: '#6b7280' },
  ];
  
  // Browser icon components using react-icons
  const BrowserIcon = ({ name }: { name: string }) => {
    const iconClassName = "h-4 w-4";
    
    switch (name) {
      case 'Chrome':
        return <FaChrome className={iconClassName} style={{ color: '#4285f4' }} />;
      case 'Safari':
        return <FaSafari className={iconClassName} style={{ color: '#34aadc' }} />;
      case 'Firefox':
        return <FaFirefoxBrowser className={iconClassName} style={{ color: '#ff7139' }} />;
      case 'Edge':
        return <FaEdge className={iconClassName} style={{ color: '#0078d7' }} />;
      default:
        return <Globe className={iconClassName} style={{ color: '#6b7280' }} />;
    }
  };

  const devices: BrowserStat[] = [
    { name: 'Desktop', percentage: 58, color: '#3b82f6' },
    { name: 'Mobile', percentage: 35, color: '#22c55e' },
    { name: 'Tablet', percentage: 7, color: '#f97316' },
  ];

  const topCountries = [
    { name: 'Vietnam', visits: 2345, flag: '🇻🇳' },
    { name: 'USA', visits: 1823, flag: '🇺🇸' },
    { name: 'Singapore', visits: 1456, flag: '🇸🇬' },
    { name: 'Japan', visits: 987, flag: '🇯🇵' },
    { name: 'South Korea', visits: 654, flag: '🇰🇷' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Browser Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Browser Distribution
          </CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {browsers.map((browser) => (
            <div key={browser.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground flex items-center gap-2">
                  <BrowserIcon name={browser.name} />
                  {browser.name}
                </span>
                <span className="text-muted-foreground">{browser.percentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${browser.percentage}%`, backgroundColor: browser.color }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Device Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4" />
            Device Distribution
          </CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {devices.map((device) => (
            <div key={device.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground flex items-center gap-2">
                  {device.name === 'Desktop' && <Monitor className="h-3 w-3" />}
                  {device.name === 'Mobile' && <Smartphone className="h-3 w-3" />}
                  {device.name === 'Tablet' && <Monitor className="h-3 w-3" />}
                  {device.name}
                </span>
                <span className="text-muted-foreground">{device.percentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${device.percentage}%`, backgroundColor: device.color }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Geographic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Top Countries
          </CardTitle>
          <CardDescription>By visit count (last 24h)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topCountries.map((country, index) => (
              <div key={country.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-sm font-medium text-foreground">{country.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{country.visits.toLocaleString()}</span>
                  <span className="text-xs text-primary">#{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

