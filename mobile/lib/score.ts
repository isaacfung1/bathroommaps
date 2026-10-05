/** Hours of cleanliness reports that still count toward a recommendation. */
export const REPORT_WINDOW_HOURS = 24;

type ScoreInput = {
  distanceMeters: number;
  avgCleanliness: number | null;
  capacity: number;
  userFloor: number;
  bathroomFloor: number;
};

/**
 * Lower is better. Distance, dirtiness, floor change, and crowding are
 * scaled onto similar ranges so a long walk does not automatically win
 * over a dirty washroom a few metres away.
 */
export function scoreBathroom(input: ScoreInput): number {
  const cleanliness = input.avgCleanliness ?? 3;
  const distanceTerm = Math.min(input.distanceMeters / 250, 2);
  const dirtiness = (5 - cleanliness) / 4;
  const floorTerm = Math.min(Math.abs(input.userFloor - input.bathroomFloor), 4) / 4;
  const capacityTerm = 1 / Math.max(input.capacity, 1);

  return 0.55 * distanceTerm + 0.25 * dirtiness + 0.15 * floorTerm + 0.05 * capacityTerm;
}
