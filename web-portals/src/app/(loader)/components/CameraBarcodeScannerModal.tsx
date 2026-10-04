"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, X, Flashlight, RefreshCw, AlertCircle, Barcode } from "lucide-react";
import { playScannerSound, triggerHapticFeedback } from "../utils/scannerFeedback";

interface CameraBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  availablePalletSkus?: string[];
}

export default function CameraBarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  availablePalletSkus = [],
}: CameraBarcodeScannerModalProps) {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [manualSku, setManualSku] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "loader-barcode-reader";

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    let isMounted = true;
    setIsInitializing(true);
    setScannerError(null);

    const startScanner = async () => {
      try {
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ];

        const html5QrCode = new Html5Qrcode(readerElementId, {
          formatsToSupport,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        const config = {
          fps: 20,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => ({
            width: Math.min(290, Math.floor(viewfinderWidth * 0.88)),
            height: Math.min(160, Math.floor(viewfinderHeight * 0.55)),
          }),
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (!isMounted) return;
            playScannerSound("success");
            triggerHapticFeedback([100]);
            onScanSuccess(decodedText);
            onClose();
          },
          () => {
            // Frame parse error (ignore continuous scan misses)
          }
        );

        if (isMounted) setIsInitializing(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.warn("Camera init warning:", err);
        setScannerError(
          "Camera access unavailable or permission denied. You can use the quick-scan buttons or manual SKU input below."
        );
        setIsInitializing(false);
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSku.trim()) return;
    playScannerSound("success");
    triggerHapticFeedback([80]);
    onScanSuccess(manualSku.trim());
    onClose();
  };

  const handleQuickSelect = (sku: string) => {
    playScannerSound("success");
    triggerHapticFeedback([80]);
    onScanSuccess(sku);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-waypoint-text">Pallet Scanner</h3>
              <p className="text-[11px] text-gray-500 font-medium">Scan 1D barcode or QR tag on pallet</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Section */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          <div className="relative w-full aspect-[4/3] max-w-[340px] mx-auto bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-dashed border-gray-300">
            <div id={readerElementId} className="w-full h-full object-cover" />

            {/* Target Reticle Overlay - Wide Horizontal for 1D Barcodes & QR */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-36 border-2 border-amber-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                {/* Scanner laser animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse top-1/2 -translate-y-1/2" />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-300 uppercase tracking-widest whitespace-nowrap bg-black/70 px-2.5 py-0.5 rounded">
                  Align Barcode or QR Here
                </span>
              </div>
            </div>

            {isInitializing && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white gap-2">
                <RefreshCw className="w-7 h-7 text-waypoint-yellow animate-spin" />
                <span className="text-xs font-bold">Activating Camera...</span>
              </div>
            )}
          </div>

          {scannerError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{scannerError}</span>
            </div>
          )}

          {/* Quick Simulation Buttons for Easy Testing / Demo */}
          {availablePalletSkus.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-gray-500" />
                <span>Quick Select SKU:</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availablePalletSkus.slice(0, 4).map((sku) => (
                  <button
                    key={sku}
                    type="button"
                    onClick={() => handleQuickSelect(sku)}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-amber-100 hover:text-amber-900 text-gray-700 text-xs font-mono font-bold rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    {sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Or type SKU manually (e.g. CH-1048)..."
              value={manualSku}
              onChange={(e) => setManualSku(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-waypoint-yellow"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text text-xs font-extrabold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
