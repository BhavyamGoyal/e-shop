"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import { Button, Input, Label, Text } from "../atoms";
import { AlertMessage } from "../molecules";
import { currentPosition, geocode, MAPBOX_TOKEN } from "@/lib/location-lookup";
import { useMapboxPin } from "@/lib/use-mapbox-pin";
import type { GeoPoint } from "@/server/types/address.types";

interface LocationPickerProps {
  value: GeoPoint | null;
  onChange: (point: GeoPoint | null) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const container = useMapboxPin(value, onChange);
  const [query, setQuery] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const run = async (lookup: () => Promise<GeoPoint | null>, notFound: string): Promise<void> => {
    setBusy(true);
    setError("");
    try {
      const point: GeoPoint | null = await lookup();
      if (point) onChange(point);
      else setError(notFound);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (!MAPBOX_TOKEN) return <AlertMessage tone="danger" message="Map is unavailable: NEXT_PUBLIC_MAPBOX_TOKEN is not set." />;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="location-search">GPS location (optional)</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id="location-search"
          value={query}
          onChange={(event): void => setQuery(event.target.value)}
          onKeyDown={(event): void => {
            if (event.key !== "Enter" || !query.trim()) return;
            event.preventDefault();
            void run((): Promise<GeoPoint | null> => geocode(query.trim()), "No matching place found");
          }}
          placeholder="Search a place or area"
          className="min-w-0 flex-1"
        />
        <Button variant="outline" tone="secondary" disabled={busy || !query.trim()} onClick={(): void => void run((): Promise<GeoPoint | null> => geocode(query.trim()), "No matching place found")}>
          Search
        </Button>
        <Button variant="outline" tone="secondary" disabled={busy} onClick={(): void => void run(currentPosition, "Location unavailable")}>
          Use my location
        </Button>
      </div>
      <div ref={container} className="h-64 w-full overflow-hidden rounded-lg border" />
      <div className="flex items-center justify-between gap-3">
        <Text tone="muted" className="text-xs">
          {value
            ? `Pinned at ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}. Drag the pin to adjust.`
            : "Click the map to drop a pin, search, or use your current location."}
        </Text>
        {value && (
          <Button size="sm" variant="ghost" onClick={(): void => onChange(null)}>
            Remove pin
          </Button>
        )}
      </div>
      {error && <AlertMessage tone="danger" message={error} />}
    </div>
  );
}
