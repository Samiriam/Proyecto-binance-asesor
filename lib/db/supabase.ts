import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Crear cliente de Supabase
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Verificar si Supabase está configurado
export const isSupabaseConfigured = () => !!supabase;

// Tabla de auditoría
export interface AuditRecord {
  id?: number;
  generated_at: string;
  recommendation_type: string;
  asset: string;
  amount_suggested: number;
  duration_days: number;
  reason: string;
  payload: any;
  created_at?: string;
}

// Guardar registro de auditoría
export async function saveAudit(record: AuditRecord): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping audit save");
    return;
  }

  try {
    const { error } = await supabase!
      .from('audits')
      .insert([record]);

    if (error) {
      console.error("Error saving audit to Supabase:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in saveAudit:", error);
    throw error;
  }
}

// Obtener historial de auditoría
export async function getAuditHistory(limit: number = 50): Promise<AuditRecord[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty audit history");
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching audit history:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAuditHistory:", error);
    throw error;
  }
}

// Obtener registro de auditoría por ID
export async function getAuditById(id: number): Promise<AuditRecord | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching audit by ID:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in getAuditById:", error);
    throw error;
  }
}
