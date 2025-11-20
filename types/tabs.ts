// Tab type definitions

export interface AppTab {
  id: string; // Unique ID for the tab (e.g., 'overview' or 'app-<appId>')
  appId: string; // The actual application ID
  appName: string; // Display name for the tab
  isOverview?: boolean;
}

