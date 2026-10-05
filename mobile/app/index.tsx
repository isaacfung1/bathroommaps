import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { BathroomSheet } from "@/components/bathroom-sheet";
import { CampusMap } from "@/components/campus-map";
import { fetchQueensBathrooms } from "@/lib/bathrooms";
import { CAMPUS_ANCHOR, isOnCampus } from "@/lib/campus";
import { distanceMeters } from "@/lib/geo";
import type { Bathroom, GenderFilter, LatLng, NearbyBathroom } from "@/lib/types";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= 960;

  const [gender, setGender] = useState<GenderFilter>("any");
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [rows, setRows] = useState<Bathroom[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string>();
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadBathrooms = useCallback(async () => {
    setStatus("loading");
    setError(undefined);
    try {
      const bathrooms = await fetchQueensBathrooms();
      setRows(bathrooms);
      setStatus("ready");
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Could not load washrooms.");
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") document.title = "Bathroom Maps";
  }, []);

  useEffect(() => {
    void loadBathrooms();
  }, [loadBathrooms, reloadKey]);

  useEffect(() => {
    let cancelled = false;

    async function locate() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") return;
        const position = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("location timeout")), 8000);
          }),
        ]);
        const point = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        if (!cancelled && isOnCampus(point)) setUserLocation(point);
      } catch {
        // Recommendations fall back to a spot on campus.
      }
    }

    void locate();
    return () => {
      cancelled = true;
    };
  }, []);

  const origin = userLocation ?? CAMPUS_ANCHOR;
  const originLabel = userLocation ? "where you are" : CAMPUS_ANCHOR.label;

  const nearby = useMemo(() => {
    return rows
      .filter((bathroom) => gender === "any" || bathroom.gender === gender)
      .filter((bathroom) => !accessibleOnly || bathroom.is_accessible)
      .map((bathroom): NearbyBathroom => ({
        ...bathroom,
        distanceMeters: distanceMeters(origin, bathroom),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [rows, origin, gender, accessibleOnly]);

  const recommended = nearby[0] ?? null;
  const selected = nearby.find((bathroom) => bathroom.id === selectedId) ?? recommended;
  const recommendedId = recommended?.id ?? null;

  useEffect(() => {
    if (recommendedId) setSelectedId(recommendedId);
  }, [recommendedId]);

  const alternatives = nearby.filter((bathroom) => bathroom.id !== selected?.id).slice(0, 4);

  return (
    <View
      style={[
        styles.root,
        wide && styles.rootWide,
        { paddingBottom: wide ? 0 : insets.bottom },
        Platform.OS === "web" ? ({ height: "100vh" } as unknown as ViewStyle) : null,
      ]}>
      <View style={styles.mapPane}>
        <CampusMap
          bathrooms={nearby}
          selectedId={selected?.id ?? null}
          recommendedId={recommended?.id ?? null}
          userLocation={userLocation}
          onSelect={setSelectedId}
        />
        <View style={[styles.badgeWrap, { top: insets.top + 12, pointerEvents: "none" }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Queen&apos;s · Kingston</Text>
          </View>
        </View>
      </View>
      <BathroomSheet
        status={status}
        error={error}
        originLabel={originLabel}
        gender={gender}
        onGenderChange={setGender}
        accessibleOnly={accessibleOnly}
        onAccessibleOnlyChange={setAccessibleOnly}
        selected={selected}
        recommendedId={recommended?.id ?? null}
        alternatives={alternatives}
        onSelect={setSelectedId}
        onRetry={() => setReloadKey((value) => value + 1)}
        wide={wide}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f7f4ee",
  },
  rootWide: {
    flexDirection: "row",
  },
  mapPane: {
    flex: 1,
    minHeight: 280,
    position: "relative",
  },
  badgeWrap: {
    position: "absolute",
    left: 12,
  },
  badge: {
    backgroundColor: "rgba(247, 244, 238, 0.94)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: "#10233f",
    fontFamily: "Georgia",
    fontSize: 14,
    fontWeight: "700",
  },
});
