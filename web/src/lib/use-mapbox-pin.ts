import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { useEffect, useRef, useState, type RefObject } from "react";
import { MAPBOX_TOKEN } from "@/lib/location-lookup";
import type { GeoPoint } from "@/server/types/address.types";

type MapboxModule = typeof import("mapbox-gl").default;

const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
const STYLE = "mapbox://styles/mapbox/streets-v12";
const PIN_ZOOM = 15;

export function useMapboxPin(value: GeoPoint | null, onChange: (point: GeoPoint) => void): RefObject<HTMLDivElement | null> {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const mapbox = useRef<MapboxModule | null>(null);
  const handler = useRef<(point: GeoPoint) => void>(onChange);
  const initial = useRef<GeoPoint | null>(value);
  const [ready, setReady] = useState<boolean>(false);

  useEffect((): void => {
    handler.current = onChange;
  }, [onChange]);

  useEffect((): (() => void) | void => {
    if (!MAPBOX_TOKEN || !container.current) return;
    let cancelled: boolean = false;
    void import("mapbox-gl").then(({ default: mapboxgl }): void => {
      if (cancelled || !container.current) return;
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const start: GeoPoint | null = initial.current;
      const instance: MapboxMap = new mapboxgl.Map({
        container: container.current,
        style: STYLE,
        center: start ? [start.lng, start.lat] : INDIA_CENTER,
        zoom: start ? PIN_ZOOM : 3.5,
      });
      instance.on("click", (event): void => handler.current({ lat: event.lngLat.lat, lng: event.lngLat.lng }));
      mapbox.current = mapboxgl;
      map.current = instance;
      setReady(true);
    });
    return (): void => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
      setReady(false);
    };
  }, []);

  useEffect((): void => {
    const instance: MapboxMap | null = map.current;
    const lib: MapboxModule | null = mapbox.current;
    if (!ready || !instance || !lib) return;
    if (!value) {
      marker.current?.remove();
      marker.current = null;
      return;
    }
    const center: [number, number] = [value.lng, value.lat];
    if (marker.current) {
      marker.current.setLngLat(center);
    } else {
      const pin: Marker = new lib.Marker({ draggable: true }).setLngLat(center).addTo(instance);
      pin.on("dragend", (): void => handler.current({ lat: pin.getLngLat().lat, lng: pin.getLngLat().lng }));
      marker.current = pin;
    }
    instance.flyTo({ center, zoom: Math.max(instance.getZoom(), PIN_ZOOM) });
  }, [value, ready]);

  return container;
}
