'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Globe, Router } from 'lucide-react';

export default function NetworkTab() {
  const services = [
    { name: 'nginx-service', type: 'LoadBalancer', clusterIP: '10.96.0.10', externalIP: '34.123.45.67', ports: '80:30080/TCP' },
    { name: 'api-service', type: 'ClusterIP', clusterIP: '10.96.0.15', externalIP: '-', ports: '8080/TCP' },
    { name: 'database-service', type: 'ClusterIP', clusterIP: '10.96.0.20', externalIP: '-', ports: '5432/TCP' }
  ];

  const ingresses = [
    { name: 'main-ingress', className: 'nginx', hosts: 'app.example.com, api.example.com' },
    { name: 'api-ingress', className: 'nginx', hosts: 'api.production.example.com' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Network Management</h2>
      
      {/* Services */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Services</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">TYPE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">CLUSTER-IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">EXTERNAL-IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">PORT(S)</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc, idx) => (
                  <tr key={svc.name} className={`border-b ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Network className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{svc.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{svc.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{svc.clusterIP}</td>
                    <td className="px-4 py-3 text-sm">{svc.externalIP}</td>
                    <td className="px-4 py-3 text-sm">{svc.ports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Ingresses */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Ingresses</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">CLASS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">HOSTS</th>
                </tr>
              </thead>
              <tbody>
                {ingresses.map((ing, idx) => (
                  <tr key={ing.name} className={`border-b ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{ing.name}</span>
                    </td>
                    <td className="px-4 py-3"><Badge>{ing.className}</Badge></td>
                    <td className="px-4 py-3 text-sm">{ing.hosts}</td>
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
