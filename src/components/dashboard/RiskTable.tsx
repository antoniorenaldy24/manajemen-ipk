'use client';

import { motion } from 'framer-motion';

interface RiskTableProps {
    students: any[];
}

export default function RiskTable({ students }: RiskTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                        <th className="p-4 font-semibold">NIM</th>
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">IPK</th>
                        <th className="p-4 font-semibold">SKS</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {students.map((s, i) => (
                        <motion.tr
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-sm hover:bg-slate-50 transition-colors"
                        >
                            <td className="p-4 font-mono text-slate-600">{s.nim}</td>
                            <td className="p-4 font-medium text-slate-900">{s.name}</td>
                            <td className="p-4 font-bold text-rose-500">{Number(s.ipk).toFixed(2)}</td>
                            <td className="p-4 text-slate-500">{s.total_sks}</td>
                            <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.risk_status === 'KRITIS'
                                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {s.risk_status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <a
                                    href={`/dashboard/student/${s.id}`}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                    Lihat Detail
                                </a>
                            </td>
                        </motion.tr>
                    ))}
                    {students.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                Tidak ada mahasiswa yang beresiko.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
