import prisma from "@/lib/db";
import { decryptNIM } from "@/lib/security/crypto";
import StatusCard from "@/components/student/StatusCard";
import AcademicHistory from "@/components/student/AcademicHistory";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    // RBAC: Only UPM/KAPRODI can view other students
    if (!session || (session.user.role !== 'UPM' && session.user.role !== 'KAPRODI')) {
        return redirect("/dashboard");
    }

    const { id } = await params;

    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            academic_records: {
                orderBy: { semester: 'asc' }
            }
        }
    });

    if (!student) {
        return <div className="p-8 text-center">Mahasiswa tidak ditemukan</div>;
    }

    // Prepare Data for Components
    const formattedHistory = student.academic_records.map(r => ({
        ...r,
        grade_point: Number(r.grade_point)
    }));

    const ipk = Number(student.ipk);
    const nim = decryptNIM(student.nim_encrypted);

    // Status Logic
    let statusLabel: 'AMAN' | 'WASPADA' | 'KRITIS' = 'AMAN';
    if (ipk < 2.00) statusLabel = 'KRITIS';
    else if (ipk < 2.75) statusLabel = 'WASPADA';

    return (
        <div className="space-y-6 pb-20">
            {/* Breadcrumb / Back */}
            <div>
                <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors gap-1 mb-4">
                    <ChevronLeft className="w-4 h-4" /> Kembali ke Dashboard
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Detail Mahasiswa</h1>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        Angkatan {student.batch_year}
                    </span>
                </div>
            </div>

            {/* Reuse Student Components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StatusCard
                    status={statusLabel}
                    ipk={ipk}
                    name={student.name}
                    nim={nim}
                />
                {/* Additional Details for Admin? maybe Contact info later */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft h-full flex flex-col justify-center">
                    <div className="space-y-4">
                        <DetailRow label="Semester Saat Ini" value={student.current_semester.toString()} />
                        <DetailRow label="Total SKS" value={student.total_sks.toString()} />
                        <div className="pt-4 border-t border-slate-50">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Status Sistem</p>
                            <p className="font-medium text-slate-700">
                                {Number(student.ipk) < 2.75 ? "Perlu Bimbingan Akademik" : "Performa Akademik Baik"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic History */}
            <div>
                <AcademicHistory records={formattedHistory} />
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="font-bold text-slate-900 text-lg font-mono">{value}</span>
        </div>
    );
}
