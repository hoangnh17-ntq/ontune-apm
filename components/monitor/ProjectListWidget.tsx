'use client';

import React, { useState, useMemo } from 'react';
import { Search, MoreVertical, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectSummary } from '@/types/apm';

interface ProjectListWidgetProps {
  projects?: ProjectSummary[];
  onProjectSelect?: (project: ProjectSummary) => void;
  onProjectDetail?: (project: ProjectSummary) => void;
}

const mockProjects: ProjectSummary[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    websiteCount: 3,
    wasCount: 5,
    webserverCount: 2,
    tps: 1250,
    apdexScore: 0.92,
    avgResponseTime: 145,
    errorRate: 0.3,
    status: 'healthy'
  },
  {
    id: '2',
    name: 'Banking System',
    websiteCount: 2,
    wasCount: 4,
    webserverCount: 3,
    tps: 890,
    apdexScore: 0.88,
    avgResponseTime: 210,
    errorRate: 1.2,
    status: 'warning'
  },
  {
    id: '3',
    name: 'Payment Gateway',
    websiteCount: 1,
    wasCount: 3,
    webserverCount: 2,
    tps: 2100,
    apdexScore: 0.95,
    avgResponseTime: 95,
    errorRate: 0.1,
    status: 'healthy'
  },
  {
    id: '4',
    name: 'Analytics Dashboard',
    websiteCount: 4,
    wasCount: 2,
    webserverCount: 1,
    tps: 450,
    apdexScore: 0.76,
    avgResponseTime: 380,
    errorRate: 3.8,
    status: 'critical'
  }
];

export default function ProjectListWidget({ 
  projects = mockProjects, 
  onProjectSelect,
  onProjectDetail 
}: ProjectListWidgetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const getStatusIcon = (status: ProjectSummary['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ProjectSummary['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
    }
  };

  const getApdexColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 200) return 'text-green-400';
    if (time <= 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getErrorRateColor = (rate: number) => {
    if (rate <= 1) return 'text-green-400';
    if (rate <= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Projects</h3>
          <span className="text-sm text-muted-foreground">
            {filteredProjects.length} projects
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted text-xs text-muted-foreground font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-right">TPS</th>
              <th className="px-4 py-3 text-right">Apdex</th>
              <th className="px-4 py-3 text-right">Response Time</th>
              <th className="px-4 py-3 text-right">Error Rate</th>
              <th className="px-4 py-3 text-center">Resources</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredProjects.map((project) => (
              <tr
                key={project.id}
                onClick={() => {
                  setSelectedProject(project.id);
                  onProjectSelect?.(project);
                }}
                className={`group border-t border-border hover:bg-muted cursor-pointer transition-colors ${
                  selectedProject === project.id ? 'bg-blue-500/5' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  {project.name}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {project.tps.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${getApdexColor(project.apdexScore)}`}>
                  {project.apdexScore.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${getResponseTimeColor(project.avgResponseTime)}`}>
                  {project.avgResponseTime}ms
                </td>
                <td className={`px-4 py-3 text-right font-mono ${getErrorRateColor(project.errorRate)}`}>
                  {project.errorRate.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <span className="text-blue-400">{project.websiteCount}W</span>
                    <span className="text-green-400">{project.wasCount}A</span>
                    <span className="text-orange-400">{project.webserverCount}S</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center">
                    {getStatusIcon(project.status)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProjectDetail?.(project);
                    }}
                    className="p-1 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Project options"
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
