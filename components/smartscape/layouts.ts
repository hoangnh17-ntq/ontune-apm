import { Node, Edge } from 'reactflow';

// Helper to add nodes/edges deeply
const createK8sData = () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const layerYPositions: Record<string, number> = {};

    const addNode = (id: string, label: string, type: 'namespace' | 'service' | 'workload' | 'pod' | 'node', x: number, y: number, level: number, subLabel?: string, notifications?: number, technology?: string, vulnerability?: string) => {
        // Levels: 
        // 1: Node (Bottom)
        // 2: Pod
        // 3: Workload
        // 4: Service
        // 5: Namespace (Top)

        const yPos = level * -250;
        layerYPositions[type] = yPos;

        nodes.push({
            id,
            type: 'smartscape',
            position: { x: x * 200, y: yPos },
            data: {
                label,
                subLabel,
                type,
                status: notifications ? 'critical' : 'healthy',
                notificationCount: notifications,
                technology,
                vulnerability: vulnerability as any,
                showVulnerability: false
            }
        });
    };

    const addEdge = (source: string, target: string, color: string = '#555', dashed: boolean = false) => {
        edges.push({
            id: `e-${source}-${target}`,
            source,
            target,
            animated: !dashed,
            style: { stroke: color, strokeWidth: dashed ? 1 : 2, strokeDasharray: dashed ? '5 5' : undefined }
        });
    };

    // --- GENERATE K8S DATA ---

    // 1. Layer: NODES (Infrastructure)
    const nodeCount = 5;
    const k8sNodes = Array.from({ length: nodeCount }).map((_, i) => ({
        id: `node-${i}`,
        label: `worker-node-${i + 1}`,
        type: 'node'
    }));

    k8sNodes.forEach((n, i) => {
        addNode(n.id, n.label, 'node', i * 2.5, 0, 1, 'Ready', i === 2 ? 1 : 0, 'linux');
    });

    // 2. Layer: PODS & 3. WORKLOADS & 4. SERVICES (Application Logic)
    // Generate more dense graph
    const services = [
        { id: 'svc-auth', label: 'auth-service', tech: 'java' },
        { id: 'svc-pay', label: 'payment-gateway', tech: 'java' },
        { id: 'svc-ord', label: 'order-service', tech: 'java' },
        { id: 'svc-inv', label: 'inventory-service', tech: 'nodejs' },
        { id: 'svc-not', label: 'notification-service', tech: 'nodejs' },
        { id: 'svc-usr', label: 'user-profile', tech: 'python' },
        { id: 'svc-ana', label: 'analytics-worker', tech: 'python' },
        { id: 'svc-rep', label: 'reporting-api', tech: 'go' }
    ];

    let podIndex = 0;
    services.forEach((svc, i) => {
        // Add Service
        // Spread them out more given we have 8 now
        addNode(svc.id, svc.label, 'service', i * 2, 0, 4, 'ClusterIP', i === 0 ? 2 : 0, svc.tech);

        // Add Workload (Deploy)
        const workloadId = `deploy-${svc.id.split('-')[1]}`;
        addNode(workloadId, `${svc.label}-deploy`, 'workload', i * 2, 0, 3, 'Deployment', 0, 'k8s');
        addEdge(workloadId, svc.id, '#777', true);

        // Add Pods (Multiple per service for density)
        // Variable pod count (3 to 5)
        const podCount = Math.floor(Math.random() * 3) + 3;
        for (let j = 0; j < podCount; j++) {
            const podId = `pod-${svc.id.split('-')[1]}-${j}`;
            // Offset pods slightly around the workload X
            const podX = (i * 2) + ((j - (podCount - 1) / 2) * 0.5);

            // Randomly assign error status and vulnerability
            const hasIssue = Math.random() > 0.9;
            const vulnChance = Math.random();
            let vuln = 'none';
            if (vulnChance > 0.9) vuln = 'critical';
            else if (vulnChance > 0.8) vuln = 'high';
            else if (vulnChance > 0.7) vuln = 'medium';

            addNode(podId, `${svc.label}-${Math.floor(Math.random() * 1000)}`, 'pod', podX, 0, 2, 'Running', hasIssue ? 1 : 0, 'docker', vuln);

            addEdge(podId, workloadId, '#555', false);

            // Link Pod to Node (Infrastructure Distribution)
            const targetNode = k8sNodes[Math.floor(Math.random() * k8sNodes.length)];
            addEdge(targetNode.id, podId, '#333', true);
        }
    });

    // Inter-service Dependencies (Mesh)
    addEdge('svc-web', 'svc-gate', '#aaa');
    addEdge('svc-gate', 'svc-auth', '#aaa');
    addEdge('svc-gate', 'svc-rec', '#aaa');
    addEdge('svc-gate', 'svc-pay', '#aaa');
    addEdge('svc-gate', 'svc-cart', '#aaa');
    addEdge('svc-pay', 'svc-inv', '#aaa');
    addEdge('svc-pay', 'svc-usr', '#aaa');
    addEdge('svc-cart', 'svc-inv', '#aaa');
    addEdge('svc-rec', 'svc-inv', '#aaa');

    // 5. Layer: NAMESPACES (Logical grouping)
    addNode('ns-default', 'default', 'namespace', 4, 0, 5, 'Active', 0, 'azure');
    addNode('ns-system', 'kube-system', 'namespace', 10, 0, 5, 'System', 0, 'linux');

    // 6. Layer: EXTERNAL (DB, Cloud, 3rd Party) - Slide 3.5/4
    const externals = [
        { id: 'ext-rds', label: 'AWS RDS Postgre', icon: 'aws' },
        { id: 'ext-kafka', label: 'Kafka Cluster', icon: 'linux' },
        { id: 'ext-stripe', label: 'Stripe API', icon: 'confluence' },
        { id: 'ext-redis', label: 'Redis Cache', icon: 'redis' },
        { id: 'ext-s3', label: 'AWS S3 Assets', icon: 'aws' }

    ];

    externals.forEach((e, i) => {
        // Place externals at the very top (Level 6), spread out
        addNode(e.id, e.label, 'external', (i * 3) + 1, -2, 6, 'External', 0, e.icon);
    });

    // Connect Pods/Services to External
    addEdge('pod-pay-0', 'ext-stripe', '#00a6fb', true);
    addEdge('pod-inv-1', 'ext-rds', '#00a6fb', true);
    addEdge('pod-rec-0', 'ext-kafka', '#00a6fb', true);
    addEdge('pod-cart-0', 'ext-redis', '#00a6fb', true);
    addEdge('svc-web', 'ext-s3', '#00a6fb', true);

    // Connect everything from 'default' namespace
    services.forEach(s => {
        addEdge('ns-default', s.id, '#666', true);
    });

    return { nodes, edges, layerYPositions };
};

