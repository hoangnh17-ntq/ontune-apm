import { Node, Edge } from 'reactflow';

// Standard Vertical Stack Layout (The one we have)
export const generateVerticalStackLayout = () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const LAYER_HEIGHT = 280;
    const NODE_WIDTH = 220;

    const layerYPositions: Record<string, number> = {
        'application': 0,
        'service': LAYER_HEIGHT * 1 + 100,
        'process': LAYER_HEIGHT * 2 + 100,
        'host': LAYER_HEIGHT * 3 + 100,
        'datacenter': LAYER_HEIGHT * 4 + 100,
    };

    const addNode = (id: string, label: string, type: string, layerIndex: number, colIndex: number, totalCols: number, subLabel?: string, notifCount?: number, tech?: string, vulnerability?: 'critical' | 'high' | 'medium' | 'low') => {
        const x = (colIndex - (totalCols - 1) / 2) * (NODE_WIDTH + 80);
        const y = layerIndex * LAYER_HEIGHT + 100;
        nodes.push({
            id, type: 'smartscape', position: { x, y },
            data: { label, type, subLabel, notificationCount: notifCount, technology: tech, vulnerability }
        });
    };

    const addEdge = (source: string, target: string, color: string = '#555', dashed: boolean = false) => {
        edges.push({
            id: `e-${source}-${target}`, source, target, animated: !dashed,
            type: 'default',
            style: {
                stroke: color,
                strokeWidth: 2,
                strokeOpacity: dashed ? 0.3 : 0.6,
                strokeDasharray: dashed ? '5 5' : '0'
            }
        });
    };

    // --- RECREATE DATA (Simplified for brevity, similar to previous) ---
    // 1. DC Layer - Multiple Datacenters
    addNode('dc-1', 'AWS us-east-1', 'datacenter', 4, -1.5, 3, 'Region', 0, 'aws');
    addNode('dc-2', 'Azure East US', 'datacenter', 4, 0, 3, 'Region', 0, 'azure');
    addNode('dc-3', 'On-Premise DC', 'datacenter', 4, 1.5, 3, 'Hanoi', 0, 'linux');

    // Hosts - Distributed across DCs
    const hosts = ['host-1', 'host-2', 'host-3', 'host-4', 'host-5'];
    hosts.forEach((h, i) => {
        const isLinux = i % 2 === 0;
        addNode(h, `Worker ${i + 1}`, 'host', 3, i - 2, 5, isLinux ? 'Linux' : 'Windows', i === 2 ? 2 : 0, isLinux ? 'linux' : 'windows');

        // Connect to different DCs based on index
        if (i < 2) addEdge(h, 'dc-1', '#ffa400'); // AWS
        else if (i < 4) addEdge(h, 'dc-2', '#0078d4'); // Azure
        else addEdge(h, 'dc-3', '#555'); // On-prem
    });

    // Processes (Crowded)
    const procs = Array.from({ length: 8 }, (_, i) => `proc-${i}`);
    procs.forEach((p, i) => {
        // Randomly assign to host
        const dims = Math.floor(i / 2) - 1.5;
        const isCritical = i === 2; // Simulate a critical process
        // Simulate Vulnerabilities: 0=Critical, 1=High, 3=Medium
        let vul: 'critical' | 'high' | 'medium' | 'low' | undefined = undefined;
        if (i === 0) vul = 'critical';
        if (i === 1) vul = 'high';
        if (i === 3) vul = 'medium';
        if (i === 5) vul = 'low';

        addNode(p, `Process ${i}`, 'process', 2, dims, 4, isCritical ? 'CrashLoopBackOff' : 'Running', isCritical ? 99 : 0, 'java', vul);

        // Critical path is RED
        addEdge(p, hosts[i % hosts.length], isCritical ? '#ef4444' : '#9355b7');
    });

    // Services
    addNode('svc-1', 'Frontend Svc', 'service', 1, -1, 2, 'LoadBalancer', 0, 'nginx', 'high');
    addNode('svc-2', 'Backend Svc', 'service', 1, 1, 2, 'ClusterIP');

    edges.push({ id: 'e-s1-p1', source: 'svc-1', target: 'proc-0', animated: true, style: { stroke: '#73be28' } });
    edges.push({ id: 'e-s2-p2', source: 'svc-2', target: 'proc-4', animated: true, style: { stroke: '#73be28' } });

    addNode('app-1', 'EasyShop', 'application', 0, -0.5, 2, 'Production', 0, 'confluence'); // Simulated Web
    addNode('app-mobile', 'Shop App IOS', 'application', 0, 0.5, 2, 'v2.0', 0, 'apple');

    addEdge('app-1', 'svc-1', '#00a6fb');
    addEdge('app-mobile', 'svc-1', '#00a6fb');

    // --- ISOLATED NODES (No Connections) ---
    // Simulating "Orphaned" or independent components found in screenshots
    addNode('iso-app-1', 'Internal Tool', 'application', 0, -2, 4, 'Legacy', 0, 'windows');
    addNode('iso-proc-1', 'Backup Job', 'process', 2, 2.5, 4, 'Scheduled', 0, 'linux');
    addNode('iso-host-x', 'Dev Box', 'host', 3, 2.5, 5, '192.168.x.x', 0, 'linux', 'low');

    return { nodes, edges, layerYPositions };
};


