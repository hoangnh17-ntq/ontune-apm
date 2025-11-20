'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock3, Globe, Info, MapPin, MonitorSmartphone, Smartphone, X } from 'lucide-react';
import LineChartWidget from '@/components/charts/LineChartWidget';
import { RumSession, RumSessionTransaction, Transaction, WebsiteMetrics, WebsiteSummary } from '@/types/apm';
import { generateWebsiteMetrics } from '@/lib/mockData';
import TransactionDetailSlider from '@/components/monitor/TransactionDetailSlider';

interface WebsiteDetailSliderProps {
  website: WebsiteSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WebsiteDetailSlider({ website, isOpen, onClose }: WebsiteDetailSliderProps) {
  const [metrics, setMetrics] = useState<WebsiteMetrics | null>(null);
  const [selectedSession, setSelectedSession] = useState<RumSession | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);

  useEffect(() => {
    if (!website) return;
    setMetrics(generateWebsiteMetrics(website.id));
  }, [website]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedSession(null);
      setSelectedTransaction(null);
      setShowTransactionDetail(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setSelectedSession(null);
    setSelectedTransaction(null);
    setShowTransactionDetail(false);
    onClose();
  };

  const statusIcon = useMemo(() => {
    switch (website?.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  }, [website]);

  if (!website || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative ml-auto h-full w-full max-w-4xl bg-background shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            {statusIcon}
            <div>
              <h2 className="text-xl font-semibold">{website.name}</h2>
              <p className="text-sm text-muted-foreground">Website Detail • {website.project}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-3 pb-2 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">Page Load Time</div>
                <div className="text-lg font-bold text-blue-400">{website.pageLoadTime.toFixed(0)}ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-2 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">DOMContentLoaded</div>
                <div className="text-lg font-bold text-green-400">{website.domContentLoaded.toFixed(0)}ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-2 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">Sessions</div>
                <div className="text-lg font-bold text-orange-400">{website.sessionCount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-2 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">JS/HTTP Error</div>
                <div className="text-lg font-bold text-red-400">{website.jsErrorRate}% / {website.httpErrorRate}%</div>
              </CardContent>
            </Card>
          </div>

          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LineChartWidget
                title="Resource Load Time"
                data={metrics.resourceLoad}
                dataKeys={[{ key: 'value', color: '#3b82f6', name: 'Resource' }]}
                height={220}
              />
              <LineChartWidget
                title="First Input Delay"
                data={metrics.fid}
                dataKeys={[{ key: 'value', color: '#22c55e', name: 'FID' }]}
                height={220}
              />
              <LineChartWidget
                title="Interaction to Next Paint"
                data={metrics.inp}
                dataKeys={[{ key: 'value', color: '#f97316', name: 'INP' }]}
                height={220}
              />
            </div>
          )}

          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{ label: 'Browser', data: metrics.browserBreakdown }, { label: 'Device', data: metrics.deviceBreakdown }, { label: 'OS', data: metrics.osBreakdown }].map((section) => (
                <Card key={section.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      {section.label} Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {section.data.map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                        <div className="h-1.5 rounded bg-muted">
                          <div
                            className="h-1.5 rounded"
                            style={{ width: `${item.value}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-xs text-muted-foreground font-medium">
                      <tr>
                        <th className="px-4 py-3 text-left">Time</th>
                        <th className="px-4 py-3 text-left">Session</th>
                        <th className="px-4 py-3 text-left">Device</th>
                        <th className="px-4 py-3 text-left">Errors</th>
                        <th className="px-4 py-3 text-left">Duration</th>
                        <th className="px-4 py-3 text-left"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentSessions.map((session) => (
                        <tr
                          key={session.id}
                          className="border-t border-border hover:bg-muted/40 cursor-pointer"
                          onClick={() => setSelectedSession(session)}
                        >
                          <td className="px-4 py-3 font-mono text-xs">{session.startTime}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{session.user}</span>
                              <span className="text-xs text-muted-foreground">{session.id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-[11px]">{session.device}</Badge>
                              <Badge variant="secondary" className="text-[11px]">{session.browser}</Badge>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.country}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{session.errors.length}</td>
                          <td className="px-4 py-3 text-sm">
                            {(session.duration / 60).toFixed(1)}m • {session.pageViews} pages
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <SessionDetailSlider
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onTransactionSelect={(tx) => {
          setSelectedTransaction(tx);
          setShowTransactionDetail(true);
        }}
      />

      <TransactionDetailSlider
        transaction={selectedTransaction}
        isOpen={showTransactionDetail && !!selectedTransaction}
        onClose={() => {
          setShowTransactionDetail(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
}

interface SessionDetailSliderProps {
  session: RumSession | null;
  onClose: () => void;
  onTransactionSelect: (tx: Transaction) => void;
}

function SessionDetailSlider({ session, onClose, onTransactionSelect }: SessionDetailSliderProps) {
  if (!session) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto h-full w-full max-w-3xl bg-background shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Session Detail</div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">{session.user}</Badge>
              <span className="text-sm font-semibold">{session.id}</span>
            </div>
            <div className="text-xs text-muted-foreground">{session.startTime} • {session.pageViews} pages</div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock3 className="h-3 w-3" /> Duration
                </div>
                <div className="text-lg font-semibold">{(session.duration / 60).toFixed(1)} minutes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MonitorSmartphone className="h-3 w-3" /> Device
                </div>
                <div className="text-lg font-semibold">{session.device}</div>
                <div className="text-xs text-muted-foreground">{session.browser}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> User
                </div>
                <div className="text-lg font-semibold">{session.user}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {session.country}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" /> Pages
                </div>
                <div className="text-lg font-semibold">{session.pageViews}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Errors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {session.errors.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">No errors recorded for this session.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Time</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Message</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.errors.map((err) => (
                      <tr key={err.id} className="border-t border-border">
                        <td className="px-4 py-3 font-mono text-xs">{err.time}</td>
                        <td className="px-4 py-3">
                          <Badge variant={err.type === 'js' ? 'secondary' : 'outline'} className="text-xs">
                            {err.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{err.message}</td>
                        <td className="px-4 py-3 font-mono text-xs">{err.status || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Endpoint</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {session.transactions.map((txn) => (
                    <SessionTransactionRow
                      key={txn.id}
                      txn={txn}
                      session={session}
                      onOpenDetail={onTransactionSelect}
                    />
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SessionTransactionRow({ txn, session, onOpenDetail }: { txn: RumSessionTransaction; session: RumSession; onOpenDetail: (tx: Transaction) => void }) {
  const openDetail = () => {
    const status = txn.status === 'error' ? 'error' : txn.duration > 3000 ? 'slow' : 'normal';
    const detail: Transaction = {
      id: txn.id,
      traceId: `trace-${txn.id}`,
      timestamp: Date.now(),
      responseTime: txn.duration,
      status,
      method: 'HTTPC',
      endpoint: txn.endpoint,
      agentId: 'rum-agent',
      agentName: 'RUM JS',
      userId: session.user,
      httpMethod: 'GET',
      httpStatusCode: txn.status === 'error' ? 500 : 200,
    };
    onOpenDetail(detail);
  };

  return (
    <>
      <tr className="border-t border-border hover:bg-muted/40 cursor-pointer" onClick={openDetail}>
        <td className="px-4 py-3 font-mono text-xs">{txn.endpoint}</td>
        <td className="px-4 py-3">{txn.duration} ms</td>
        <td className="px-4 py-3">
          <Badge variant={txn.status === 'error' ? 'destructive' : 'secondary'} className="text-[11px]">
            {txn.status.toUpperCase()}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <Button variant="ghost" size="sm">View</Button>
        </td>
      </tr>
    </>
  );
}
