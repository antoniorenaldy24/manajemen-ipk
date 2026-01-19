'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, GraduationCap } from 'lucide-react';

interface AcademicRecord {
    id: string;
    course_code: string;
    course_name: string;
    sks: number;
    semester: number;
    grade_point: number; // Decimal in DB, number in JS
}

interface AcademicHistoryProps {
    records: AcademicRecord[];
}

export default function AcademicHistory({ records }: AcademicHistoryProps) {
    // Get unique semesters
    const semesters = Array.from(new Set(records.map(r => r.semester))).sort((a, b) => a - b);

    // Default to latest semester available
    const [selectedSemester, setSelectedSemester] = useState<number>(semesters[semesters.length - 1] || 1);
    const [isOpen, setIsOpen] = useState(false);

    const filteredRecords = records.filter(r => r.semester === selectedSemester);

    // Calculate Semester Stats
    const totalSKS = filteredRecords.reduce((acc, curr) => acc + curr.sks, 0);
    const totalPoints = filteredRecords.reduce((acc, curr) => acc + (Number(curr.grade_point) * curr.sks), 0);
    const semIPS = totalSKS > 0 ? (totalPoints / totalSKS).toFixed(2) : "0.00";

    const getGradeLetter = (point: number) => {
        const p = Number(point);
        if (p >= 4.0) return 'A';
        if (p >= 3.7) return 'A-';
        if (p >= 3.3) return 'B+';
        if (p >= 3.0) return 'B';
        if (p >= 2.7) return 'B-';
        if (p >= 2.3) return 'C+';
        if (p >= 2.0) return 'C';
        if (p >= 1.0) return 'D';
        return 'E';
    };

    if (records.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-medium">Belum ada riwayat akademik</h3>
                <p className="text-slate-500 text-sm mt-1">Data nilai akan muncul setelah diinput oleh prodi.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
            {/* Header / Filter */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                        Riwayat Studi
                    </h2>
                    <p className="text-sm text-slate-500">Daftar mata kuliah yang telah diselesaikan</p>
                </div>

                {/* Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors w-40 justify-between"
                    >
                        <span>Semester {selectedSemester}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-10 overflow-hidden py-1"
                            >
                                {semesters.map(sem => (
                                    <button
                                        key={sem}
                                        onClick={() => {
                                            setSelectedSemester(sem);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${selectedSemester === sem ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}
                                    >
                                        Semester {sem}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-indigo-50/50 px-6 py-3 flex gap-6 text-sm border-b border-indigo-100/50">
                <div className="flex gap-2 text-indigo-900/70">
                    <span className="font-medium">Total SKS:</span>
                    <span className="font-bold text-indigo-700">{totalSKS}</span>
                </div>
                <div className="flex gap-2 text-indigo-900/70">
                    <span className="font-medium">IPS:</span>
                    <span className="font-bold text-indigo-700">{semIPS}</span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <th className="px-6 py-3 font-semibold w-20">Kode</th>
                            <th className="px-6 py-3 font-semibold">Mata Kuliah</th>
                            <th className="px-6 py-3 font-semibold text-center w-20">SKS</th>
                            <th className="px-6 py-3 font-semibold text-center w-24">Nilai</th>
                            <th className="px-6 py-3 font-semibold text-center w-24">Huruf</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredRecords.map((record, idx) => (
                            <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-600 text-xs">{record.course_code}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{record.course_name}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{record.sks}</td>
                                <td className="px-6 py-4 text-center font-bold text-slate-700">{Number(record.grade_point).toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block w-8 py-1 rounded-md text-xs font-bold ${Number(record.grade_point) >= 3.0 ? 'bg-green-100 text-green-700' :
                                            Number(record.grade_point) >= 2.0 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {getGradeLetter(record.grade_point)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredRecords.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    Tidak ada data mata kuliah untuk semester ini.
                </div>
            )}
        </div>
    );
}
