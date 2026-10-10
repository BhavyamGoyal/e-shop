import type { GeoPoint } from "@/server/types/address.types";

const GEOCODE_URL = "https://api.mapbox.com/search/geocode/v6/forward";

export const MAPBOX_TOKEN: string | undefined = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function currentPosition(): Promise<GeoPoint> {
  return new Promise<GeoPoint>((resolve, reject): void => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported on this device"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition): void =>
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (): void => reject(new Error("Could not read your location. Allow location access and try again.")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

export async function geocode(query: string): Promise<GeoPoint | null> {
  if (!MAPBOX_TOKEN) return null;
  const params: URLSearchParams = new URLSearchParams({ q: query, access_token: MAPBOX_TOKEN, limit: "1", country: "in" });
  const response: Response = await fetch(`${GEOCODE_URL}?${params.toString()}`);
  if (!response.ok) throw new Error("Search failed");
  const body: { features?: { geometry: { coordinates: [number, number] } }[] } = await response.json();
  const coordinates: [number, number] | undefined = body.features?.[0]?.geometry.coordinates;
  return coordinates ? { lng: coordinates[0], lat: coordinates[1] } : null;
}
