export type Gender = "women" | "men" | "all_gender";

export type GenderFilter = "any" | Gender;

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type Bathroom = {
  id: string;
  campus: string;
  name: string;
  gender: Gender;
  is_accessible: boolean;
  building: string;
  floor: number;
  latitude: number;
  longitude: number;
  num_stalls: number;
  num_urinals: number;
  num_sinks: number;
  is_approximate: boolean;
};

export type NearbyBathroom = Bathroom & {
  distanceMeters: number;
};