export const generateVerticalStackLayout = () => {
    // Use the K8s Data generator
    return createK8sData();
};

// "Cluster / Mesh" Layout (For Pod/Node Views)
export const generateStarLayout = (centerType: string) => {
    // If it's not pod or node, return vertical for safety
    if (centerType !== 'pod' && centerType !== 'node') return generateVerticalStackLayout();

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const clusterCount = centerType === 'pod' ? 3 : 1;

    const createCluster = (centerX: number, centerY: number, clusterIdx: number) => {
        const centerId = `cluster-${clusterIdx}-center`;
        const centerTech = centerType === 'node' ? 'linux' : 'java';
        nodes.push({
            id: centerId,
            type: 'smartscape',
            position: { x: centerX, y: centerY },
            data: {
                label: centerType === 'node' ? `Master Node ${clusterIdx}` : `Core Pod ${clusterIdx}`,
                type: centerType,
                subLabel: 'Cluster Core',
                status: 'healthy',
                technology: centerTech,
                showVulnerability: false
            }
        });

        const r1Count = centerType === 'pod' ? 12 : 8;
        const r1Radius = 300;
        for (let i = 0; i < r1Count; i++) {
            const angle = (i / r1Count) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * r1Radius;
            const y = centerY + Math.sin(angle) * r1Radius;
            const id = `c${clusterIdx}-r1-${i}`;
            const type = centerType === 'node' ? 'pod' : 'service';

            nodes.push({
                id, type: 'smartscape', position: { x, y },
                data: { label: `${type} ${i}`, type, technology: 'java', showVulnerability: false }
            });

            edges.push({
                id: `e-${centerId}-${id}`, source: centerId, target: id, animated: true,
                style: { stroke: '#555', strokeWidth: 1.5 }
            });
        }
    };

    if (centerType === 'pod') {
        createCluster(0, 0, 1);
        createCluster(1800, 400, 2);
    } else {
        createCluster(0, 0, 1);
    }

    return { nodes, edges };
};
