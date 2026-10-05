import { REPORT_WINDOW_HOURS } from "@/lib/score";
import { getSupabase } from "@/lib/supabase";
import type { Bathroom, Gender } from "@/lib/types";

export type BathroomRecord = Bathroom & {
  avgCleanliness: number | null;
};

type BathroomRow = Bathroom;

type ReportRow = {
  bathroom_id: string;
  cleanliness_rating: number;
};

export async function fetchQueensBathrooms(): Promise<BathroomRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bathrooms")
    .select(
      "id, campus, name, gender, is_accessible, building, floor, latitude, longitude, num_stalls, num_urinals, num_sinks, is_approximate",
    )
    .eq("campus", "queens");

  if (error) throw new Error(error.message);

  const bathrooms = (data ?? []) as BathroomRow[];
  if (bathrooms.length === 0) return [];

  const since = new Date(Date.now() - REPORT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { data: reports, error: reportsError } = await supabase
    .from("bathroom_reports")
    .select("bathroom_id, cleanliness_rating")
    .in(
      "bathroom_id",
      bathrooms.map((bathroom) => bathroom.id),
    )
    .gte("created_at", since);

  if (reportsError) throw new Error(reportsError.message);

  const totals = new Map<string, { sum: number; count: number }>();
  for (const report of (reports ?? []) as ReportRow[]) {
    const current = totals.get(report.bathroom_id) ?? { sum: 0, count: 0 };
    current.sum += Number(report.cleanliness_rating);
    current.count += 1;
    totals.set(report.bathroom_id, current);
  }

  return bathrooms.map((bathroom) => {
    const total = totals.get(bathroom.id);
    return {
      ...bathroom,
      gender: bathroom.gender as Gender,
      latitude: Number(bathroom.latitude),
      longitude: Number(bathroom.longitude),
      floor: Number(bathroom.floor),
      num_stalls: Number(bathroom.num_stalls),
      num_urinals: Number(bathroom.num_urinals),
      num_sinks: Number(bathroom.num_sinks),
      avgCleanliness: total ? total.sum / total.count : null,
    };
  });
}
