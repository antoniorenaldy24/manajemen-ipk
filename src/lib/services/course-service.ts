import prisma from '../db';
import { Prisma } from '@prisma/client';

export interface CoursePerformanceData {
    course_code: string;
    course_name: string;
    total_students: number;
    avg_grade: number;
    fail_count: number;
    pass_rate: number;
}

export class CourseService {

    /**
     * Retrieves course performance metrics from Materialized View.
     */
    async getCoursePerformance(limit: number = 10, sort: 'hardest' | 'easiest' = 'hardest'): Promise<CoursePerformanceData[]> {

        // raw query to MV
        const order = sort === 'hardest' ? 'ASC' : 'DESC'; // Low Grade = Hard

        const rows = await prisma.$queryRaw<any[]>`
            SELECT 
                course_code, 
                course_name, 
                total_students, 
                avg_grade, 
                fail_count
            FROM "mv_course_stats"
            ORDER BY avg_grade ${order === 'ASC' ? Prisma.sql`ASC` : Prisma.sql`DESC`}
            LIMIT ${limit}
        `;

        if (!rows || rows.length === 0) return [];

        return rows.map((r: any) => ({
            course_code: r.course_code,
            course_name: r.course_name,
            total_students: Number(r.total_students),
            avg_grade: Number(r.avg_grade),
            fail_count: Number(r.fail_count),
            pass_rate: Number(r.total_students) > 0
                ? (1 - (Number(r.fail_count) / Number(r.total_students))) * 100
                : 0
        }));
    }

    /**
     * Retrieves all course performance metrics sorted by difficulty (Avg Grade).
     * Hardest (Lowest Grade) -> Easiest (Highest Grade)
     */
    async getAllCoursesSorted(): Promise<CoursePerformanceData[]> {
        const rows = await prisma.$queryRaw<any[]>`
            SELECT 
                course_code, 
                course_name, 
                total_students, 
                avg_grade, 
                fail_count
            FROM "mv_course_stats"
            ORDER BY avg_grade ASC
        `;

        if (!rows || rows.length === 0) return [];

        return rows.map((r: any) => ({
            course_code: r.course_code,
            course_name: r.course_name,
            total_students: Number(r.total_students),
            avg_grade: Number(r.avg_grade),
            fail_count: Number(r.fail_count),
            pass_rate: Number(r.total_students) > 0
                ? (1 - (Number(r.fail_count) / Number(r.total_students))) * 100
                : 0
        }));
    }
}

export const courseService = new CourseService();
