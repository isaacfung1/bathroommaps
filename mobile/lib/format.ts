import type { Gender } from "@/lib/types";

export function genderLabel(gender: Gender): string {
  if (gender === "women") return "Women's";
  if (gender === "men") return "Men's";
  return "All-gender";
}

export function floorLabel(floor: number): string {
  return `Floor ${floor}`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatWalk(meters: number): string {
  const minutes = Math.max(1, Math.round(meters / 80));
  return minutes === 1 ? "1 min walk" : `${minutes} min walk`;
}
