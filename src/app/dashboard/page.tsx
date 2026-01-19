import { getDashboardStats } from '@/actions/dashboard';
import { getRiskAnalysisData } from '@/actions/student';
import { getCourseAnalytics } from '@/actions/course';
import GPATrendChart from '@/components/dashboard/GPATrendChart';
import StatsCard from '@/components/dashboard/StatsCard';
import RiskTable from '@/components/dashboard/RiskTable';
import CourseDifficultyList from '@/components/dashboard/CourseDifficultyList'; // New Component
import { auth } from '@/auth';
import { Role } from '@prisma/client';

export default async function DashboardPage() {
    const session = await auth();
    const stats = await getDashboardStats();

    // Role-Based Data Fetching
    const role = session?.user?.role;
    const isKaProdi = role === Role.KAPRODI || role === Role.UPM;
    const isUPM = role === Role.UPM;

    // Fetch Risk Data (For KaProdi focus)
    const riskData = await getRiskAnalysisData(1, 5, 2.75); // Top 5 At Risk
    const riskStudents = 'data' in riskData ? riskData.data : [];

    // Fetch Course Data (For UPM focus)
    const courseData = isUPM ? await getCourseAnalytics() : null;
    const difficultyAnalysis = courseData && !('error' in courseData) ? courseData.difficultyAnalysis : [];

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">
                    {isUPM ? 'Overview Kurikulum' : 'Monitoring Akademik'}
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Selamat datang kembali, <span className="text-slate-900">{session?.user?.email?.split('@')[0]}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        {role}
                    </span>
                </p>
            </div>

            {/* Bento Grid Stats (Universal) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Mahasiswa"
                    value={stats.totalStudents}
                    description="Mahasiswa aktif terdata"
                    iconName="users"
                />
                <StatsCard
                    title="Rata-rata IPK"
                    value={stats.averageGPA.toFixed(2)}
                    description="IPK Angkatan saat ini"
                    iconName="graduation"
                />
                <StatsCard
                    title="Total SKS"
                    value={stats.totalSKS}
                    description="Total SKS terselesaikan"
                    iconName="book"
                />
                <StatsCard
                    title="Status Risiko"
                    value={riskStudents.length.toString()}
                    description="Mahasiswa perlu perhatian"
                    iconName="trend"
                />
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="xl:col-span-2 space-y-8">
                    {/* GPA Trend Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Tren IPK</h3>
                                <p className="text-sm text-slate-500">Performa rata-rata per semester</p>
                            </div>
                            <span className="text-xs font-medium px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">Angkatan 2023</span>
                        </div>
                        <div className="w-full h-[350px] relative">
                            <GPATrendChart data={stats.gpaTrend} />
                        </div>
                    </div>

                    {/* Course Analysis (UPM ONLY) */}
                    {isUPM && (
                        <CourseDifficultyList courses={difficultyAnalysis} />
                    )}
                </div>

                {/* Side Panel (Right Column) */}
                <div className="space-y-8">
                    {/* At-Risk Students List (Prioritized on Right for Visibility) */}
                    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Mahasiswa Berisiko</h3>
                                <p className="text-sm text-slate-500">IPK di bawah 2.75</p>
                            </div>
                            {/* Link to full list triggered later */}
                        </div>
                        <div className="p-0">
                            <RiskTable students={riskStudents} />
                        </div>
                    </div>

                    {/* Quick Actions / Other Widgets */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                        <h3 className="text-lg font-bold mb-2">Aksi Cepat</h3>
                        <p className="text-indigo-100 text-sm mb-6">Kelola laporan dan notifikasi akademik.</p>
                        <div className="space-y-3">
                            <button className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition text-left font-medium flex items-center justify-between group">
                                <span>Unduh Laporan Risiko</span>
                                <span className="text-white/60 group-hover:text-white">→</span>
                            </button>
                            {isKaProdi && (
                                <button className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition text-left font-medium flex items-center justify-between group">
                                    <span>Kirim Peringatan (Email)</span>
                                    <span className="text-white/60 group-hover:text-white">→</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
