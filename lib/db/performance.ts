import { getSupabase } from "./supabase";

const TABLE = "performance_snapshots";

export interface PerformanceSnapshot {
    id?: number;
    audit_id: number;
    asset: string;
    recommendation_type: string;
    price_at_recommendation: number;
    price_after?: number;
    days_to_track: number;
    days_tracked?: number;
    predicted_direction?: string;
    actual_direction?: string;
    predicted_change_pct?: number;
    actual_change_pct?: number;
    was_correct?: boolean;
    created_at?: string;
    evaluated_at?: string;
}

export interface PerformanceStats {
    total_predictions: number;
    correct_predictions: number;
    win_rate: number;
    avg_predicted_change: number;
    avg_actual_change: number;
    current_streak: number;
    streak_type: "win" | "loss" | "none";
    recent: PerformanceSnapshot[];
}

/**
 * Save a snapshot when a recommendation is created.
 */
export async function savePerformanceSnapshot(
    auditId: number,
    asset: string,
    recommendationType: string,
    priceAtRecommendation: number,
    predictedDirection: string,
    predictedChangePct: number,
    daysToTrack: number = 7
): Promise<void> {
    const client = getSupabase();
    if (!client) {
        console.warn("Supabase not configured, skipping performance snapshot");
        return;
    }

    const { error } = await client.from(TABLE).insert([{
        audit_id: auditId,
        asset,
        recommendation_type: recommendationType,
        price_at_recommendation: priceAtRecommendation,
        days_to_track: daysToTrack,
        predicted_direction: predictedDirection,
        predicted_change_pct: predictedChangePct,
    }]);

    if (error) {
        console.error("Error saving performance snapshot:", error.message);
        throw error;
    }
}

/**
 * Evaluate pending snapshots: fetch current price and determine if prediction was correct.
 */
export async function evaluatePendingSnapshots(
    getPriceFn: (asset: string) => Promise<number>
): Promise<number> {
    const client = getSupabase();
    if (!client) return 0;

    // Get snapshots that haven't been evaluated and are old enough
    const { data: pending, error } = await client
        .from(TABLE)
        .select("*")
        .is("evaluated_at", null)
        .lte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // at least 1 day old
        .limit(50);

    if (error || !pending?.length) return 0;

    let evaluated = 0;

    for (const snap of pending) {
        try {
            const daysSince = Math.floor(
                (Date.now() - new Date(snap.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            // Only evaluate if enough days have passed
            if (daysSince < snap.days_to_track) continue;

            const currentPrice = await getPriceFn(snap.asset);
            if (!currentPrice || currentPrice <= 0) continue;

            const changePct = ((currentPrice - snap.price_at_recommendation) / snap.price_at_recommendation) * 100;
            const actualDirection = changePct > 0.5 ? "UP" : changePct < -0.5 ? "DOWN" : "NEUTRAL";

            // A prediction is correct if:
            // - Predicted UP and price went UP
            // - Predicted DOWN and price went DOWN
            // - Predicted NEUTRAL and price stayed within ±0.5%
            const wasCorrect =
                snap.predicted_direction === actualDirection ||
                (snap.predicted_direction === "NEUTRAL" && Math.abs(changePct) < 2);

            const { error: updateError } = await client
                .from(TABLE)
                .update({
                    price_after: currentPrice,
                    days_tracked: daysSince,
                    actual_direction: actualDirection,
                    actual_change_pct: parseFloat(changePct.toFixed(4)),
                    was_correct: wasCorrect,
                    evaluated_at: new Date().toISOString(),
                })
                .eq("id", snap.id);

            if (!updateError) evaluated++;
        } catch (err) {
            console.error(`Error evaluating snapshot ${snap.id}:`, err);
        }
    }

    return evaluated;
}

/**
 * Get performance statistics.
 */
export async function getPerformanceStats(): Promise<PerformanceStats> {
    const client = getSupabase();
    const defaultStats: PerformanceStats = {
        total_predictions: 0,
        correct_predictions: 0,
        win_rate: 0,
        avg_predicted_change: 0,
        avg_actual_change: 0,
        current_streak: 0,
        streak_type: "none",
        recent: [],
    };

    if (!client) return defaultStats;

    // Get evaluated snapshots
    const { data: evaluated, error: evalError } = await client
        .from(TABLE)
        .select("*")
        .not("evaluated_at", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);

    if (evalError || !evaluated?.length) return defaultStats;

    const correct = evaluated.filter((s: any) => s.was_correct === true);
    const totalPredChange = evaluated.reduce((sum: number, s: any) => sum + (s.predicted_change_pct ?? 0), 0);
    const totalActualChange = evaluated.reduce((sum: number, s: any) => sum + (s.actual_change_pct ?? 0), 0);

    // Calculate streak
    let streak = 0;
    let streakType: "win" | "loss" | "none" = "none";
    for (const snap of evaluated) {
        if (streakType === "none") {
            streakType = snap.was_correct ? "win" : "loss";
            streak = 1;
        } else if ((streakType === "win" && snap.was_correct) || (streakType === "loss" && !snap.was_correct)) {
            streak++;
        } else {
            break;
        }
    }

    // Get recent including pending
    const { data: recent } = await client
        .from(TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

    return {
        total_predictions: evaluated.length,
        correct_predictions: correct.length,
        win_rate: evaluated.length > 0 ? (correct.length / evaluated.length) * 100 : 0,
        avg_predicted_change: evaluated.length > 0 ? totalPredChange / evaluated.length : 0,
        avg_actual_change: evaluated.length > 0 ? totalActualChange / evaluated.length : 0,
        current_streak: streak,
        streak_type: streakType,
        recent: recent ?? [],
    };
}
