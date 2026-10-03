"use client";

import { useEffect, useRef } from "react";
import { playScannerSound, triggerHapticFeedback } from "../utils/scannerFeedback";

interface UseScannerGunWedgeOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minBarcodeLength?: number;
}

/**
 * Custom hook to intercept rapid keyboard wedge events from hardware laser barcode scanners.
 * Hardware scanners (Bluetooth/USB) emulate keystrokes with < 45ms intervals ending in 'Enter'.
 */
export function useScannerGunWedge({
  onScan,
  enabled = true,
  minBarcodeLength = 3,
}: UseScannerGunWedgeOptions) {
  const keyBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Allow regular typing if the user is focused on an input or textarea
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (keyBufferRef.current.length >= minBarcodeLength) {
          const barcode = keyBufferRef.current.trim();
          keyBufferRef.current = "";
          playScannerSound("success");
          triggerHapticFeedback([100]);
          onScan(barcode);
        }
        keyBufferRef.current = "";
      } else if (e.key.length === 1) {
        // Laser scanners stream characters rapidly (< 200ms threshold)
        if (timeDiff > 200) {
          keyBufferRef.current = "";
        }
        keyBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [enabled, minBarcodeLength, onScan]);
}
