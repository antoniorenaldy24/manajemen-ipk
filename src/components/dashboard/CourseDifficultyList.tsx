'use client';

import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

interface CourseData {
    course_code: string;
    course_name: string;
    total_students: number;
    avg_grade: number;
    fail_count: number;
    pass_rate: number;
}

export default function CourseDifficultyList({ courses }: { courses: CourseData[] }) {
    if (!courses || courses.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-soft">
                <p>Belum ada data mata kuliah tersedia.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Analisis Kesulitan Mata Kuliah
                    </h3>
                    <p className="text-sm text-slate-500">Diurutkan dari yang paling sulit (Nilai Rata-rata Terendah)</p>
                </div>
                <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                    Total: {courses.length} MK
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <th className="px-6 py-3 font-semibold w-12 text-center">#</th>
                            <th className="px-6 py-3 font-semibold">Mata Kuliah</th>
                            <th className="px-6 py-3 font-semibold text-center">Mahasiswa</th>
                            <th className="px-6 py-3 font-semibold text-center">Gagal</th>
                            <th className="px-6 py-3 font-semibold text-center">Rata-rata</th>
                            <th className="px-6 py-3 font-semibold text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {courses.map((course, idx) => {
                            const isHard = course.avg_grade < 2.5;
                            const isEasy = course.avg_grade > 3.5;

                            return (
                                <motion.tr
                                    key={course.course_code}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4 text-center text-slate-400 text-xs font-mono">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{course.course_name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{course.course_code}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600">{course.total_students}</td>
                                    <td className="px-6 py-4 text-center">
                                        {course.fail_count > 0 ? (
                                            <span className="text-red-500 font-bold">{course.fail_count}</span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                                        {course.avg_grade.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isHard ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                                                <AlertCircle className="w-3 h-3" /> Sulit
                                            </span>
                                        ) : isEasy ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                                <CheckCircle className="w-3 h-3" /> Mudah
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                                                Normal
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
