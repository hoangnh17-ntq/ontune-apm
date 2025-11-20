'use client';
import React, { useEffect, useState } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface ConcurrentData {
  time: string;
  users: number;
}

export default function ConcurrentUsersChart() {
  const [userData, setUserData] = useState<ConcurrentData[]>([]);
  const [currentUsers, setCurrentUsers] = useState(0);
  const [peakUsers, setPeakUsers] = useState(0);

  useEffect(() => {
    // Initialize with recent history (last 30 minutes)
    const initData: ConcurrentData[] = [];
    const now = Date.now();
    
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - i * 60 * 1000; // 1 minute intervals
      const baseUsers = 150;
      const variance = Math.random() * 50 - 25;
      const users = Math.max(50, Math.floor(baseUsers + variance));
      
      initData.push({
        time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        users
      });
    }
    
    setUserData(initData);
    setCurrentUsers(initData[initData.length - 1].users);
    setPeakUsers(Math.max(...initData.map(d => d.users)));

    // Update every 5 seconds
    const interval = setInterval(() => {
      setUserData(prev => {
        const newData = [...prev.slice(1)]; // Remove oldest
        const lastUsers = prev[prev.length - 1].users;
        const variance = Math.random() * 30 - 15;
        const newUsers = Math.max(50, Math.min(300, Math.floor(lastUsers + variance)));
        
        newData.push({
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          users: newUsers
        });
        
        setCurrentUsers(newUsers);
        const newPeak = Math.max(...newData.map(d => d.users));
        setPeakUsers(newPeak);
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Concurrent Users
        </CardTitle>
        <CardDescription>
          <span className="text-2xl font-bold text-foreground">{currentUsers}</span>
          <span className="text-xs text-muted-foreground ml-2">online now (peak: {peakUsers})</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3e4451" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#3e4451' }}
                interval="preserveStartEnd"
                tickFormatter={(value, index) => (index % 6 === 0 ? value : '')}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#3e4451' }}
                domain={[0, 'auto']}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#6b7280' }}
                contentStyle={{ backgroundColor: '#252932', borderColor: '#3e4451', color: '#fff' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#9ca3af' }}
                formatter={(value: number) => [`${value} users`, 'Concurrent']}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

