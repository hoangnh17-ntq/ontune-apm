'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/apm';

interface ActiveTransactionSpeedChartProps {
  transactions: Transaction[];
}

interface SpeedMeterData {
  rps: number; // Left area
  active: {
    normal: number; // 0-3s
    slow: number; // 3-8s
    verySlow: number; // 8s+
    total: number;
  };
  apdex: {
    satisfied: number; // Blue
    tolerating: number; // Orange
    frustrated: number; // Red
    total: number;
  };
}

interface WaterDroplet {
  id: number;
  x: number;
  y: number;
  vx: number;
  color: string; // Based on transaction speed or apdex
  size: number;
  length: number; // Length of the streak/line
  direction: 'inbound' | 'outbound';
}

export default function ActiveTransactionSpeedChart({ transactions }: ActiveTransactionSpeedChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speedData, setSpeedData] = useState<SpeedMeterData>({
    rps: 0,
    active: {
      normal: 0,
      slow: 0,
      verySlow: 0,
      total: 0
    },
    apdex: {
      satisfied: 0,
      tolerating: 0,
      frustrated: 0,
      total: 0
    }
  });

  // Calculate speed metrics based on WhaTap definition
  useEffect(() => {
    const calculateMetrics = () => {
      const now = Date.now();
      const lastSecond = now - 1000;

      // RPS: Number of requested transactions per second (LEFT AREA)
      const rps = transactions.filter(tx => tx.timestamp >= lastSecond && tx.timestamp <= now).length;

      // Active transactions by speed (MIDDLE AREA)
      // Use longer time window to capture more active transactions
      const activeTxs = transactions.filter(tx => tx.timestamp >= now - 20000); // Extended to 20 seconds
      const active = {
        normal: activeTxs.filter(tx => tx.responseTime < 3000).length, // 0-3s: Blue
        slow: activeTxs.filter(tx => tx.responseTime >= 3000 && tx.responseTime < 8000).length, // 3-8s: Orange
        verySlow: activeTxs.filter(tx => tx.responseTime >= 8000).length, // 8s+: Red
        total: activeTxs.length
      };

      // Apdex metrics (RIGHT AREA)
      // Use longer window to show more completed transactions
      const recentTxs = transactions.filter(tx => tx.timestamp >= now - 5000); // Extended to 5 seconds
      const apdex = {
        satisfied: recentTxs.filter(tx => tx.responseTime < 2000).length, // Blue
        tolerating: recentTxs.filter(tx => tx.responseTime >= 2000 && tx.responseTime < 8000).length, // Orange
        frustrated: recentTxs.filter(tx => tx.responseTime >= 8000).length, // Red
        total: recentTxs.length
      };

      setSpeedData({ rps, active, apdex });
    };

    calculateMetrics();
    const interval = setInterval(calculateMetrics, 500);
    return () => clearInterval(interval);
  }, [transactions]);

  // Draw WhaTap-style water droplets animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Define 3 areas
    const middleAreaStart = width * 0.15;
    const middleAreaEnd = width * 0.85;
    const rightAreaStart = width * 0.85;

    let animationFrame: number;
    let dropletIdCounter = 0;
    const inboundDroplets: WaterDroplet[] = [];
    const outboundDroplets: WaterDroplet[] = [];
    let inboundAccumulator = 0;
    let outboundAccumulator = 0;

    // Block configuration for middle area
    const blockCount = 60;
    const blockWidth = 8;
    const blockHeight = 50;
    const blockGap = 2;
    const totalBlocksWidth = blockCount * (blockWidth + blockGap);
    const blocksStartX = (width - totalBlocksWidth) / 2;

    // Create blocks array with status colors - recalculate on each frame
    const getBlocks = () => {
      const blocks: { color: string; alpha: number }[] = [];
      const activeTotal = speedData.active.total || 0;
      
      if (activeTotal === 0) {
        // No active transactions - all blue (default)
        for (let i = 0; i < blockCount; i++) {
          blocks.push({ color: '#3b82f6', alpha: 0.5 });
        }
        return blocks;
      }
      
      // Calculate ratios
      const normalRatio = speedData.active.normal / activeTotal;
      const slowRatio = speedData.active.slow / activeTotal;
      const verySlowRatio = speedData.active.verySlow / activeTotal;
      
      // Calculate block counts based on ratios
      let normalCount = Math.round(blockCount * normalRatio);
      let slowCount = Math.round(blockCount * slowRatio);
      let verySlowCount = Math.round(blockCount * verySlowRatio);
      
      // Ensure minimum 1 block for each color if that category exists
      if (speedData.active.normal > 0 && normalCount === 0) normalCount = 1;
      if (speedData.active.slow > 0 && slowCount === 0) slowCount = 1;
      if (speedData.active.verySlow > 0 && verySlowCount === 0) verySlowCount = 1;
      
      // Adjust to fit blockCount
      const total = normalCount + slowCount + verySlowCount;
      if (total !== blockCount) {
        const diff = blockCount - total;
        if (diff > 0) {
          // Add to largest category
          if (normalCount >= slowCount && normalCount >= verySlowCount) {
            normalCount += diff;
          } else if (slowCount >= verySlowCount) {
            slowCount += diff;
          } else {
            verySlowCount += diff;
          }
        } else {
          // Remove from largest category
          if (normalCount >= slowCount && normalCount >= verySlowCount) {
            normalCount = Math.max(1, normalCount + diff);
          } else if (slowCount >= verySlowCount) {
            slowCount = Math.max(1, slowCount + diff);
          } else {
            verySlowCount = Math.max(1, verySlowCount + diff);
          }
        }
      }
      
      // Build blocks array
      for (let i = 0; i < blockCount; i++) {
        let color = '#3b82f6';
        if (i < normalCount) {
          color = '#3b82f6'; // Blue - normal
        } else if (i < normalCount + slowCount) {
          color = '#f97316'; // Orange - slow
        } else {
          color = '#ef4444'; // Red - very slow
        }
        
        blocks.push({ color, alpha: 0.75 + Math.random() * 0.25 });
      }
      
      return blocks;
    };

    const spawnInboundDroplet = () => {
      if (inboundDroplets.length > 150) return; // Further reduced limit

      const activeTotalForColor = speedData.active.total;
      const normalRatio = activeTotalForColor ? speedData.active.normal / activeTotalForColor : 0;
      const slowRatio = activeTotalForColor ? speedData.active.slow / activeTotalForColor : 0;
      const verySlowRatio = activeTotalForColor ? speedData.active.verySlow / activeTotalForColor : 0;

      const rand = Math.random();
      let color = '#3b82f6';
      if (activeTotalForColor) {
        if (rand < normalRatio) {
          color = '#3b82f6';
        } else if (rand < normalRatio + slowRatio) {
          color = '#f97316';
        } else {
          color = '#ef4444';
        }
      } else {
        const fallback = Math.random();
        color = fallback < 0.34 ? '#3b82f6' : fallback < 0.67 ? '#f97316' : '#ef4444';
      }

      const baseSpeed = 0.5 + Math.min(speedData.rps, 200) / 600; // Slower for visibility

      inboundDroplets.push({
        id: dropletIdCounter++,
        x: blocksStartX - 70 + Math.random() * 10,
        y: centerY + (Math.random() - 0.5) * blockHeight * 0.8,
        vx: baseSpeed + Math.random() * 0.12,
        color,
        size: 3.5 + Math.random() * 1.2, // Larger size
        length: 24 + Math.random() * 12, // Longer streaks
        direction: 'inbound'
      });
    };

    const spawnOutboundDroplet = () => {
      if (outboundDroplets.length > 150) return; // Further reduced limit

      const apdexTotalForColor = speedData.apdex.total;
      const satisfiedRatio = apdexTotalForColor ? speedData.apdex.satisfied / apdexTotalForColor : 0;
      const toleratingRatio = apdexTotalForColor ? speedData.apdex.tolerating / apdexTotalForColor : 0;
      const frustratedRatio = apdexTotalForColor ? speedData.apdex.frustrated / apdexTotalForColor : 0;

      const rand = Math.random();
      let color = '#3b82f6';
      if (apdexTotalForColor) {
        if (rand < satisfiedRatio) {
          color = '#3b82f6';
        } else if (rand < satisfiedRatio + toleratingRatio) {
          color = '#f97316';
        } else {
          color = '#ef4444';
        }
      } else {
        const fallback = Math.random();
        color = fallback < 0.34 ? '#3b82f6' : fallback < 0.67 ? '#f97316' : '#ef4444';
      }

      const baseSpeed = 0.6 + Math.min(speedData.apdex.total, 200) / 600; // Slower for visibility

      outboundDroplets.push({
        id: dropletIdCounter++,
        x: blocksStartX + totalBlocksWidth + 6,
        y: centerY + (Math.random() - 0.5) * blockHeight * 0.8,
        vx: baseSpeed + Math.random() * 0.15,
        color,
        size: 3.5 + Math.random() * 1.2, // Larger size
        length: 25 + Math.random() * 12, // Longer streaks
        direction: 'outbound'
      });
    };

    const animate = () => {
      // Clear canvas - fastest method
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      const frameRate = 45; // Reduced from 60 to 45 FPS for better performance
      // Continuous spawn - further optimized rate
      // Inbound: based on RPS and active transactions
      const inboundPerSecond = Math.max(speedData.rps * 1.5, speedData.active.total * 0.4, 12);
      inboundAccumulator += inboundPerSecond / frameRate;
      
      // Spawn continuously without gaps - smoother flow
      while (inboundAccumulator >= 1.0) {
        spawnInboundDroplet();
        inboundAccumulator -= 1.0;
      }

      // Outbound: based on Apdex completion rate - optimized rate
      const outboundPerSecond = Math.max(speedData.apdex.total * 1.2, speedData.active.total * 0.3, 10);
      outboundAccumulator += outboundPerSecond / frameRate;
      
      while (outboundAccumulator >= 1.0) {
        spawnOutboundDroplet();
        outboundAccumulator -= 1.0;
      }

      // Batch rendering settings for inbound droplets
      ctx.lineCap = 'round';
      ctx.shadowBlur = 1; // Further reduced for performance
      
      for (let i = inboundDroplets.length - 1; i >= 0; i--) {
        const d = inboundDroplets[i];

        d.x += d.vx;
        d.y += Math.sin(d.x * 0.02) * 0.05;
        const drift = (centerY - d.y) * 0.015;
        d.y += drift;

        const gateX = blocksStartX - 2;
        if (d.x >= gateX) {
          inboundDroplets.splice(i, 1);
          continue;
        }

        const gradient = ctx.createLinearGradient(d.x - d.length, d.y, d.x, d.y);
        gradient.addColorStop(0, d.color + '00');
        gradient.addColorStop(0.5, d.color + '66');
        gradient.addColorStop(1, d.color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = d.size;
        ctx.globalAlpha = 0.85;
        ctx.shadowColor = d.color;

        ctx.beginPath();
        ctx.moveTo(d.x - d.length, d.y);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;

      // Draw blocks (rectangles) in middle area - recalculate each frame
      const blocks = getBlocks();
      for (let i = 0; i < blockCount; i++) {
        const x = blocksStartX + i * (blockWidth + blockGap);
        const block = blocks[i];
        
        ctx.fillStyle = block.color;
        ctx.globalAlpha = block.alpha;
        ctx.fillRect(
          x, 
          centerY - blockHeight / 2, 
          blockWidth, 
          blockHeight
        );
      }
      
      // Display total active count in middle
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#000000';
      ctx.fillText(speedData.active.total.toString(), (blocksStartX + blocksStartX + totalBlocksWidth) / 2, centerY);
      ctx.shadowBlur = 0;
      
      ctx.globalAlpha = 1;

      // Batch rendering settings for outbound droplets
      ctx.shadowBlur = 1; // Further reduced for performance
      
      for (let i = outboundDroplets.length - 1; i >= 0; i--) {
        const d = outboundDroplets[i];

        d.x += d.vx;
        d.y += Math.sin(d.x * 0.02) * 0.05;
        const drift = (centerY - d.y) * 0.012;
        d.y += drift;

        const exitX = rightAreaStart + 160;
        if (d.x > exitX) {
          outboundDroplets.splice(i, 1);
          continue;
        }

        const gradient = ctx.createLinearGradient(d.x - d.length, d.y, d.x, d.y);
        gradient.addColorStop(0, d.color + '00');
        gradient.addColorStop(0.5, d.color + '66');
        gradient.addColorStop(1, d.color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = d.size;
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = d.color;

        ctx.beginPath();
        ctx.moveTo(d.x - d.length, d.y);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;

      ctx.globalAlpha = 1;

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [speedData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Active Transaction Speed Chart</CardTitle>
            <CardDescription>Real-time transaction processing speed visualization</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Speed Chart Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={1200}
              height={100}
              className="w-full h-[100px] rounded-lg cursor-pointer"
              onClick={() => {
                // TODO: Show active transactions list popup
                console.log('Chart clicked - show active transactions list');
              }}
            />
            
            {/* Metrics overlay */}
            <div className="absolute top-2 left-4 text-xs font-mono text-blue-300">
              RPS {speedData.rps}
            </div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs font-mono">
              <span className="text-blue-400">● {speedData.active.normal}</span>
              <span className="text-orange-400">● {speedData.active.slow}</span>
              <span className="text-red-400">● {speedData.active.verySlow}</span>
            </div>
            <div className="absolute top-2 right-4 flex items-center gap-3 text-xs font-mono">
              <span className="text-blue-400">● {speedData.apdex.satisfied}</span>
              <span className="text-orange-400">● {speedData.apdex.tolerating}</span>
              <span className="text-red-400">● {speedData.apdex.frustrated}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