// "Cluster / Mesh" Layout (For Host/Process Views - imitating the complex screenshots)
export const generateStarLayout = (centerType: 'host' | 'process') => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Config based on type
    // Processes view has multiple large clusters (e.g. 2 big ones in screenshot)
    // Hosts view has one main cluster and scattered nodes
    const clusterCount = centerType === 'process' ? 3 : 1;

    // Helper to create a cluster
    const createCluster = (centerX: number, centerY: number, clusterIdx: number) => {
        // Central Node
        const centerId = `cluster-${clusterIdx}-center`;
        const centerTech = centerType === 'host' ? 'windows' : 'java';
        nodes.push({
            id: centerId,
            type: 'smartscape',
            position: { x: centerX, y: centerY },
            data: {
                label: centerType === 'host' ? `Master Host ${clusterIdx}` : `Main Proc ${clusterIdx}`,
                type: centerType,
                subLabel: 'Cluster Core',
                status: 'healthy',
                technology: centerTech,
                showVulnerability: false
            }
        });

        // Ring 1 (Dense Core)
        const r1Count = centerType === 'process' ? 12 : 16;
        const r1Radius = 300;
        for (let i = 0; i < r1Count; i++) {
            const angle = (i / r1Count) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * r1Radius;
            const y = centerY + Math.sin(angle) * r1Radius;
            const id = `c${clusterIdx}-r1-${i}`;
            const type = centerType === 'host' ? 'process' : 'service';

            nodes.push({
                id, type: 'smartscape', position: { x, y },
                data: { label: `${type} ${i}`, type, technology: i % 3 === 0 ? 'nginx' : 'linux', showVulnerability: false }
            });

            // Connect to center
            edges.push({
                id: `e-${centerId}-${id}`, source: centerId, target: id, animated: true,
                style: { stroke: '#555', strokeWidth: 1.5 }
            });

            // Cross connect neighbours (Web effect)
            if (Math.random() > 0.4) {
                const targetIdx = (i + 1) % r1Count;
                edges.push({
                    id: `e-${id}-n${targetIdx}`, source: id, target: `c${clusterIdx}-r1-${targetIdx}`,
                    animated: false, style: { stroke: '#333', strokeWidth: 0.5, strokeDasharray: '4 4' }
                });
            }
        }

        // Ring 2 (Messy Outer Web)
        const r2Count = centerType === 'process' ? 25 : 10;
        const r2Radius = 600;
        for (let i = 0; i < r2Count; i++) {
            const angle = (i / r2Count) * 2 * Math.PI + Math.random(); // Random offset
            const varRadius = r2Radius + (Math.random() * 200 - 100);
            const x = centerX + Math.cos(angle) * varRadius;
            const y = centerY + Math.sin(angle) * varRadius;
            const id = `c${clusterIdx}-r2-${i}`;
            const type = centerType === 'host' ? 'service' : 'process';

            // Random Vulnerabilities
            const vul = Math.random() > 0.85 ? (Math.random() > 0.5 ? 'high' : 'medium') : undefined;

            nodes.push({
                id, type: 'smartscape', position: { x, y },
                data: { label: `${type} ${i}`, type, vulnerability: vul as any, showVulnerability: false }
            });

            // Connect to random ring 1 nodes (Multiple parents sometimes)
            const parentIdx = Math.floor(Math.random() * r1Count);
            edges.push({
                id: `e-p${parentIdx}-${id}`, source: `c${clusterIdx}-r1-${parentIdx}`, target: id,
                animated: true, style: { stroke: '#444', strokeWidth: 1 }
            });

            // Chaos connections
            if (Math.random() > 0.7) {
                const rnd = Math.floor(Math.random() * r2Count);
                edges.push({
                    id: `e-chaos-${id}-${rnd}`, source: id, target: `c${clusterIdx}-r2-${rnd}`,
                    animated: false, style: { stroke: '#333', strokeOpacity: 0.3 }
                });
            }
        }
    };

    // GENERATE CLUSTERS
    if (centerType === 'process') {
        createCluster(0, 0, 1);
        createCluster(1800, 400, 2); // Second large cluster nearby
    } else {
        createCluster(0, 0, 1); // Single massive host cluster
    }

    // SCATTERED ISOLATED NODES (Debris)
    // Random positions far from center
    const isoCount = 15;
    for (let i = 0; i < isoCount; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 1500 + 800; // Far out
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        nodes.push({
            id: `iso-${i}`,
            type: 'smartscape',
            position: { x, y },
            data: {
                label: `Isolated ${i}`,
                type: centerType === 'host' ? 'host' : 'process',
                status: 'healthy',
                technology: centerType === 'host' ? 'linux' : 'postgres',
                subLabel: 'No Traffic',
                showVulnerability: false
            }
        });
        // Intentionally NO EDGES for these
    }

    return { nodes, edges };
};
