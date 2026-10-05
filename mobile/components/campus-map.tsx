import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

import { CAMPUS_ANCHOR, CAMPUS_BOUNDS, MIN_ZOOM } from "@/lib/campus";
import type { LatLng, NearbyBathroom } from "@/lib/types";

type CampusMapProps = {
  bathrooms: NearbyBathroom[];
  selectedId: string | null;
  recommendedId: string | null;
  userLocation: LatLng | null;
  onSelect: (id: string) => void;
};

export function CampusMap({
  bathrooms,
  selectedId,
  recommendedId,
  userLocation,
  onSelect,
}: CampusMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const focus = bathrooms.find((bathroom) => bathroom.id === selectedId);
    if (!focus) return;
    mapRef.current?.animateToRegion(
      {
        latitude: focus.latitude,
        longitude: focus.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      400,
    );
  }, [selectedId, bathrooms]);

  function keepOnCampus(region: Region) {
    const latitude = Math.min(Math.max(region.latitude, CAMPUS_BOUNDS.south), CAMPUS_BOUNDS.north);
    const longitude = Math.min(Math.max(region.longitude, CAMPUS_BOUNDS.west), CAMPUS_BOUNDS.east);
    if (latitude !== region.latitude || longitude !== region.longitude) {
      mapRef.current?.animateToRegion({ ...region, latitude, longitude }, 250);
    }
  }

  return (
    <View style={styles.fill}>
      <MapView
        ref={mapRef}
        style={styles.fill}
        initialRegion={{
          latitude: CAMPUS_ANCHOR.latitude,
          longitude: CAMPUS_ANCHOR.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }}
        minZoomLevel={MIN_ZOOM}
        onRegionChangeComplete={keepOnCampus}
        showsUserLocation={userLocation != null}
      >
        {bathrooms.map((bathroom) => {
          const selected = bathroom.id === selectedId;
          const recommended = bathroom.id === recommendedId;
          return (
            <Marker
              key={bathroom.id}
              coordinate={{ latitude: bathroom.latitude, longitude: bathroom.longitude }}
              title={bathroom.building}
              description={bathroom.name}
              pinColor={recommended ? "#f0b429" : selected ? "#10233f" : "#1f4e79"}
              onPress={() => onSelect(bathroom.id)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
