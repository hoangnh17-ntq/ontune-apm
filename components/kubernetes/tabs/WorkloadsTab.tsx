'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Box, GitBranch } from 'lucide-react';

export default function WorkloadsTab() {
  const deployments = [
    { name: 'nginx-deployment', namespace: 'default', replicas: '3/3', image: 'nginx:1.25', ready: true },
    { name: 'backend-api', namespace: 'production', replicas: '5/5', image: 'myapp/backend:v2.1', ready: true },
    { name: 'frontend-app', namespace: 'production', replicas: '2/3', image: 'myapp/frontend:v1.5', ready: false }
  ];

  const statefulsets = [
    { name: 'redis-master', namespace: 'database', replicas: '1/1', image: 'redis:7.2', ready: true },
    { name: 'mongodb', namespace: 'database', replicas: '3/3', image: 'mongo:6.0', ready: true }
  ];

  const daemonsets = [
    { name: 'node-exporter', namespace: 'monitoring', desired: 3, current: 3, ready: 3 },
    { name: 'fluentd', namespace: 'logging', desired: 3, current: 3, ready: 2 }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Workload Management</h2>
      
      {/* Deployments */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Deployments</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAMESPACE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">REPLICAS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">IMAGE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((dep, idx) => (
                  <tr key={dep.name} className={`border-b ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{dep.name}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{dep.namespace}</Badge></td>
                    <td className="px-4 py-3 font-semibold">{dep.replicas}</td>
                    <td className="px-4 py-3 text-sm">{dep.image}</td>
                    <td className="px-4 py-3">
                      <Badge className={dep.ready ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                        {dep.ready ? 'Ready' : 'Progressing'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* StatefulSets */}
      <div>
        <h3 className="text-lg font-semibold mb-3">StatefulSets</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAMESPACE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">REPLICAS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">IMAGE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {statefulsets.map((sts, idx) => (
                  <tr key={sts.name} className={`border-b ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Box className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">{sts.name}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{sts.namespace}</Badge></td>
                    <td className="px-4 py-3 font-semibold">{sts.replicas}</td>
                    <td className="px-4 py-3 text-sm">{sts.image}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-green-500/20 text-green-500">Ready</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* DaemonSets */}
      <div>
        <h3 className="text-lg font-semibold mb-3">DaemonSets</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAMESPACE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">DESIRED</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">CURRENT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">READY</th>
                </tr>
              </thead>
              <tbody>
                {daemonsets.map((ds, idx) => (
                  <tr key={ds.name} className={`border-b ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{ds.name}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{ds.namespace}</Badge></td>
                    <td className="px-4 py-3 font-semibold">{ds.desired}</td>
                    <td className="px-4 py-3 font-semibold">{ds.current}</td>
                    <td className="px-4 py-3">
                      <Badge className={ds.ready === ds.desired ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                        {ds.ready}/{ds.desired}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
