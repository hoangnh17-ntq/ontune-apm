'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SlidePanel from '@/components/ui/SlidePanel';
import { Plus, Edit, Settings, List, LayoutPanelLeft, Globe2, Server, Sparkles, TerminalSquare } from 'lucide-react';
import { ProjectSummary, WasSummary, WebsiteSummary } from '@/types/apm';
import { generateWebsiteSummaries } from '@/lib/mockData';

interface ConfigTabProps {
  activeAction?: string;
}

type MainTab = 'projects' | 'events' | 'settings';
type Section = 'project' | 'was' | 'website';

interface EditState {
  type: Section;
  mode: 'add' | 'edit';
  itemId?: string;
}

const slugify = (s: string | undefined) =>
  (s || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'project';

const initProjects = (): ProjectSummary[] => [
 { id: 'proj-1', name: 'E-Commerce Platform', websiteCount: 4, wasCount: 3, webserverCount: 2, tps: 1800, apdexScore: 0.93, avgResponseTime: 240, errorRate: 0.8, status: 'healthy' },
 { id: 'proj-2', name: 'Banking Suite', websiteCount: 2, wasCount: 4, webserverCount: 3, tps: 950, apdexScore: 0.88, avgResponseTime: 310, errorRate: 1.6, status: 'warning' },
 { id: 'proj-3', name: 'IoT Control', websiteCount: 1, wasCount: 2, webserverCount: 1, tps: 420, apdexScore: 0.75, avgResponseTime: 520, errorRate: 2.9, status: 'critical' }
];

 const initWas = (): WasSummary[] => [
  { id: 'was-1', name: 'Auth-Service', project: 'E-Commerce Platform', status: 'healthy', p95Latency: 0, p99Latency: 0, tps: 0, throughput: 0, errorRate: 0, cpu: 0, memory: 0 },
  { id: 'was-2', name: 'Payment-Gateway', project: 'Banking Suite', status: 'warning', p95Latency: 0, p99Latency: 0, tps: 0, throughput: 0, errorRate: 0, cpu: 0, memory: 0 },
  { id: 'was-3', name: 'Device-API', project: 'IoT Control', status: 'critical', p95Latency: 0, p99Latency: 0, tps: 0, throughput: 0, errorRate: 0, cpu: 0, memory: 0 }
];

export default function ConfigTab({ activeAction }: ConfigTabProps) {
  const [mainTab, setMainTab] = useState<MainTab>('projects');
  const [section, setSection] = useState<Section>('project');
  const [projects, setProjects] = useState<ProjectSummary[]>(() => initProjects());
  const [wasList, setWasList] = useState<WasSummary[]>(() => initWas());
  const [websites, setWebsites] = useState<WebsiteSummary[]>(() => generateWebsiteSummaries(6));
  const [editState, setEditState] = useState<EditState | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const sidebarItems = [
    { id: 'project' as Section, label: 'Projects', icon: LayoutPanelLeft, count: projects.length },
    { id: 'was' as Section, label: 'WAS', icon: Server, count: wasList.length },
    { id: 'website' as Section, label: 'Websites', icon: Globe2, count: websites.length },
  ];

  const startEdit = (type: Section, mode: 'add' | 'edit', item?: any) => {
    setEditState({ type, mode, itemId: item?.id });
    setForm({ ...item });
  };

  const resetEdit = () => {
    setEditState(null);
    setForm({});
  };

  const saveItem = () => {
    if (!editState) return;
    if (editState.type === 'project') {
      const current = projects.find(p => p.id === editState.itemId);
      const payload: ProjectSummary = {
        id: editState.mode === 'add' ? `proj-${Date.now()}` : (form.id || editState.itemId || ''),
        name: form.name || current?.name || 'New Project',
        websiteCount: 0,
        wasCount: 0,
        webserverCount: 0,
        tps: 0,
        apdexScore: 0,
        avgResponseTime: 0,
        errorRate: 0,
        status: 'healthy'
      };
      setProjects(prev => editState.mode === 'add' ? [...prev, payload] : prev.map(p => p.id === payload.id ? payload : p));
      resetEdit();
      return;
    }

    if (editState.type === 'was') {
      const current = wasList.find(p => p.id === editState.itemId);
      const payload: WasSummary = {
        id: editState.mode === 'add' ? `was-${Date.now()}` : (form.id || editState.itemId || ''),
        name: form.name || current?.name || 'New WAS',
        project: form.project || current?.project || projects[0]?.name || 'Project',
        status: 'healthy',
        p95Latency: 0,
        p99Latency: 0,
        tps: 0,
        throughput: 0,
        errorRate: 0,
        cpu: 0,
        memory: 0
      };
      setWasList(prev => editState.mode === 'add' ? [...prev, payload] : prev.map(p => p.id === payload.id ? payload : p));
      resetEdit();
      return;
    }

    const current = websites.find(p => p.id === editState.itemId);
    const payload: WebsiteSummary = {
      id: editState.mode === 'add' ? `web-${Date.now()}` : (form.id || editState.itemId || ''),
      name: form.name || current?.name || 'New Website',
      project: form.project || current?.project || projects[0]?.name || 'Project',
      status: 'healthy',
      pageLoadTime: 0,
      domContentLoaded: 0,
      sessionCount: 0,
      jsErrorRate: 0,
      httpErrorRate: 0,
    };
    setWebsites(prev => editState.mode === 'add' ? [...prev, payload] : prev.map(p => p.id === payload.id ? payload : p));
    resetEdit();
  };

  const renderList = () => {
    if (section === 'project') {
      return (
        <div className="space-y-3">
          {projects.map(p => (
            <Card key={p.id} className="border-border/70">
              <CardContent className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Key: {slugify(p.name)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="gap-1" onClick={() => startEdit('project', 'edit', p)}>
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (section === 'was') {
      return (
        <div className="space-y-3">
          {wasList.map(w => (
            <Card key={w.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{w.name}</span>
                    <span className="text-xs text-muted-foreground">· {w.project}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Key: {slugify(w.name)}</div>
                </div>
                <Button size="sm" variant="ghost" className="gap-1" onClick={() => startEdit('was', 'edit', w)}>
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {websites.map(w => (
          <Card key={w.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{w.name}</span>
                  <span className="text-xs text-muted-foreground">· {w.project}</span>
                </div>
                <div className="text-xs text-muted-foreground">Key: {slugify(w.name)}</div>
              </div>
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => startEdit('website', 'edit', w)}>
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const projectSelect = (
    <select
      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      value={form.project || projects[0]?.name || ''}
      onChange={e => setForm({ ...form, project: e.target.value })}
    >
      {projects.map(p => (
        <option key={p.id} value={p.name}>{p.name}</option>
      ))}
    </select>
  );

  const renderInstallSnippet = () => {
    if (!editState) return null;
    const projectKey = slugify(form.project || projects[0]?.name || form.name || 'project');

    if (editState.type === 'project') {
      const projKey = slugify(form.name || 'project');
      const cli = `whatap-cli project register --name "${form.name || 'My Project'}" --key ${projKey} --api-key YOUR_API_KEY`;
      const env = `export WHATAP_PROJECT=${projKey}\nexport WHATAP_TOKEN=YOUR_TOKEN_HERE\nexport WHATAP_API_KEY=YOUR_API_KEY`;
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground"><TerminalSquare className="h-4 w-4" />CLI registration</div>
          <pre className="bg-muted p-3 rounded-md overflow-x-auto"><code>{cli}</code></pre>
          <div className="flex items-center gap-2 text-muted-foreground"><TerminalSquare className="h-4 w-4" />Agent env</div>
          <pre className="bg-muted p-3 rounded-md overflow-x-auto"><code>{env}</code></pre>
        </div>
      );
    }

    if (editState.type === 'was') {
      const wasKey = slugify(form.name || 'was-node');
      const maven = `<dependency>\n  <groupId>com.whatap</groupId>\n  <artifactId>whatap-apm</artifactId>\n  <version>latest</version>\n</dependency>`;
      const javaAgent = `-javaagent:/opt/whatap/whatap.agent.jar -Dwhatap.project=${projectKey} -Dwhatap.was=${wasKey} -Dwhatap.api_key=YOUR_API_KEY`;
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground"><TerminalSquare className="h-4 w-4" />Maven dependency</div>
          <pre className="bg-muted p-3 rounded-md overflow-x-auto"><code>{maven}</code></pre>
          <div className="flex items-center gap-2 text-muted-foreground"><TerminalSquare className="h-4 w-4" />JVM agent flags</div>
          <pre className="bg-muted p-3 rounded-md overflow-x-auto"><code>{javaAgent}</code></pre>
        </div>
      );
    }

    const webKey = slugify(form.name || 'website');
    const snippet = `<script src="https://cdn.whatap.io/rum.js"\n  data-project="${projectKey}"\n  data-website="${webKey}"\n  data-api-key="YOUR_API_KEY"></script>`;
    return (
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground"><TerminalSquare className="h-4 w-4" />RUM JS snippet</div>
        <pre className="bg-muted p-3 rounded-md overflow-x-auto"><code>{snippet}</code></pre>
      </div>
    );
  };

  const renderFormFields = () => {
    if (!editState) return null;
    if (editState.type === 'project') {
      return (
        <div className="space-y-4 p-6">
          <h3 className="font-semibold text-lg mb-2">{editState.mode === 'add' ? 'Add Project' : 'Edit Project'}</h3>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Project name</label>
            <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Owner / Tag</label>
              <Input value={form.owner || ''} onChange={e => setForm({ ...form, owner: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetEdit}>Cancel</Button>
            <Button onClick={saveItem}>Save</Button>
          </div>
        </div>
      );
    }

    if (editState.type === 'was') {
      return (
        <div className="space-y-4 p-6">
          <h3 className="font-semibold text-lg mb-2">{editState.mode === 'add' ? 'Register WAS' : 'Edit WAS'}</h3>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">WAS name</label>
            <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Project</label>
            {projectSelect}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Owner / Service tag</label>
              <Input value={form.owner || ''} onChange={e => setForm({ ...form, owner: e.target.value })} />
            </div>
          </div>
          <div className="border rounded-md bg-muted/50 p-3">{renderInstallSnippet()}</div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetEdit}>Cancel</Button>
            <Button onClick={saveItem}>Save</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-6">
        <h3 className="font-semibold text-lg mb-2">{editState.mode === 'add' ? 'Add Website' : 'Edit Website'}</h3>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Website name</label>
          <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Project</label>
          {projectSelect}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Owner / Tag</label>
            <Input value={form.owner || ''} onChange={e => setForm({ ...form, owner: e.target.value })} />
          </div>
        </div>
        <div className="border rounded-md bg-muted/50 p-3">{renderInstallSnippet()}</div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={resetEdit}>Cancel</Button>
          <Button onClick={saveItem}>Save</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'projects', label: 'Projects', icon: LayoutPanelLeft },
          { id: 'events', label: 'Events', icon: List },
          { id: 'settings', label: 'Setting', icon: Settings }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={mainTab === tab.id ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => setMainTab(tab.id as MainTab)}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {mainTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Context Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Config Sections
              </CardTitle>
              <CardDescription>Choose what to configure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {sidebarItems.map(item => (
                <Button
                  key={item.id}
                  variant={section === item.id ? 'default' : 'ghost'}
                  className="w-full justify-between"
                  onClick={() => setSection(item.id)}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" /> {item.label}
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-muted-foreground">{section === 'project' ? 'Projects' : section === 'was' ? 'WAS' : 'Websites'}</div>
            <h3 className="text-xl font-semibold">{section === 'project' ? 'Project Registration' : section === 'was' ? 'WAS Registration' : 'Website Registration'}</h3>
          </div>
          <Button className="gap-2" onClick={() => startEdit(section, 'add')}>
            <Plus className="h-4 w-4" /> Register {section === 'project' ? 'Project' : section === 'was' ? 'WAS' : 'Website'}
          </Button>
        </div>

        {renderList()}
          </div>
        </div>
      )}

      {mainTab === 'events' && (
        <Card>
          <CardHeader>
            <CardTitle>Event Configuration</CardTitle>
            <CardDescription>Define routing rules, retention, and correlation for captured events</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Event configuration UI coming soon. Capture rules, tags, and export pipelines will appear here.</p>
          </CardContent>
        </Card>
      )}

      {mainTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Global configuration for notifications, SSO, and data retention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use this tab to wire organization-wide preferences. (Placeholder for now.)</p>
          </CardContent>
        </Card>
      )}

      <SlidePanel isOpen={!!editState} onClose={resetEdit} title={editState ? `${editState.mode === 'add' ? 'Add' : 'Edit'} ${editState.type === 'project' ? 'Project' : editState.type === 'was' ? 'WAS' : 'Website'}` : ''}>
        {renderFormFields()}
      </SlidePanel>
    </div>
  );
}
