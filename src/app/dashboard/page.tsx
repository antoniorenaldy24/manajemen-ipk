import { getDashboardStats } from '@/actions/dashboard';
import { getRiskAnalysisData } from '@/actions/student';
import { getCourseAnalytics } from '@/actions/course';
import GPATrendChart from '@/components/dashboard/GPATrendChart';
import StatsCard from '@/components/dashboard/StatsCard';
import RiskTable from '@/components/dashboard/RiskTable';
import CoursePerformanceCard from '@/components/dashboard/CoursePerformanceCard';
import { auth } from '@/auth';
import { Role } from '@prisma/client';

export default async function DashboardPage() {
    const session = await auth();
    const stats = await getDashboardStats();

    // Role-Based Data Fetching
    const role = session?.user?.role;
    const isKaProdi = role === Role.KAPRODI || role === Role.UPM; // Both can see basic stats, but we tailor the view
    const isUPM = role === Role.UPM;

    // Fetch Risk Data (For KaProdi focus)
    const riskData = await getRiskAnalysisData(1, 5, 2.75); // Top 5 At Risk
    const riskStudents = 'data' in riskData ? riskData.data : [];

    // Fetch Course Data (For UPM focus)
    const courseData = isUPM ? await getCourseAnalytics() : null;
    const hardestCourses = courseData && !('error' in courseData) ? courseData.hardest : [];
    const easiestCourses = courseData && !('error' in courseData) ? courseData.easiest : [];

    return (
        <div className="flex flex-col flex-1 w-full p-8 pb-40 gap-6">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        {isUPM ? 'Curriculum Overview' : 'Academic Monitor'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Welcome back, {session?.user?.email?.split('@')[0]} ({role})
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-mono text-gray-300">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Bento Grid Stats (Universal) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Students"
                    value={stats.totalStudents}
                    description="Active students in database"
                    iconName="users"
                />
                <StatsCard
                    title="Avg Cohort GPA"
                    value={stats.averageGPA.toFixed(2)}
                    description="Average GPA across all semesters"
                    iconName="graduation"
                />
                <StatsCard
                    title="Course Completion"
                    value={stats.totalSKS}
                    description="Total Academic Records Processed"
                    iconName="book"
                />
                <StatsCard
                    title="Risk Status"
                    value={riskStudents.length.toString()}
                    description="Students requiring attention"
                    iconName="trend"
                />
            </div>

            {/* Adaptive Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart/Table Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* GPA Trend is useful for everyone */}
                    <div>
                        <GPATrendChart data={stats.gpaTrend} />
                    </div>

                    {/* KaProdi Priority: Student Risk List */}
                    <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">At-Risk Students (Recent)</h3>
                            <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
                        </div>
                        <RiskTable students={riskStudents} />
                    </div>
                </div>

                {/* Side Panel: Role Specific */}
                <div className="space-y-6">
                    {isUPM && (
                        <>
                            <CoursePerformanceCard title="Hardest Courses" courses={hardestCourses} type="hardest" />
                            <CoursePerformanceCard title="Easiest Courses" courses={easiestCourses} type="easiest" />
                        </>
                    )}

                    {!isUPM && (
                        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full text-left p-3 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition">
                                    Generate Risk Report
                                </button>
                                <button className="w-full text-left p-3 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition">
                                    Email Warning Notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Extra Spacer for Windows Taskbar */}
            <div className="h-20 w-full" />
        </div>
    );
}
