import { UploadService } from '@/lib/services/upload-service';
import { formatDistanceToNow } from 'date-fns';
import { FileUp, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import prisma from '@/lib/db'; // Direct access for Server Component

// Server Component
export default async function ImportHistoryTable() {
    // Fetch logs directly
    const logs = await prisma.importLog.findMany({
        orderBy: { created_at: 'desc' },
        take: 10
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
            case 'FAILED':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Failed</span>;
            case 'PROCESSING':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</span>;
            default:
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
        }
    };

    return (
        <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-gray-900/50 backdrop-blur-sm">
            <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <FileUp className="w-5 h-5 mr-2 text-blue-400" />
                    Recent Imports
                </h3>
            </div>
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-white/5 text-gray-300">
                    <tr>
                        <th className="px-6 py-3">Filename</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Processed</th>
                        <th className="px-6 py-3 text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                No import history found.
                            </td>
                        </tr>
                    ) : (
                        logs.map((log: any) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{log.filename}</td>
                                <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                                <td className="px-6 py-4 text-right">
                                    {log.status === 'FAILED' ? (
                                        <span className="text-red-400 text-xs truncate max-w-[200px] block ml-auto" title={log.error_message || ''}>
                                            {log.error_message || 'Error'}
                                        </span>
                                    ) : (
                                        <span className="font-mono text-white">{log.records_processed}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
