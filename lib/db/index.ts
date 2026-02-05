import { getSupabase } from "./supabase";

export interface AuditRecord {
  id?: number;
  generated_at: string;
  recommendation_type: string;
  asset: string;
  amount_suggested: number;
  duration_days: number;
  reason: string;
  payload: any;
}

const AUDIT_TABLE = "advisor_audit";

export async function saveAudit(record: AuditRecord): Promise<void> {
  const client = getSupabase();
  if (!client) {
    console.warn("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set, skipping audit");
    return;
  }

  try {
    const { error } = await client.from(AUDIT_TABLE).insert([
      {
        generated_at: record.generated_at,
        recommendation_type: record.recommendation_type,
        asset: record.asset,
        amount_suggested: record.amount_suggested,
        duration_days: record.duration_days,
        reason: record.reason,
        payload: record.payload ?? {}
      }
    ]);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error saving audit:", error);
    throw error;
  }
}

export async function getAuditHistory(limit: number = 50): Promise<AuditRecord[]> {
  const client = getSupabase();
  if (!client) {
    console.warn("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set, returning empty history");
    return [];
  }

  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(200, limit)) : 50;

  try {
    const { data, error } = await client
      .from(AUDIT_TABLE)
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(safeLimit);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  } catch (error) {
    console.error("Error fetching audit history:", error);
    throw error;
  }
}
