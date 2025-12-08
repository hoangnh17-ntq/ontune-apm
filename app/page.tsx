"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContextSidebar from '@/components/layout/ContextSidebar';
import CompactTabBar from '@/components/layout/CompactTabBar';
import KubernetesTabBar from '@/components/kubernetes/KubernetesTabBar';
import { AppTab } from '@/types/tabs';
import OverviewTab from '@/components/tabs/OverviewTab';
import MonitorTab from '@/components/tabs/MonitorTab';
import TransactionTab from '@/components/tabs/TransactionTab';
import RumTab from '@/components/tabs/RumTab';
import WasTab from '@/components/tabs/WasTab';
import AnalysisTabRefactored from '@/components/tabs/AnalysisTabRefactored';
import ReportTabRefactored from '@/components/tabs/ReportTabRefactored';
import ConfigTab from '@/components/tabs/ConfigTab';
import SelectApplicationView from '@/components/SelectApplicationView';
import TopologyTab from '@/components/tabs/TopologyTab';
import { APMTab } from '@/types/apm';
import { KubernetesTab } from '@/types/kubernetes';

// Kubernetes tabs
import KubernetesOverviewTab from '@/components/kubernetes/tabs/OverviewTab';
import ClusterTab from '@/components/kubernetes/tabs/ClusterTab';
import NodeTab from '@/components/kubernetes/tabs/NodeTab';
import PodTab from '@/components/kubernetes/tabs/PodTab';
import NamespaceTab from '@/components/kubernetes/tabs/NamespaceTab';
import NetworkTab from '@/components/kubernetes/tabs/NetworkTab';
import StorageTab from '@/components/kubernetes/tabs/StorageTab';
import WorkloadsTab from '@/components/kubernetes/tabs/WorkloadsTab';

