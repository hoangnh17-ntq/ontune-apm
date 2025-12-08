# Kubernetes Monitor Demo

This demo replicates the Kubernetes monitoring interface from onTune V5 (https://teemstone-lab.github.io/onTuneV5).

## Components Created

### 1. ClusterSummaryCard (`components/kubernetes/ClusterSummaryCard.tsx`)
- Displays cluster metrics summary (count, errors, warnings)
- Features gradient backgrounds and hover effects
- Shows error/warning indicators with icons
- Supports custom tags for resource categorization
- Interactive with click handlers

### 2. Top5RankingWidget (`components/kubernetes/Top5RankingWidget.tsx`)
- Shows top 5 nodes/pods by CPU or memory usage
- Features animated horizontal bar charts
- Color-coded rankings (red→orange→yellow→blue→green)
- Displays percentage values with precision

### 3. StatusVisualization (`components/kubernetes/StatusVisualization.tsx`)
- Visual representation of node/pod statuses
- Hexagonal shapes for nodes, circles for pods
- Color-coded status indicators:
  - Blue: Running
  - Red: Error
  - Yellow: Warning
  - Gray: Offline
- Includes search functionality
- Shows status legend

### 4. ClusterMetricsChart (`components/kubernetes/ClusterMetricsChart.tsx`)
- Line charts for CPU, Memory, and Pod metrics over time
- Multiple cluster comparison
- Tabbed interface (Usage % vs Availability %)
- Interactive legend with toggle functionality
- Statistics table showing Avg, Min, Max, and Current values
- Export and refresh controls

### 5. Main Page (`app/kubernetes/page.tsx`)
- Complete Kubernetes monitoring dashboard
- Responsive grid layout
- Organized sections:
  - Cluster Summary (7 metric cards)
  - CPU metrics (chart + Top 5 + status)
  - Memory metrics (chart + Top 5 + status)
  - Pod metrics (full-width chart)

## Design System Alignment

The components follow the existing design system:
- **Colors**: Uses CSS variables from `globals.css` for consistent theming
- **Components**: Built with shadcn/ui components (Card, Button, etc.)
- **Charts**: Uses Recharts library (already installed)
- **Typography**: Consistent with existing font scales
- **Spacing**: Follows Tailwind spacing conventions
- **Dark Theme**: Fully supports dark mode with proper color schemes

## Features Implemented

1. **Interactive Cards**: Click-to-navigate cluster summary cards
2. **Real-time Metrics**: Simulated real-time data updates
3. **Status Visualization**: Visual node and pod status indicators
4. **Top Rankings**: Ranked lists with visual bars
5. **Time Series Charts**: Multi-cluster comparison charts
6. **Responsive Design**: Works on various screen sizes
7. **Hover Effects**: Enhanced UX with hover states
8. **Error Indicators**: Clear visual indicators for errors and warnings

## Access the Demo

Navigate to: `http://localhost:3000/kubernetes`

## Tab Navigation

The page includes tabs for:
- Overview (current)
- Cluster
- Node
- Pod
- Namespace
- Network
- Storage
- Workloads

## Mock Data

The demo uses realistic mock data that simulates:
- 6 clusters (2 with errors)
- 8 nodes (3 with errors)
- 386 pods (102 with errors)
- 21 namespaces
- 45 workloads (13 with errors)
- Time-series metrics for CPU, Memory, and Pod usage

## Future Enhancements

To make this production-ready, consider:
1. Connect to real Kubernetes API
2. Implement WebSocket for real-time updates
3. Add drill-down views for each tab
4. Implement filtering and search
5. Add alerting and notification system
6. Export functionality for charts
7. Custom date range selection
8. More detailed resource views
