# Kubernetes Integration Documentation

## Tổng quan

Kubernetes Monitor đã được tích hợp hoàn toàn vào hệ thống APM hiện tại. Người dùng có thể chuyển đổi giữa APM và Kubernetes thông qua sidebar navigation.

## Cấu trúc Files đã tạo

### Types
```
types/kubernetes.ts - Định nghĩa tất cả types cho Kubernetes
```

### Components

#### Shared Components
```
components/kubernetes/
├── ClusterSummaryCard.tsx        - Card tổng quan cluster với error/warning indicators
├── ClusterMetricsChart.tsx       - Biểu đồ metrics theo thời gian (CPU/Memory/Pods)
├── Top5RankingWidget.tsx         - Hiển thị top 5 resources với ranking bars
├── StatusVisualization.tsx       - Trạng thái nodes/pods dạng visual (hexagons/circles)
└── KubernetesTabBar.tsx          - Tab navigation cho Kubernetes
```

#### Tab Components
```
components/kubernetes/tabs/
├── OverviewTab.tsx      - Dashboard tổng quan với summary cards & charts
├── ClusterTab.tsx       - Quản lý clusters với metrics và status
├── NodeTab.tsx          - Quản lý nodes với CPU/Memory/Pod count
├── PodTab.tsx           - Quản lý pods với table view và filtering
├── NamespaceTab.tsx     - Quản lý namespaces với resource counts
├── NetworkTab.tsx       - Services và Ingresses management
├── StorageTab.tsx       - Persistent Volumes và PVCs
└── WorkloadsTab.tsx     - Deployments, StatefulSets, DaemonSets
```

### Main Integration
```
app/page.tsx             - Main page với APM và Kubernetes integration
components/layout/Sidebar.tsx - Cập nhật để support Kubernetes
```

## Tính năng của từng Tab

### 1. Overview Tab
- **Chức năng**: Dashboard tổng quan về toàn bộ K8s environment
- **Components**:
  - Cluster Summary Cards (6 clusters, nodes, pods, namespaces)
  - Cluster CPU/Memory charts
  - Top 5 nodes by CPU usage
  - Node status visualization (hexagon layout)
- **Data hiển thị**: Tổng quan về tất cả resources với error/warning counts

### 2. Cluster Tab
- **Chức năng**: Quản lý và monitor clusters
- **Features**:
  - Grid view các clusters với status indicators
  - CPU/Memory usage bars
  - Pod và Node counts
  - Search và filter clusters
  - Cluster performance metrics chart
- **Data hiển thị**: 
  - Cluster name, version, status
  - Resource usage (CPU, Memory)
  - Node count, Pod count, Namespace count

### 3. Node Tab
- **Chức năng**: Quản lý và monitor nodes
- **Features**:
  - Detailed node information cards
  - CPU/Memory usage với capacity
  - Pod count per node
  - Node conditions (Ready, DiskPressure, MemoryPressure)
  - OS và Container Runtime info
- **Data hiển thị**:
  - Node name, cluster, role (master/worker)
  - Resource usage và capacity
  - Running pod count
  - Health conditions

### 4. Pod Tab
- **Chức năng**: Quản lý và monitor pods
- **Features**:
  - Table view với sorting và filtering
  - Status filter (All, Running, Error, Pending, Warning)
  - Restart count với warning indicators
  - CPU/Memory usage
  - Quick actions (Logs, Exec, Delete)
- **Data hiển thị**:
  - Pod name, namespace, node
  - Container image
  - Status, phase, restart count
  - Resource usage
  - Age

### 5. Namespace Tab
- **Chức năng**: Quản lý namespaces và resources
- **Features**:
  - Card view với resource counts
  - Pod, Service, Deployment counts per namespace
  - Status indicators
- **Data hiển thị**:
  - Namespace name và status
  - Resource counts (Pods, Services, Deployments)

### 6. Network Tab
- **Chức năng**: Quản lý Services và Ingresses
- **Features**:
  - Services table với type, IPs, ports
  - Ingresses table với hosts và rules
- **Data hiển thị**:
  - Services: Name, Type, Cluster-IP, External-IP, Ports
  - Ingresses: Name, Class, Hosts

### 7. Storage Tab
- **Chức năng**: Quản lý Persistent Volumes và Claims
- **Features**:
  - PV table với capacity và status
  - PVC table với bindings
  - Storage class information
