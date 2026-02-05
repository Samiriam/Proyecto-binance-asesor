import { NextResponse } from "next/server";
import { getConfig, normalizeConfig, saveConfig } from "@/lib/config";
import { verifySessionFromRequest } from "@/lib/auth/session";

export async function GET(request: Request) {
  if (!(await verifySessionFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json({ error: "Error fetching config" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifySessionFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const nextConfig = normalizeConfig(body);
    await saveConfig(nextConfig);
    return NextResponse.json(nextConfig);
  } catch (error) {
    console.error("Error saving config:", error);
    return NextResponse.json({ error: "Error saving config" }, { status: 500 });
  }
}
