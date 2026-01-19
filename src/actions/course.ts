'use server';

import { auth } from '@/auth';
import { courseService } from '@/lib/services/course-service';

export async function getCourseAnalytics() {
    const session = await auth();
    if (!session || session.user.role !== 'UPM') return { error: "Unauthorized" };

    try {
        const difficultyAnalysis = await courseService.getAllCoursesSorted();
        return { difficultyAnalysis };
    } catch (e) {
        console.error(e);
        return { error: "Failed to fetch course analytics" };
    }
}