export default function Home() {
  const [appTabs, setAppTabs] = useState<AppTab[]>([
    { id: 'demo-8101', appId: 'demo-8101', appName: 'Java APM Demo (8101)' }
  ]);
  const [activeAppTabId, setActiveAppTabId] = useState<string>('demo-8101');
  const [projectSources, setProjectSources] = useState<string[]>(['proj-1']);
  const [activeSection, setActiveSection] = useState<'apm' | 'kubernetes'>('apm');
  const [kubernetesTab, setKubernetesTab] = useState<KubernetesTab>('overview');
  const [tabStates, setTabStates] = useState<Record<string, {
    apmTab: APMTab;
    activeFilters: any;
    activeAction: string;
  }>>({
    'demo-8101': {
      apmTab: 'transaction',
      activeFilters: {},
      activeAction: ''
    }
  });

  const currentTabState = tabStates[activeAppTabId] || {
    apmTab: 'transaction',
    activeFilters: {},
    activeAction: ''
  };

  const handleOpenApp = (appId: string, appName: string) => {
    // Check if tab already exists
    const existingTab = appTabs.find(t => t.appId === appId && !t.isOverview);
    if (existingTab) {
      setActiveAppTabId(existingTab.id);
      return;
    }

    // Create new tab
    const newTab: AppTab = {
      id: `app-${appId}-${Date.now()}`,
      appId,
      appName
    };

    setAppTabs(prev => [...prev, newTab]);
    setTabStates(prev => ({
      ...prev,
      [newTab.id]: {
        apmTab: 'transaction',
        activeFilters: {},
        activeAction: ''
      }
    }));
    setActiveAppTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string) => {
    const tabIndex = appTabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const newTabs = appTabs.filter(t => t.id !== tabId);
    setAppTabs(newTabs);

    // Remove tab state
    const newTabStates = { ...tabStates };
    delete newTabStates[tabId];
    setTabStates(newTabStates);

    // Switch to nearest tab
    if (activeAppTabId === tabId) {
      if (tabIndex > 0) {
        setActiveAppTabId(newTabs[tabIndex - 1].id);
      } else if (newTabs.length > 0) {
        setActiveAppTabId(newTabs[0].id);
      } else {
        setActiveAppTabId('overview');
      }
    }
  };

  const handleOverviewClick = () => {
    // Show project list or do nothing
  };

  const handleAPMTabChange = (apmTab: APMTab) => {
    setTabStates(prev => ({
      ...prev,
      [activeAppTabId]: {
        ...prev[activeAppTabId],
        apmTab
      }
    }));
  };

  const handleNavigate = (tab: string, action: string) => {
    setTabStates(prev => ({
      ...prev,
      [activeAppTabId]: {
        ...prev[activeAppTabId],
        apmTab: tab as APMTab,
        activeAction: action
      }
    }));
  };

  const handleChartFilter = (filterType: string, value: string) => {
    setTabStates(prev => {
      const current = prev[activeAppTabId];
      const currentFilters = current.activeFilters[filterType] || [];

      return {
        ...prev,
        [activeAppTabId]: {
          ...current,
          activeFilters: {
            ...current.activeFilters,
            [filterType]: currentFilters.includes(value)
              ? currentFilters.filter((v: string) => v !== value)
              : [...currentFilters, value]
          }
        }
      };
    });
  };

  const isOverviewActive = false;
  const currentApp = appTabs.find(t => t.id === activeAppTabId);

  const handleKubernetesChange = (tab: KubernetesTab) => {
    setActiveSection('kubernetes');
    setKubernetesTab(tab);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - always show */}
      <Sidebar
        activeTab={activeSection === 'apm' ? currentTabState.apmTab : kubernetesTab}
        onTabChange={(tab) => {
          setActiveSection('apm');
          handleAPMTabChange(tab);
        }}
        onKubernetesChange={handleKubernetesChange}
        activeSection={activeSection}
      />

      {/* Contextual Sidebar per UX - only for APM */}
      {activeSection === 'apm' && (
        <ContextSidebar
          activeTab={currentTabState.apmTab}
          selectedProjectIds={projectSources}
          onProjectSelect={setProjectSources}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Compact Header with App Tabs - only for APM */}
        {activeSection === 'apm' && (
          <Header
            appTabs={appTabs}
            activeAppTabId={activeAppTabId}
            onTabChange={setActiveAppTabId}
            onTabClose={handleCloseTab}
            onOverviewClick={handleOverviewClick}
          />
        )}

        {/* Tab Bars */}
        {activeSection === 'apm' ? (
          <CompactTabBar
            activeTab={currentTabState.apmTab}
            onTabChange={handleAPMTabChange}
            isOverview={isOverviewActive}
          />
        ) : (
          <KubernetesTabBar
            activeTab={kubernetesTab}
            onTabChange={setKubernetesTab}
          />
        )}

        {/* Tab Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeSection === 'apm' ? (
            <>
              {currentTabState.apmTab === 'transaction' && (
                <TransactionTab
                  onNavigate={handleNavigate}
                  activeFilters={currentTabState.activeFilters}
                  onChartFilter={handleChartFilter}
                  projectSources={projectSources}
                />
              )}
              {currentTabState.apmTab === 'rum' && <RumTab />}
              {currentTabState.apmTab === 'was' && <WasTab />}
              {currentTabState.apmTab === 'analysis' && (
                <AnalysisTabRefactored
                  activeAction={currentTabState.activeAction}
                  onNavigate={handleNavigate}
                />
              )}
              {currentTabState.apmTab === 'topology' && (
                <TopologyTab
                  selectedApp={currentApp?.appId}
                  onOpenApp={handleOpenApp}
                />
              )}
              {currentTabState.apmTab === 'report' && <ReportTabRefactored />}
              {currentTabState.apmTab === 'config' && (
                <ConfigTab activeAction={currentTabState.activeAction} />
              )}
            </>
          ) : (
            <>
              {kubernetesTab === 'overview' && <KubernetesOverviewTab />}
              {kubernetesTab === 'cluster' && <ClusterTab />}
              {kubernetesTab === 'node' && <NodeTab />}
              {kubernetesTab === 'pod' && <PodTab />}
              {kubernetesTab === 'namespace' && <NamespaceTab />}
              {kubernetesTab === 'network' && <NetworkTab />}
              {kubernetesTab === 'storage' && <StorageTab />}
              {kubernetesTab === 'workloads' && <WorkloadsTab />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
