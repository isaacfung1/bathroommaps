import { getSupabase } from "@/lib/supabase";
import type { Bathroom, Gender } from "@/lib/types";

export async function fetchQueensBathrooms(): Promise<Bathroom[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bathrooms")
    .select(
      "id, campus, name, gender, is_accessible, building, floor, latitude, longitude, num_stalls, num_urinals, num_sinks, is_approximate",
    )
    .eq("campus", "queens");

  if (error) throw new Error(error.message);

  return ((data ?? []) as Bathroom[]).map((bathroom) => ({
    ...bathroom,
    gender: bathroom.gender as Gender,
    latitude: Number(bathroom.latitude),
    longitude: Number(bathroom.longitude),
    floor: Number(bathroom.floor),
    num_stalls: Number(bathroom.num_stalls),
    num_urinals: Number(bathroom.num_urinals),
    num_sinks: Number(bathroom.num_sinks),
  }));
}
