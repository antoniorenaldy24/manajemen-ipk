
import prisma from '../db';

export async function refreshAnalyticsViews() {
    console.log("[Maintenance] Refreshing Analytics Views...");
    try {
        await prisma.$executeRaw`REFRESH MATERIALIZED VIEW "mv_student_risk"`;
        await prisma.$executeRaw`REFRESH MATERIALIZED VIEW "mv_course_stats"`;
        console.log("[Maintenance] Refresh Complete.");
    } catch (error) {
        console.error("[Maintenance] Refresh Failed:", error);
    }
}
