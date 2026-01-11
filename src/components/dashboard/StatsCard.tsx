'use client';

import { motion } from 'framer-motion';
import { Users, GraduationCap, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    description: string;
    iconName: string;
    trend?: 'up' | 'down' | 'neutral';
}

const iconMap: Record<string, any> = {
    users: Users,
    graduation: GraduationCap,
    trend: TrendingUp,
    book: BookOpen,
    alert: AlertCircle
};

export default function StatsCard({ title, value, description, iconName, trend }: StatsCardProps) {
    const Icon = iconMap[iconName] || AlertCircle; // Fallback

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-xl"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-200">{title}</h3>
                    <div className="mt-2 text-3xl font-bold text-white">{value}</div>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-400" />
                </div>
            </div>
            <p className="mt-4 text-xs text-gray-400">
                {description}
            </p>

            {/* Glossy Effect overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        </motion.div>
    );
}
