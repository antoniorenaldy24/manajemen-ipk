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
            className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft border border-slate-100 group hover:border-indigo-100 transition-colors"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                    <div className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                    <Icon className="w-6 h-6 text-indigo-600" />
                </div>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-400">
                {description}
            </p>

            {/* Subtle Gradient Decor */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-full blur-2xl pointer-events-none" />
        </motion.div>
    );
}