- **Data hiển thị**:
  - PVs: Name, Capacity, Storage Class, Status, Claim
  - PVCs: Name, Namespace, Status, Volume, Capacity

### 8. Workloads Tab
- **Chức năng**: Quản lý Deployments, StatefulSets, DaemonSets
- **Features**:
  - Separate tables cho từng workload type
  - Replica counts và status
  - Image information
- **Data hiển thị**:
  - Deployments: Name, Namespace, Replicas, Image, Status
  - StatefulSets: Tương tự Deployments
  - DaemonSets: Desired/Current/Ready counts

## Cách sử dụng

### 1. Truy cập Kubernetes
```tsx
// Tại sidebar, click vào "Kubernetes"
// Sau đó chọn submenu "Monitor"
// Hệ thống sẽ chuyển sang Kubernetes section
```

### 2. Navigation giữa các tabs
```tsx
// Sử dụng tab bar phía trên để chuyển đổi:
// Overview | Cluster | Node | Pod | Namespace | Network | Storage | Workloads
```

### 3. Chuyển về APM
```tsx
// Click vào "APM" trong sidebar
// Sau đó chọn submenu "Monitor" hoặc các option khác
```

## State Management

### Active Section
```tsx
const [activeSection, setActiveSection] = useState<'apm' | 'kubernetes'>('apm');
```

### Kubernetes Tab
```tsx
const [kubernetesTab, setKubernetesTab] = useState<KubernetesTab>('overview');
```

### Sidebar Integration
```tsx
<Sidebar
  activeTab={activeSection === 'apm' ? currentTabState.apmTab : kubernetesTab}
  onTabChange={(tab) => {
    setActiveSection('apm');
    handleAPMTabChange(tab);
  }}
  onKubernetesChange={(tab) => {
    setActiveSection('kubernetes');
    setKubernetesTab(tab);
  }}
  activeSection={activeSection}
/>
```

## Design System

### Colors
- **Running/Healthy**: `bg-green-500/20 text-green-500`
- **Error/Critical**: `bg-red-500/20 text-red-500`
- **Warning**: `bg-yellow-500/20 text-yellow-500`
- **Pending**: `bg-blue-500/20 text-blue-500`
- **Offline**: `bg-gray-500/20 text-gray-500`

### Icons
- Cluster: `Boxes`
- Node: `Server`
- Pod: `Package`
- Namespace: `FolderTree`
- Network: `Network`
- Storage: `HardDrive`
- Workloads: `Layers`

### Charts
- CPU Usage: Blue gradient (`from-blue-500 to-blue-400`)
- Memory Usage: Purple gradient (`from-purple-500 to-purple-400`)
- Multi-cluster: Assigned colors per cluster

## Mock Data

Tất cả các tabs đều sử dụng mock data realistic để demo. Data bao gồm:
- 4-6 clusters với various statuses
- 3-8 nodes per cluster
- Multiple pods với different phases
- Namespaces với resource counts
- Services, Ingresses, PVs, PVCs
- Deployments, StatefulSets, DaemonSets

## Future Enhancements

1. **Real API Integration**
   - Connect to Kubernetes API server
   - Real-time data updates via WebSocket

2. **Advanced Filtering**
   - Multi-column filtering
   - Save filter presets
   - Advanced search queries

3. **Drill-down Views**
   - Click on cluster → view all nodes
   - Click on node → view all pods
   - Click on pod → view logs/events

4. **Actions**
   - Scale deployments
   - Restart pods
   - View logs in modal
   - Shell access to containers

5. **Monitoring**
   - Real-time metrics charts
   - Alert rules configuration
   - Event history timeline

6. **YAML Editor**
   - View/edit resource YAML
   - Apply configuration changes
   - Validation before apply

## Testing

### Dev Server
```bash
npm run dev
```

### Access Application
```
http://localhost:3000
```

### Navigate to Kubernetes
1. Click "Kubernetes" in sidebar
2. Click "Monitor" submenu
3. Select desired tab from tab bar

## Troubleshooting

### Components not rendering
- Check all imports are correct
- Verify types are properly defined
- Ensure mock data structure matches types

### Navigation not working
- Verify activeSection state is updating
- Check onTabChange handlers
- Ensure sidebar submenu clicks trigger correct handlers

### Charts not displaying
- Verify Recharts is installed
- Check data format matches chart requirements
- Ensure timeLabels and data arrays have same length
