import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { floorLabel, formatDistance, formatWalk, genderLabel } from "@/lib/format";
import type { GenderFilter, NearbyBathroom } from "@/lib/types";

type BathroomSheetProps = {
  status: "loading" | "ready" | "error";
  error?: string;
  originLabel: string;
  gender: GenderFilter;
  onGenderChange: (gender: GenderFilter) => void;
  accessibleOnly: boolean;
  onAccessibleOnlyChange: (value: boolean) => void;
  selected: NearbyBathroom | null;
  recommendedId: string | null;
  alternatives: NearbyBathroom[];
  onSelect: (id: string) => void;
  onRetry: () => void;
  wide: boolean;
};

const GENDERS: { id: GenderFilter; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "all_gender", label: "All-gender" },
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
];

export function BathroomSheet({
  status,
  error,
  originLabel,
  gender,
  onGenderChange,
  accessibleOnly,
  onAccessibleOnlyChange,
  selected,
  recommendedId,
  alternatives,
  onSelect,
  onRetry,
  wide,
}: BathroomSheetProps) {
  return (
    <View style={[styles.sheet, wide && styles.sheetWide]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        <Text style={styles.kicker}>Queen&apos;s University</Text>
        <Text style={styles.title}>Closest washroom</Text>
        <Text style={styles.origin}>From {originLabel}</Text>

        <View style={styles.filters}>
          {GENDERS.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              active={gender === option.id}
              onPress={() => onGenderChange(option.id)}
            />
          ))}
          <Chip
            label="Accessible"
            active={accessibleOnly}
            onPress={() => onAccessibleOnlyChange(!accessibleOnly)}
          />
        </View>

        {status === "loading" ? <Text style={styles.body}>Loading washrooms…</Text> : null}
        {status === "error" ? (
          <View style={styles.block}>
            <Text style={styles.body}>{error ?? "Could not load washrooms."}</Text>
            <Pressable onPress={onRetry} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}
        {status === "ready" && !selected ? (
          <Text style={styles.body}>Nothing matches those filters.</Text>
        ) : null}
        {status === "ready" && selected ? (
          <View style={styles.block}>
            <Text style={styles.place}>{selected.building}</Text>
            <Text style={styles.meta}>
              {floorLabel(selected.floor)} · {genderLabel(selected.gender)}
              {selected.is_accessible ? " · Accessible" : ""}
            </Text>
            <Text style={styles.distance}>
              {formatDistance(selected.distanceMeters)} · {formatWalk(selected.distanceMeters)}
            </Text>
            <Text style={styles.capacity}>
              {selected.num_stalls} stalls
              {selected.num_urinals > 0 ? ` · ${selected.num_urinals} urinals` : ""} ·{" "}
              {selected.num_sinks} sinks
            </Text>
            {selected.is_approximate ? (
              <Text style={styles.note}>Pin is at the building, not a surveyed stall.</Text>
            ) : null}
            {selected.id !== recommendedId ? (
              <Pressable
                onPress={() => {
                  if (recommendedId) onSelect(recommendedId);
                }}
                style={styles.linkButton}>
                <Text style={styles.linkText}>Show closest</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {status === "ready" && alternatives.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.section}>Also nearby</Text>
            {alternatives.map((bathroom) => (
              <Pressable
                key={bathroom.id}
                onPress={() => onSelect(bathroom.id)}
                style={styles.alt}>
                <View style={styles.altCopy}>
                  <Text style={styles.altTitle}>{bathroom.building}</Text>
                  <Text style={styles.altMeta}>
                    {floorLabel(bathroom.floor)} · {genderLabel(bathroom.gender)}
                  </Text>
                </View>
                <Text style={styles.altDistance}>{formatDistance(bathroom.distanceMeters)}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "#f7f4ee",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "46%",
  },
  sheetWide: {
    width: 400,
    maxHeight: "100%",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderLeftWidth: 1,
    borderLeftColor: "#e4dccb",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 10,
  },
  kicker: {
    color: "#8a6a12",
    fontFamily: "Georgia",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  title: {
    color: "#10233f",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  origin: {
    color: "#5c6b7a",
    fontSize: 14,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d9d0c0",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: "#10233f",
    borderColor: "#10233f",
  },
  chipText: {
    color: "#10233f",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#f7f4ee",
  },
  block: {
    gap: 4,
    marginTop: 6,
  },
  place: {
    color: "#10233f",
    fontSize: 20,
    fontWeight: "700",
  },
  meta: {
    color: "#3d4d5c",
    fontSize: 15,
  },
  distance: {
    color: "#10233f",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  capacity: {
    color: "#5c6b7a",
    fontSize: 14,
  },
  note: {
    color: "#8a7560",
    fontSize: 13,
    marginTop: 4,
  },
  body: {
    color: "#3d4d5c",
    fontSize: 15,
    marginTop: 8,
  },
  retry: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#10233f",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: {
    color: "#f7f4ee",
    fontWeight: "700",
  },
  linkButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  linkText: {
    color: "#1f4e79",
    fontWeight: "700",
  },
  section: {
    color: "#10233f",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 4,
  },
  alt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4dccb",
  },
  altCopy: { flex: 1, gap: 2 },
  altTitle: {
    color: "#10233f",
    fontSize: 15,
    fontWeight: "600",
  },
  altMeta: {
    color: "#5c6b7a",
    fontSize: 13,
  },
  altDistance: {
    color: "#10233f",
    fontSize: 13,
    fontWeight: "700",
  },
});
