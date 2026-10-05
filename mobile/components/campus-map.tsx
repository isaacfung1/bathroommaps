import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { CAMPUS_ANCHOR } from "@/lib/campus";
import type { LatLng, ScoredBathroom } from "@/lib/types";

type CampusMapProps = {
  bathrooms: ScoredBathroom[];
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
