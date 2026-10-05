import { distanceMeters } from "@/lib/geo";
import type { LatLng } from "@/lib/types";

export const QUEENS_CENTER: LatLng = {
  latitude: 44.2267,
  longitude: -76.4953,
};

/** Sidewalk between Stauffer Library and the John Deutsch University Centre. */
export const CAMPUS_ANCHOR: LatLng & { label: string } = {
  latitude: 44.22835,
  longitude: -76.49555,
  label: "the front of Stauffer Library",
};

export function isOnCampus(point: LatLng): boolean {
  return distanceMeters(point, QUEENS_CENTER) < 1_500;
}
