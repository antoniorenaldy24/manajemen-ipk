
import prisma from "@/lib/db";
import { SecurityGuard } from "@/lib/security/guard";
import { decryptNIM } from "@/lib/security/crypto";
import StatusCard from "@/components/student/StatusCard";
import AcademicHistory from "@/components/student/AcademicHistory";
import { getStudentHistory } from "@/actions/student";

export default async function StudentDashboard() {
    // 1. Strict Security Check
    const studentId = await SecurityGuard.getCurrentStudentId();
    if (!studentId) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold text-red-500">Akses Ditolak</h1>
                <p>Tidak ada profil mahasiswa yang terhubung dengan akun ini.</p>
            </div>
        );
    }

    // 2. Fetch Data (GUARANTEED to be OWN data)
    const student = await prisma.student.findUnique({
        where: { id: studentId }
    });

    if (!student) return <div>Mahasiswa Tidak Ditemukan</div>;

    // Fetch History using Server Action Logic (Direct call since in SC)
    // We can call the function directly if imported, or copy logic. 
    // Importing action directly in SC is fine.
    const historyResult = await getStudentHistory();
    const historyData = historyResult && 'data' in historyResult ? historyResult.data : [];

    // Convert Decimals to Numbers for Client Component
    const formattedHistory = (historyData || []).map(r => ({
        ...r,
        grade_point: Number(r.grade_point)
    }));

    const ipk = Number(student.ipk);
    const nim = decryptNIM(student.nim_encrypted);

    // Determine Status
    let statusLabel: 'AMAN' | 'WASPADA' | 'KRITIS' = 'AMAN';
    if (ipk < 2.00) statusLabel = 'KRITIS';
    else if (ipk < 2.75) statusLabel = 'WASPADA';

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Dashboard Mahasiswa
                </h1>
                <p className="text-slate-500 font-medium">
                    Selamat datang, <span className="text-indigo-600 font-bold">{student.name}</span>
                </p>
            </header>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Status Card */}
                <StatusCard
                    status={statusLabel}
                    ipk={ipk}
                    name={student.name}
                    nim={nim}
                />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 content-start">
                    <InfoBox label="Semester" value={student.current_semester.toString()} delay={0.1} />
                    <InfoBox label="Total SKS" value={student.total_sks.toString()} delay={0.2} />
                    <InfoBox label="Angkatan" value={student.batch_year.toString()} delay={0.3} />
                    <InfoBox label="Program Studi" value="Informatika" delay={0.4} />
                </div>
            </div>

            {/* Academic History Section */}
            <div>
                <AcademicHistory records={formattedHistory} />
            </div>
        </div>
    );
}

function InfoBox({ label, value, delay }: { label: string, value: string, delay: number }) {
    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-soft hover:shadow-md transition-shadow">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</h3>
            <p className="text-3xl font-mono font-bold text-slate-900">{value}</p>
        </div>
    );
}
