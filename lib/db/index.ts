// Cliente de base de datos para auditoría
// Compatible con Postgres (Neon, Supabase) o Vercel KV

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

// Función para guardar registro de auditoría
export async function saveAudit(record: AuditRecord): Promise<void> {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.warn("DATABASE_URL no configurado, omitiendo auditoría");
    return;
  }

  try {
    // Aquí iría la implementación con pg o @vercel/postgres
    // Por ahora es un placeholder
    console.log("Guardando auditoría:", record);
  } catch (error) {
    console.error("Error guardando auditoría:", error);
    throw error;
  }
}

// Función para obtener historial de auditoría
export async function getAuditHistory(limit: number = 50): Promise<AuditRecord[]> {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.warn("DATABASE_URL no configurado, retornando historial vacío");
    return [];
  }

  try {
    // Aquí iría la implementación con pg o @vercel/postgres
    // Por ahora es un placeholder
    console.log("Obteniendo historial de auditoría, límite:", limit);
    return [];
  } catch (error) {
    console.error("Error obteniendo historial de auditoría:", error);
    throw error;
  }
}
