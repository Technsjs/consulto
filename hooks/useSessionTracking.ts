"use client";

import { apiUpdateLocation } from "@/lib/api";
import { useEffect, useRef } from "react";

export function useSessionLocation(enabled: boolean) {
  const requested = useRef(false);

  useEffect(() => {
    if (!enabled || requested.current) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    requested.current = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void apiUpdateLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        // User denied or unavailable — IP location still works server-side.
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 12_000,
      },
    );
  }, [enabled]);
}
