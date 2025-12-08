'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Database } from 'lucide-react';

export default function StorageTab() {
  const pvs = [
    { name: 'pv-data-001', capacity: '100Gi', storageClass: 'fast-ssd', status: 'Bound', claim: 'default/data-claim' },
    { name: 'pv-data-002', capacity: '50Gi', storageClass: 'standard', status: 'Bound', claim: 'production/app-data' },
    { name: 'pv-logs-001', capacity: '200Gi', storageClass: 'standard', status: 'Available', claim: '-' }
  ];

  const pvcs = [
    { name: 'data-claim', namespace: 'default', status: 'Bound', volume: 'pv-data-001', capacity: '100Gi', storageClass: 'fast-ssd' },
    { name: 'app-data', namespace: 'production', status: 'Bound', volume: 'pv-data-002', capacity: '50Gi', storageClass: 'standard' },
    { name: 'temp-data', namespace: 'staging', status: 'Pending', volume: '-', capacity: '30Gi', storageClass: 'standard' }
  ];

  const getStatusColor = (status: string) => {
    return status === 'Bound' ? 'bg-green-500/20 text-green-500' : 
           status === 'Available' ? 'bg-blue-500/20 text-blue-500' : 
           'bg-yellow-500/20 text-yellow-500';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Storage Management</h2>
      
      {/* Persistent Volumes */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Persistent Volumes</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">CAPACITY</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">STORAGE CLASS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">CLAIM</th>
                </tr>
              </thead>
              <tbody>
                {pvs.map((pv, idx) => (
                  <tr key={pv.name} className={`border-b ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">{pv.name}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{pv.capacity}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{pv.storageClass}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(pv.status)}>{pv.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{pv.claim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Persistent Volume Claims */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Persistent Volume Claims</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">NAMESPACE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">VOLUME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">CAPACITY</th>
                </tr>
              </thead>
              <tbody>
                {pvcs.map((pvc, idx) => (
                  <tr key={pvc.name} className={`border-b ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{pvc.name}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{pvc.namespace}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(pvc.status)}>{pvc.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{pvc.volume}</td>
                    <td className="px-4 py-3 font-semibold">{pvc.capacity}</td>
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
