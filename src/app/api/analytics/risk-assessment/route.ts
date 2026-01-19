
import { auth } from "@/auth";
import { studentService } from "@/lib/services/student-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth();

    // PB-SEC-02: Protect Endpoint
    if (!session || (session.user.role !== 'UPM' && session.user.role !== 'KAPRODI')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const threshold = Number(searchParams.get("threshold")) || 2.75;
    const semester = searchParams.get("semester") ? Number(searchParams.get("semester")) : undefined;

    try {
        const result = await studentService.getAtRiskStudents(threshold, page, limit, semester);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Risk API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
