import { NextResponse } from "next/server";
import { verifySessionFromRequest } from "@/lib/auth/session";
import { getPerformanceStats } from "@/lib/db/performance";

export async function GET(request: Request) {
    if (!(await verifySessionFromRequest(request))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const stats = await getPerformanceStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching performance stats:", error);
        return NextResponse.json(
            { error: "Error fetching performance stats" },
            { status: 500 }
        );
    }
}
