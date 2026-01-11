'use client';

import { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';

interface GPATrendChartProps {
    data: { semester: number; avgGPA: number }[];
}

export default function GPATrendChart({ data }: GPATrendChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-full h-full bg-gray-900/50 rounded-xl animate-pulse" />;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full bg-gray-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
        >
            <h3 className="text-lg font-semibold text-white mb-6">Aggregate GPA Trend</h3>
            <div className="w-full h-[350px] min-h-[350px]"> {/* Enforced Height for Recharts */}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis
                            dataKey="semester"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `Sem ${val}`}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 4]}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ color: '#8884d8' }}
                            formatter={(value: any) => [value, 'Avg GPA']}
                            labelFormatter={(label) => `Semester ${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="avgGPA"
                            stroke="#8884d8"
                            fillOpacity={1}
                            fill="url(#colorGpa)"
                            strokeWidth={3}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
