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

/** The map cannot pan outside this box, which covers the on-campus radius. */
export const CAMPUS_BOUNDS = {
  south: 44.212,
  west: -76.516,
  north: 44.241,
  east: -76.474,
};

export const MIN_ZOOM = 14.5;

export function isOnCampus(point: LatLng): boolean {
  return distanceMeters(point, QUEENS_CENTER) < 1_500;
}
