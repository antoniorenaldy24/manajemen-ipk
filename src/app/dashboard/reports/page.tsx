
import { auth } from "@/auth";
import prisma from "@/lib/db";
import ReportGeneratorPanel from "@/components/dashboard/ReportGeneratorPanel";
import { format } from "date-fns";

export default async function ReportsPage() {
    const session = await auth();
    // RBAC Check should normally be in layout or middleware, but good to be safe
    if (session?.user?.role === 'MAHASISWA') {
        return <div>Access Denied</div>;
    }

    // Fetch History
    const logs = await prisma.reportLog.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: { user: { select: { email: true } } }
    });

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Pusat Laporan</h1>
                <p className="text-slate-400">
                    Kelola dan unduh laporan akademik resmi yang telah divalidasi.
                </p>
            </header>

            {/* Generator Section */}
            <ReportGeneratorPanel />

            {/* History Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Riwayat Pembuatan</h2>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs uppercase bg-slate-950 text-slate-300">
                            <tr>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Tipe</th>
                                <th className="px-6 py-3">Format</th>
                                <th className="px-6 py-3">Oleh</th>
                                <th className="px-6 py-3">Integritas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Belum ada laporan yang dibuat.
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        {format(log.created_at, 'dd MMM yyyy HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        {log.report_type}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-900 text-blue-300">
                                            {log.format}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2" title={log.file_hash}>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <span className="font-mono text-xs truncate max-w-[100px]">
                                                {log.file_hash.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
