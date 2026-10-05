import { createElement, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CAMPUS_ANCHOR } from "@/lib/campus";
import type { LatLng, NearbyBathroom } from "@/lib/types";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const MAPLIBRE_JS = "https://unpkg.com/maplibre-gl@5.6.1/dist/maplibre-gl.js";
const MAPLIBRE_CSS = "https://unpkg.com/maplibre-gl@5.6.1/dist/maplibre-gl.css";

type CampusMapProps = {
  bathrooms: NearbyBathroom[];
  selectedId: string | null;
  recommendedId: string | null;
  userLocation: LatLng | null;
  onSelect: (id: string) => void;
};

type MapLibreMap = {
  remove: () => void;
  getZoom: () => number;
  easeTo: (options: { center: [number, number]; zoom: number; duration: number }) => void;
  addControl: (control: unknown, position?: string) => void;
  on: (event: string, handler: () => void) => void;
};

type MapLibreMarker = { remove: () => void };

type MapLibreNamespace = {
  Map: new (options: {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
  }) => MapLibreMap;
  Marker: new (options: { element: HTMLElement; anchor: string }) => {
    setLngLat: (lngLat: [number, number]) => { addTo: (map: MapLibreMap) => MapLibreMarker };
  };
  NavigationControl: new () => unknown;
};

declare global {
  interface Window {
    maplibregl?: MapLibreNamespace;
  }
}

function loadMapLibre(): Promise<MapLibreNamespace> {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);

  return new Promise((resolve, reject) => {
    if (!document.querySelector("link[data-maplibre]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = MAPLIBRE_CSS;
      link.dataset.maplibre = "true";
      document.head.appendChild(link);
    }

    const existing = document.querySelector("script[data-maplibre]");
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.maplibregl) resolve(window.maplibregl);
        else reject(new Error("Map failed to load."));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = MAPLIBRE_JS;
    script.dataset.maplibre = "true";
    script.onload = () => {
      if (window.maplibregl) resolve(window.maplibregl);
      else reject(new Error("Map failed to load."));
    };
    script.onerror = () => reject(new Error("Map failed to load."));
    document.head.appendChild(script);
  });
}

function pinElement(bathroom: NearbyBathroom, selected: boolean, recommended: boolean) {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", bathroom.name);
  button.style.border = "none";
  button.style.padding = "0";
  button.style.background = "transparent";
  button.style.cursor = "pointer";
  button.style.display = "flex";
  button.style.flexDirection = "column";
  button.style.alignItems = "center";

  const pin = document.createElement("div");
  const size = selected ? 22 : 16;
  pin.style.width = `${size}px`;
  pin.style.height = `${size}px`;
  pin.style.borderRadius = "999px";
  pin.style.background = recommended ? "#f0b429" : "#1f4e79";
  pin.style.border = selected ? "3px solid #10233f" : "2px solid white";
  pin.style.boxShadow = "0 1px 4px rgba(16, 35, 63, 0.45)";
  button.appendChild(pin);

  if (selected) {
    const label = document.createElement("div");
    label.textContent = bathroom.building;
    label.style.marginTop = "4px";
    label.style.background = "#10233f";
    label.style.color = "white";
    label.style.font = "600 12px system-ui, sans-serif";
    label.style.padding = "3px 8px";
    label.style.borderRadius = "999px";
    label.style.whiteSpace = "nowrap";
    button.appendChild(label);
  }

  return button;
}

export function CampusMap({
  bathrooms,
  selectedId,
  recommendedId,
  userLocation,
  onSelect,
}: CampusMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const bathroomsRef = useRef(bathrooms);
  const onSelectRef = useRef(onSelect);
  bathroomsRef.current = bathrooms;
  const [mapError, setMapError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let map: MapLibreMap | null = null;

    loadMapLibre()
      .then((maplibregl) => {
        if (cancelled || !containerRef.current) return;
        map = new maplibregl.Map({
          container: containerRef.current,
          style: MAP_STYLE,
          center: [CAMPUS_ANCHOR.longitude, CAMPUS_ANCHOR.latitude],
          zoom: 15.6,
        });
        map.addControl(new maplibregl.NavigationControl(), "bottom-right");
        mapRef.current = map;
        map.on("load", () => {
          if (!cancelled) setReady(true);
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : "Map failed to load.");
        }
      });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    let maplibregl: MapLibreNamespace;
    if (!window.maplibregl) return;
    maplibregl = window.maplibregl;

    const markers: MapLibreMarker[] = [];
    for (const bathroom of bathrooms) {
      const element = pinElement(
        bathroom,
        bathroom.id === selectedId,
        bathroom.id === recommendedId,
      );
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectRef.current(bathroom.id);
      });
      markers.push(
        new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat([bathroom.longitude, bathroom.latitude])
          .addTo(map),
      );
    }

    if (userLocation) {
      const dot = document.createElement("div");
      dot.setAttribute("aria-label", "Your location");
      dot.style.width = "16px";
      dot.style.height = "16px";
      dot.style.borderRadius = "999px";
      dot.style.background = "#2f80ed";
      dot.style.border = "3px solid white";
      dot.style.boxShadow = "0 0 0 6px rgba(47, 128, 237, 0.25)";
      markers.push(
        new maplibregl.Marker({ element: dot, anchor: "center" })
          .setLngLat([userLocation.longitude, userLocation.latitude])
          .addTo(map),
      );
    }

    return () => {
      for (const marker of markers) marker.remove();
    };
  }, [bathrooms, selectedId, recommendedId, userLocation, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const bathroom = bathroomsRef.current.find((item) => item.id === selectedId);
    if (!map || !ready || !bathroom) return;
    map.easeTo({
      center: [bathroom.longitude, bathroom.latitude],
      zoom: Math.max(map.getZoom(), 16.4),
      duration: 650,
    });
  }, [selectedId, ready]);

  return (
    <View style={styles.fill}>
      {createElement("div", {
        ref: containerRef,
        style: { position: "absolute", inset: "0" },
      })}
      {mapError ? <Text style={styles.error}>{mapError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  error: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    color: "#10233f",
    padding: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
});
