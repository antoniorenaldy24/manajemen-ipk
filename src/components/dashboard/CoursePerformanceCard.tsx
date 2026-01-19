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
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft h-full">
            <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isHard ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                {title}
            </h3>
            <div className="space-y-3">
                {courses.map((c, i) => (
                    <motion.div
                        key={c.course_code}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex justify-between items-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-slate-100"
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{c.course_name || c.course_code}</p>
                            <p className="text-xs text-slate-500">{c.course_code} • {c.total_students} Mahasiswa</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-bold ${isHard ? 'text-rose-500' : 'text-emerald-600'}`}>
                                {c.avg_grade.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">Rata-rata</p>
                        </div>
                    </motion.div>
                ))}
                {courses.length === 0 && (
                    <p className="text-sm text-slate-400 italic text-center py-4">Data tidak tersedia.</p>
                )}
            </div>
        </div>
    );
}
