'use server';

import { auth } from '@/auth';
import { courseService } from '@/lib/services/course-service';

export async function getCourseAnalytics() {
    const session = await auth();
    if (!session || session.user.role !== 'UPM') return { error: "Unauthorized" };

    try {
        const hardest = await courseService.getCoursePerformance(5, 'hardest');
        const easiest = await courseService.getCoursePerformance(5, 'easiest');

        return { hardest, easiest };
    } catch (e) {
        console.error(e);
        return { error: "Failed to fetch course analytics" };
    }
}
