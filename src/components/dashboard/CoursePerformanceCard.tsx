'use client';

import { motion } from 'framer-motion';

interface CourseListProps {
    title: string;
    courses: any[];
    type: 'hardest' | 'easiest';
}

export default function CoursePerformanceCard({ title, courses, type }: CourseListProps) {
    const isHard = type === 'hardest';

    return (
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm h-full">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isHard ? 'bg-red-500' : 'bg-green-500'}`} />
                {title}
            </h3>
            <div className="space-y-3">
                {courses.map((c, i) => (
                    <motion.div
                        key={c.course_code}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex justify-between items-center p-3 rounded-lg bg-black/20 hover:bg-white/5 transition-colors"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-200">{c.course_name || c.course_code}</p>
                            <p className="text-xs text-gray-500">{c.course_code} • {c.total_students} Students</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-bold ${isHard ? 'text-red-400' : 'text-green-400'}`}>
                                {c.avg_grade.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-gray-600">Avg</p>
                        </div>
                    </motion.div>
                ))}
                {courses.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No data available.</p>
                )}
            </div>
        </div>
    );
}
