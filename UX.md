
## Layout
Ontune APM sẽ có 4 tabs (Transaction, RUM, WAS, Webserver)
Project là khái niệm bao trùm lên: Website, WAS, Webserver
Ontune sẽ có 1 side bar: 
- Tại tab transaction: hiển thị tại các project
- Tại tab RUM: Hiển thị các website group theo project
- Tại tab WAS: Hiển thị các Java Web Application Server group theo project
- Tại tab Webserver: Hiển thị các Webserver group theo project

## Tab transaction 

### Layout 
- Hiển thị các chỉ số cơ bản: TPS, Apdex Score, Average Response Time, Error Rate...
- Hiển thị danh sách các project
- Hiển thị Active Transaction Speed Chart
- Hiển thị transaction X-View: Scatter plot displays each transaction as a data point. Detects outliers (abnormal transactions with high latency).
- Hiển thị danh sách transaction 

### Hành vi

#### Project Detail 
Trigger: Khi nhấp chuột phải vào 1 project chọn project detail
Mong muốn: Hiển thị 1 slider bên phải cho màn hình project detail 
Components:
- Các thông tin cơ bản về project: Số lượng Website, WAS, Webserver, TPS, Apdex Score, Average Response Time, Error Rate...
- Service Map Topology: topology thể hiện sự liên kết giữa các Website - Webserver - WAS
- Danh sách transaction 
Hành vi:
- Khi chon 1 transaction và xem detail đi đến màn hình transaction detail

#### Transaction Detail 
Trigger: Khi người dùng nhấp chuột phải chọn transaction detail 
Mong Muốn: Hiển thị 1 slider bên phải cho màn hình transaction detail 
Components: 
- Information: hiển thị các thông tin cơ bản về transaction 
- Performance: Hiển thị tổng response time và total spans 
- Topology Map: Hiển thị topology map của transaction 
- Distributed Trace: Hiển thị các span xuyên suốt từ Website đến Webserver đến WAS và các lệnh call database 
- Khi người dùng chon vào 1 span detail: hiển thị các thông tin liên quan đến span đó

#### Span detail
Trường hợp Span DB Call: phải hiển thị thông tin và metrics liên quan đến query
Trường hợp Span gặp 1 lỗi java exception: Hiển thị thông tin về Decompiled Source Code và Source code compare với các phiên bản khác

## Tab RUM

### Layout
- Side bar hiển thị danh sách Website group theo Project (dữ liệu lấy từ RUM JavaScript Snippet) với trạng thái health, error rate, session count.
- Khối Overview thể hiện các chỉ số tải trang chính: DOMContentLoaded, LoadEventEnd, Page Load Time, Resource Load Times.
- Widget theo dõi JavaScript Errors, HTTP Errors theo thời gian; bảng Resource Load để xem chi tiết tệp bị chậm.
- Bản đồ Geographic Performance hiển thị màu theo vùng/địa lý; biểu đồ Pie cho Browser, Device, Operating System.
- Session Timeline cho phép chọn khoảng thời gian; bảng Session Count hiển thị lượng session, FID, INP.

### Hành vi

#### Website Detail
Trigger: chọn website từ side bar hoặc click vào bản đồ khu vực.
Mong muốn: Hiển thị slider bên phải với số liệu chi tiết website.
Components:
- Cards tổng hợp: Page Load Time, DOMContentLoaded, Session Count, tỷ lệ JS/HTTP Errors.
- Biểu đồ chi tiết: Resource Load Times, First Input Delay, Interaction to Next Paint.
- Breakdown Browser/Device/OS dạng pie chart.
- Bảng sự kiện: danh sách JavaScript Errors và HTTP Errors gần nhất.
Hành vi:
- Cho phép filter theo vùng hoặc thiết bị để cập nhật tất cả widget.
- Click 1 session mở Session Detail với full trace hành vi.

#### Session Detail
Trigger: chọn 1 dòng trong bảng Session hoặc map.
Mong muốn: slider mô tả lộ trình người dùng và sự kiện.
Components:
- Timeline hiển thị event (DOMContentLoaded, First Input, API call) và thời lượng.
- Chi tiết thiết bị, trình duyệt, địa lý.
- Logs lỗi, network request thất bại.
Hành vi:
- Chọn event sẽ highlight resource tương ứng; có thể quay lại Website Detail giữ nguyên bộ lọc.

## Tab WAS

### Layout
- Side bar hiển thị danh sách WAS group theo Project với trạng thái health.
- Dashboard monitor Application Response Time, Average Response Time, P95/P99 Latency, TPS, Throughput.
- Widget JVM: CPU Utilization, Memory/Available Memory, Thread Monitoring, Garbage Collection.
- Bảng Error Logging, Session Management, Middleware Specific Metrics/IaaS resource usage.
- Service Topology Map và X-View scatter plot cho transaction outlier trong phạm vi WAS agent.
- Distributed Trace (Bullet View) + Transaction Trace cho phép drill-down.

### Hành vi

#### WAS Detail
Trigger: click phải vào 1 WAS node hoặc chọn từ side bar.
Mong muốn: hiển thị slider chi tiết server/app.
Components:
- Thẻ chỉ số: Application Health Monitoring, Error Rate, Peak Load, Session waits.
- Charts: P95/P99 latency, Transaction Rate, Throughput, Thread Monitoring, GC Monitoring.
- Bảng Heap & Thread Dump Analysis, Middleware Specific Metrics (thread pools, JDBC connections).
- Panel Resource: CPU, Memory, Disk Read/Write, Free Disk.
Hành vi:
- Chọn transaction trong X-View → mở Transaction Detail (tương tự tab Transaction nhưng scope theo WAS).
- Mở Heap/Thread dump → tải dữ liệu mới, liên kết tới Span tracing system khi khả dụng.

#### WAS Alert & Diagnostics
Trigger: khi Error Rate, GC pause hoặc Thread pool saturation vượt ngưỡng.
Components: danh sách cảnh báo, liên kết đến Distributed Trace, Loging Integration.
Hành vi: acknowledge cảnh báo, tạo ticket, bật auto-collection (Heap dump, Thread dump).

## Tab Webserver

### Layout
- Side bar hiển thị các Webserver agent theo Project với trạng thái hoạt động.
- Dashboard Request Rate, Throughput, Session Metrics, Connection Metrics, Traffic Analysis.
- Biểu đồ Error Rate, HTTP Response code Analysis, P95/P99 latency, Response Time.
- Gauges cho Uptime Monitoring, CPU Utilization, Memory, Available Memory.
- Widgets hệ thống: Disk Read/Write, Free Disk, Active/Idle connections.

### Hành vi

#### Webserver Detail
Trigger: click vào 1 Webserver trong side bar hoặc chart legend.
Mong muốn: slider hiển thị tình trạng agent/server.
Components:
- Cards: Uptime %, Current Request Rate, Error Rate, Latency.
- Chart: Response Time vs Throughput, Traffic Analysis (ngày/giờ), HTTP response code stacked bar.
- Bảng Session/Connection metrics, Active vs Idle, Connection wait time.
- Log preview: access/error logs, top URLs.
Hành vi:
- Cho phép so sánh 2 server bằng cách multi-select → chart overlay.
- Click vào HTTP code segment mở danh sách request chi tiết.

#### Capacity & Resource Drill-down
Trigger: chọn gauge CPU/Memory hoặc Disk alerts.
Components: trend CPU Utilization, Memory, Available Memory, Disk Read/Write, Free Disk.
Hành vi: tạo cảnh báo hoặc khởi chạy playbook (scale, restart). Khi click metric → filter traffic/time range đồng bộ với các biểu đồ khác.

