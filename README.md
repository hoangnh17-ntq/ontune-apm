# onTune APM - Application Performance Monitoring

Modern, full-featured APM dashboard built with Next.js 15, TypeScript, Tailwind CSS, and Shadcn/UI.

## ✨ Features

### 🎨 UI/UX
- ✅ **Logo in Sidebar**: Logo moved to top-left of sidebar navigation
- ✅ **Dark Theme**: Beautiful dark mode with consistent Shadcn theming
- ✅ **Responsive Layout**: Header, Sidebar, and Tab Navigation

### 📊 Monitor Tab (Real-time Monitoring)
- ✅ **Active Transaction Speed Chart**: Stacked area chart với 4 layers (Normal, Slow, Very Slow, Error) với gradient animations
- ✅ **Hitmap (ApexCharts)**: Scatter plot với color-coded dots cho response time distribution
- ✅ **Transaction List Table**: 
  - Full pagination (First, Previous, Next, Last)
  - Items per page selector (10, 20, 50, 100)
  - Search & filter functionality
  - Context menu on row click
- ✅ **Active Transaction Donut (ApexCharts)**: Multi-layer donut chart với center total count
- ✅ **Metric Cards**: Total Transactions, Active Transactions, Avg Response Time, Error Rate
- ✅ **TPS Chart (Recharts)**: Line chart với area fill
- ✅ **System Metrics**: 
  - Apdex Gauge (ApexCharts radial bar)
  - System CPU (Recharts area chart)
  - Heap Memory (Recharts area chart)
- ✅ **Real-time Updates**: Auto-refresh every 2 seconds

### 🔍 Analysis Tab
- ✅ Advanced Query Builder
- ✅ Filter Panel với multi-criteria
- ✅ Transaction List với pagination
- ✅ Bullet View Waterfall placeholder
- ✅ Worker/Thread State Monitor
- ✅ JVM Metrics Panel
- ✅ DB Transaction Table

### 📋 Report Tab
- ✅ Issue Dashboard với severity badges
- ✅ Affected transactions count
- ✅ Metrics display
- ✅ Suggested actions
- ✅ Navigation buttons

### ⚙️ Config Tab
- ✅ Agent Profile display
- ✅ ASM Configuration panel
- ✅ Decompile Settings
- ✅ Tracing options

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.6
- **React**: 18.3.1
- **TypeScript**: 5.7.2
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Shadcn/UI (Radix UI)
- **Charts**: 
  - **Recharts** 2.13.3 (Area, Line charts)
  - **ApexCharts** 5.3.5 (Scatter, Donut, Radial Bar)
  - **react-apexcharts** 1.8.0

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 🎯 Project Structure

```
ontune-apm/
├── app/
│   ├── globals.css          # Shadcn theme variables
│   ├── layout.tsx
│   └── page.tsx             # Main app with 4 tabs
├── components/
│   ├── ui/                  # 8 Shadcn components
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── ContextMenu.tsx
│   │   ├── input.tsx
│   │   ├── scroll-area.tsx
│   │   └── separator.tsx
│   ├── layout/
│   │   ├── Header.tsx       # Top bar với LIVE status
│   │   ├── Sidebar.tsx      # Navigation với logo
│   │   └── TabNavigation.tsx
│   ├── tabs/
│   │   ├── MonitorTab.tsx   # ✅ Full featured
│   │   ├── AnalysisTab.tsx
│   │   ├── ReportTab.tsx
│   │   └── ConfigTab.tsx
│   ├── widgets/
│   │   ├── MetricCard.tsx
│   │   ├── ActiveStatusTable.tsx
│   │   └── TransactionListTable.tsx  # ✅ With pagination
│   └── charts/
│       ├── ActiveTransactionSpeedChart.tsx  # ✅ Stacked area
│       ├── HitmapScatterPlot.tsx            # ✅ ApexCharts scatter
│       ├── TransactionDonutChart.tsx        # ✅ ApexCharts donut
│       ├── TPSChart.tsx                     # ✅ Recharts area
│       ├── SystemMetricChart.tsx            # ✅ Recharts area
│       └── ApdexGauge.tsx                   # ✅ ApexCharts radial
├── types/
│   └── apm.ts               # Full type definitions
├── lib/
│   ├── utils.ts             # Utility functions
│   └── mockData.ts          # Mock data generators
└── [Config files]
```

## 🎨 Charts Implementation

### 1. Active Transaction Speed Chart (Stacked Area - Recharts)
- 4 layers: Normal (green), Slow (orange), Very Slow (red), Error (purple)
- Gradient fills với animations
- Custom tooltip
- Click to open context menu

### 2. Hitmap (Scatter Plot - ApexCharts)
- Color-coded dots: Blue (normal/fast), Orange (slow), Red (very slow), Purple (error)
- Interactive zoom
- Click dot to view transaction details
- Responsive design

### 3. Active Transaction Donut (ApexCharts)
- Multi-layer donut chart
- Center text showing total count
- Legend với breakdown by METHOD
- Color-coded by transaction type

### 4. TPS Chart (Area Chart - Recharts)
- Line chart với area fill
- Current and average TPS display
- Smooth animations

### 5. System Metrics (Area Charts - Recharts)
- System CPU và Heap Memory
- Real-time data updates
- Custom gradients

### 6. Apdex Gauge (Radial Bar - ApexCharts)
- Semi-circular gauge
- Color-coded: Green (Excellent), Yellow (Good), Red (Poor)
- Dynamic status label

## 📊 Transaction List Features

### Pagination
- First, Previous, Next, Last navigation
- Page numbers với smart display (shows 5 pages)
- Current page highlighting

### Items Per Page
- Selectable: 10, 20, 50, 100 items
- Resets to page 1 on change

### Search & Filter
- Search by endpoint, trace ID, or agent
- Filter by status (All, Fast, Normal, Slow, Very Slow, Error)
- Real-time filtering

### Context Menu
- 9 actions: View Details, Call Stack, Timeline, SQL, Java Source, Agent Details, Session History, Similar Transactions, Create Alert
- Click any row to open menu
- Descriptions showing target tab

## 🔧 Configuration

### Shadcn Theme
Dark theme với HSL color variables trong `app/globals.css`:
- Background: `222.2 84% 4.9%`
- Foreground: `210 40% 98%`
- Primary, Secondary, Accent, etc.

### Real-time Updates
Monitor Tab auto-refreshes every 2 seconds:
- New transactions added
- Active status updated
- Metrics refreshed
- Charts animated

## 📝 Development Notes

### ApexCharts Integration
- Import ApexCharts dynamically: `dynamic(() => import('react-apexcharts'), { ssr: false })`
- Check `mounted` state before rendering
- Custom tooltips và event handlers

### Recharts Integration
- Use ResponsiveContainer for responsive charts
- Custom gradients với `<defs>` element
- CartesianGrid for better visibility

## 🚀 Build Status

✅ **Build successful**: 0 errors, 0 warnings  
📦 **Bundle size**: 238 kB (First Load JS)  
⚡ **Dev server**: http://localhost:3000

## 📸 Screenshots

See the main dashboard with:
- Logo in sidebar (top-left)
- Full-featured charts với animations
- Transaction list với pagination
- Real-time updates

## 🎯 Next Steps

- Add more chart types (Gantt, Timeline)
- Implement WebSocket for true real-time updates
- Add data export functionality
- Enhanced filtering options
- Custom date range picker

---

**Built with ❤️ using Next.js, TypeScript, and Shadcn/UI**

