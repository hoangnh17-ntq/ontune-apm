'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Check, X } from 'lucide-react';

interface CreateAlertRuleDialogProps {
  defaultEndpoint?: string;
  onClose?: () => void;
}

export default function CreateAlertRuleDialog({ defaultEndpoint, onClose }: CreateAlertRuleDialogProps) {
  const [ruleName, setRuleName] = useState('');
  const [condition, setCondition] = useState<'response_time' | 'error_rate' | 'throughput'>('response_time');
  const [threshold, setThreshold] = useState('1000');
  const [duration, setDuration] = useState('5');
  const [severity, setSeverity] = useState<'warning' | 'critical'>('warning');
  const [endpoint, setEndpoint] = useState(defaultEndpoint || '');
  const [created, setCreated] = useState(false);

  const handleCreate = () => {
    // Simulate alert creation
    setCreated(true);
    setTimeout(() => {
      onClose?.();
    }, 2000);
  };

  if (created) {
    return (
      <Card className="bg-green-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-400">
            <Check className="h-6 w-6" />
            <div>
              <div className="font-semibold">Alert Rule Created Successfully!</div>
              <div className="text-sm text-muted-foreground">
                You will be notified when conditions are met.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Create Alert Rule
              </CardTitle>
              <CardDescription className="mt-2">
                Set up automated alerting for performance issues
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rule Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rule Name</label>
            <Input
              placeholder="e.g., High Response Time Alert"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>

          {/* Target Endpoint */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Endpoint (Optional)</label>
            <Input
              placeholder="Leave empty for all endpoints"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
            {defaultEndpoint && (
              <p className="text-xs text-muted-foreground">
                Pre-filled from transaction: {defaultEndpoint}
              </p>
            )}
          </div>

          {/* Condition Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Condition Type</label>
            <div className="flex gap-2">
              <Button
                variant={condition === 'response_time' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCondition('response_time')}
              >
                Response Time
              </Button>
              <Button
                variant={condition === 'error_rate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCondition('error_rate')}
              >
                Error Rate
              </Button>
              <Button
                variant={condition === 'throughput' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCondition('throughput')}
              >
                Throughput
              </Button>
            </div>
          </div>

          {/* Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Threshold {condition === 'response_time' ? '(ms)' : condition === 'error_rate' ? '(%)' : '(req/s)'}
              </label>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={condition === 'response_time' ? '1000' : condition === 'error_rate' ? '5' : '100'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="5"
              />
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Severity</label>
            <div className="flex gap-2">
              <Button
                variant={severity === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSeverity('warning')}
                className="gap-2"
              >
                <Badge className="bg-yellow-500">⚠</Badge>
                Warning
              </Button>
              <Button
                variant={severity === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSeverity('critical')}
                className="gap-2"
              >
                <Badge className="bg-red-500">🔴</Badge>
                Critical
              </Button>
            </div>
          </div>

          {/* Preview */}
          <Alert>
            <AlertDescription>
              <div className="text-sm">
                <strong>Alert Preview:</strong>
                <p className="mt-2">
                  Trigger {severity} alert when{' '}
                  <strong>
                    {condition === 'response_time' && `response time exceeds ${threshold}ms`}
                    {condition === 'error_rate' && `error rate exceeds ${threshold}%`}
                    {condition === 'throughput' && `throughput drops below ${threshold} req/s`}
                  </strong>
                  {' '}for {duration} consecutive minutes
                  {endpoint && ` on endpoint: ${endpoint}`}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="flex-1" disabled={!ruleName}>
              Create Alert Rule
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

