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
                    <tr className="text-gray-400 text-sm border-b border-gray-800">
                        <th className="p-4">NIM</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">IPK</th>
                        <th className="p-4">SKS</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((s, i) => (
                        <motion.tr
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-gray-800 text-sm hover:bg-white/5"
                        >
                            <td className="p-4 font-mono">{s.nim}</td>
                            <td className="p-4 font-medium">{s.name}</td>
                            <td className="p-4 text-red-400 font-bold">{Number(s.ipk).toFixed(2)}</td>
                            <td className="p-4 text-gray-400">{s.total_sks}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${s.risk_status === 'KRITIS' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {s.risk_status}
                                </span>
                            </td>
                        </motion.tr>
                    ))}
                    {students.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                No students found at risk.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
