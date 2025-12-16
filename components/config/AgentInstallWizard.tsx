'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Coffee, Globe, Server, Database, Copy, Check, Download, Terminal } from 'lucide-react';

type AppType = 'java' | 'nodejs' | 'python' | '.net' | 'php' | 'go';
type Step = 'select' | 'create' | 'install';

interface AgentInstallWizardProps {
  onClose?: () => void;
}

export default function AgentInstallWizard({ onClose }: AgentInstallWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<AppType | null>(null);
  const [projectName, setProjectName] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [enableAdvanced, setEnableAdvanced] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const applications = [
    {
      type: 'java' as AppType,
      icon: Coffee,
      name: 'Java',
      description: 'Supported versions: Java 6 and above',
      details: 'JVM support: Spring Boot, Tomcat, JBoss, WebLogic, WebSphere, Jeus, Resin',
      color: 'text-orange-500',
      frameworks: ['Spring Boot', 'Tomcat', 'JBoss', 'WebLogic', 'WebSphere']
    },
    {
      type: 'nodejs' as AppType,
      icon: Globe,
      name: 'Node.js',
      description: 'Supported versions: Node.js 17.0.0 and above',
      details: 'Framework support: Express, Koa, Nest.js, Fastify',
      color: 'text-green-500',
      frameworks: ['Express', 'Koa', 'Nest.js', 'Fastify']
    },
    {
      type: 'python' as AppType,
      icon: Server,
      name: 'Python',
      description: 'Supported versions: Python 2.7 and 3.3 and above',
      details: 'OS support: Red Hat/CentOS, Debian',
      color: 'text-blue-500',
      frameworks: ['Django', 'Flask', 'FastAPI']
    },
    {
      type: '.net' as AppType,
      icon: Database,
      name: '.NET',
      description: 'Supported versions: .NET Framework 4.6.1 and above',
      details: 'OS support: Windows Server 2012 and above',
      color: 'text-purple-500',
      frameworks: ['ASP.NET', 'ASP.NET Core']
    },
    {
      type: 'php' as AppType,
      icon: Server,
      name: 'PHP',
      description: 'Supported versions: PHP 5 >= 5.2.0, PHP 7, PHP 8',
      details: 'OS support: Red Hat/CentOS, Amazon Linux, Alpine, Ubuntu',
      color: 'text-indigo-500',
      frameworks: ['Laravel', 'Symfony', 'CodeIgniter']
    },
    {
      type: 'go' as AppType,
      icon: Globe,
      name: 'Go',
      description: 'Supported versions: Golang 1.17 and above',
      details: 'OS support: Red Hat/CentOS, Debian, Ubuntu, Alpine',
      color: 'text-cyan-500',
      frameworks: ['Gin', 'Echo', 'Fiber']
    }
  ];

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const getInstallationGuide = () => {
    const licenseKey = 'x6e05bbe8891f2af-x2a4e02qn96b7-x31j4b17d841lp';
    const serverHost = 'ontune-server.host=13.124.11.223/13.209.172.35';

    switch (selectedType) {
      case 'java':
        return {
          downloadUrl: 'https://api.whatap.io/agent/whatap.agent.java.tar.gz',
          extractCommand: 'tar -xvf whatap.agent.java.tar.gz',
          configSteps: [
            {
              title: 'Extract the downloaded file',
              command: 'tar -xvf whatap.agent.java.tar.gz',
              description: 'Extract the agent package to your desired directory'
            },
            {
              title: 'Configure whatap.conf',
              command: `license=${licenseKey}\n${serverHost}`,
              description: 'Copy the license key and server host to whatap.conf file'
            },
            {
              title: 'Add JVM parameter',
              command: '-javaagent:{WHATAP_HOME}/whatap.agent-2.2.2.jar',
              description: 'Add this parameter when starting your JVM application. The {WHATAP_HOME} is the path where you extracted the agent.'
            },
            {
              title: 'Restart your application',
              command: 'systemctl restart your-app',
              description: 'Restart your Java application to apply the changes'
            }
          ]
        };
      case 'nodejs':
        return {
          downloadUrl: 'npm install whatap',
          extractCommand: 'npm install whatap',
          configSteps: [
            {
              title: 'Install agent via npm',
              command: 'npm install --save whatap',
              description: 'Install the WhaTap Node.js agent package'
            },
            {
              title: 'Create whatap.conf',
              command: `license=${licenseKey}\n${serverHost}`,
              description: 'Create whatap.conf file in your project root'
            },
            {
              title: 'Add to your application',
              command: `const WhatapAgent = require('whatap').NodeAgent;\n\n// At the very beginning of your app\nWhatapAgent;`,
              description: 'Import and initialize the agent at the top of your main application file'
            },
            {
              title: 'Restart Node.js application',
              command: 'pm2 restart your-app',
              description: 'Restart your Node.js application'
            }
          ]
        };
      default:
        return null;
    }
  };

  const guide = getInstallationGuide();

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'select' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'select' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                1
              </div>
              <span className="font-semibold">Select product</span>
            </div>
            <div className="w-12 h-0.5 bg-border"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'create' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'create' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                2
              </div>
              <span className="font-semibold">Create project</span>
            </div>
            <div className="w-12 h-0.5 bg-border"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'install' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'install' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                3
              </div>
              <span className="font-semibold">Agent installation guide</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Product */}
      {currentStep === 'select' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Product Type</CardTitle>
              <CardDescription>After selecting a product, click the Create button.</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => {
              const Icon = app.icon;
              return (
                <Card
                  key={app.type}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedType === app.type ? 'border-primary shadow-md' : ''
                  }`}
                  onClick={() => setSelectedType(app.type)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-8 w-8 ${app.color}`} />
                        <div>
                          <CardTitle className="text-lg">{app.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">Application</Badge>
                        </div>
                      </div>
                      {selectedType === app.type && (
                        <Check className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                    <p className="text-xs text-muted-foreground">{app.details}</p>
                    {app.frameworks && (
                      <div className="pt-2">
                        <div className="text-xs text-muted-foreground mb-1">Supported:</div>
                        <div className="flex flex-wrap gap-1">
                          {app.frameworks.slice(0, 3).map((fw) => (
                            <Badge key={fw} variant="secondary" className="text-xs">
                              {fw}
                            </Badge>
                          ))}
                          {app.frameworks.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{app.frameworks.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      disabled={!selectedType || selectedType !== app.type}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedType === app.type) {
                          setCurrentStep('create');
                        }
                      }}
                    >
                      Create →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Create Project */}
      {currentStep === 'create' && selectedType && (
        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>
              Configure your {applications.find(a => a.type === selectedType)?.name} monitoring project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Project name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Insert project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Data server region <span className="text-red-500">*</span>
              </label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option>Asia Pacific (Seoul, South Korea)</option>
                <option>Asia Pacific (Tokyo, Japan)</option>
                <option>Asia Pacific (Singapore)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                A data server region refers to a region (a bundle of data centers installed to provide cloud services). 
                Selecting a specific region stores your data in the datacenter that belongs to that region.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Time zone <span className="text-red-500">*</span>
              </label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option>(GMT +7:00) Bangkok, Hanoi, Jakarta</option>
                <option>(GMT +8:00) Singapore, Hong Kong</option>
                <option>(GMT +9:00) Tokyo, Seoul</option>
              </select>
              <p className="text-xs text-muted-foreground">
                The time zone is the reference time when you generate alerts, reports.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Framework/Server (Optional)</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
              >
                <option value="">-- Select Framework --</option>
                {applications.find(a => a.type === selectedType)?.frameworks?.map((fw) => (
                  <option key={fw} value={fw}>{fw}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Select your framework for optimized configuration
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Project description</label>
              <textarea
                className="w-full p-2 border rounded-md bg-background min-h-[100px]"
                placeholder="Please enter a project description."
              />
            </div>

            {/* Advanced Configuration */}
            <div className="pt-4 border-t">
              <button
                className="flex items-center gap-2 text-sm text-primary hover:underline"
                onClick={() => setEnableAdvanced(!enableAdvanced)}
              >
                {enableAdvanced ? '▼' : '▶'} Advanced Configuration
              </button>
              {enableAdvanced && (
                <div className="mt-4 space-y-4 p-4 border rounded-md bg-muted/50">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Sampling Rate (%)</label>
                    <Input type="number" defaultValue="100" min="1" max="100" />
                    <p className="text-xs text-muted-foreground">
                      Percentage of transactions to trace (100% = trace all)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Environment Tag</label>
                    <select className="w-full p-2 border rounded-md bg-background">
                      <option>dev</option>
                      <option>uat</option>
                      <option>prod</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="capture-sql" defaultChecked />
                    <label htmlFor="capture-sql" className="text-sm cursor-pointer">
                      Capture SQL Queries
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="capture-http" defaultChecked />
                    <label htmlFor="capture-http" className="text-sm cursor-pointer">
                      Capture HTTP Calls
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('select')}>
                ← Before
              </Button>
              <Button
                className="flex-1"
                disabled={!projectName}
                onClick={() => setCurrentStep('install')}
              >
                Creating a project →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Installation Guide */}
      {currentStep === 'install' && guide && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Installation Guide</CardTitle>
              <CardDescription>
                Follow these steps to install and configure the {applications.find(a => a.type === selectedType)?.name} agent
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Terminal className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-400 mb-1">License Information</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    WhaTap Server 13.124.11.223/13.209.172.35 has been selected as your server. (TCP Outbound)
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted p-2 rounded text-xs font-mono">
                        License: x6e05bbe8891f2af-x2a4e02qn96b7-x31j4b17d841lp
                      </code>
                      <Button size="sm" variant="outline" onClick={() => handleCopyCommand('x6e05bbe8891f2af-x2a4e02qn96b7-x31j4b17d841lp')}>
                        {copiedCommand === 'x6e05bbe8891f2af-x2a4e02qn96b7-x31j4b17d841lp' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {guide.configSteps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  {step.title}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <pre className="flex-1 bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                    {step.command}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyCommand(step.command)}
                  >
                    {copiedCommand === step.command ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Test Connection */}
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Terminal className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-400 mb-1">Test Connection</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    After installing the agent, test the connection to verify it&apos;s working properly.
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTestingConnection(true);
                      setTimeout(() => {
                        setTestingConnection(false);
                        alert('✅ Connection successful! Agent is sending data.');
                      }, 2000);
                    }}
                    disabled={testingConnection}
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-400 mb-1">Installation Complete!</div>
                  <div className="text-sm text-muted-foreground">
                    After restarting your application, you can monitor it in the dashboard within a few minutes.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="justify-start">
                  📊 View Dashboard
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  📖 Documentation
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  ⚙️ Configure Alerts
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  🔧 Troubleshooting Guide
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep('create')}>
              ← Before
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Complete Installation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

