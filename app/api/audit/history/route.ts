import { NextResponse } from "next/server";
import { getAuditHistory } from "@/lib/db";
import { verifySessionFromRequest } from "@/lib/auth/session";

export async function GET(request: Request) {
  if (!(await verifySessionFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 50;

    const data = await getAuditHistory(limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching audit history:", error);
    return NextResponse.json(
      { error: "Error fetching audit history" },
      { status: 500 }
    );
  }
}
