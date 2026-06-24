"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface CameraViewProps {
  mode: "receive" | "pick" | "lookup";
  onScan: (decodedText: string) => void;
  paused: boolean;
  onResume: () => void;
}

export default function CameraView({ mode, onScan, paused, onResume }: CameraViewProps) {
  const t = useTranslations("scan");
  const [scanner, setScanner] = useState<any>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [lastResult, setLastResult] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const readerRef = useRef<HTMLDivElement>(null);
  const lastResultRef = useRef("");

  useEffect(() => {
    let instance: any = null;
    let mounted = true;

    import("html5-qrcode")
      .then(({ Html5Qrcode }) => {
        if (!mounted) return;
        try {
          instance = new Html5Qrcode("qr-reader");
          setScanner(instance);

          instance
            .start(
              { facingMode: "environment" },
              { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
              (text: string) => {
                if (paused) return;
                if (text === lastResultRef.current) return;
                lastResultRef.current = text;
                setLastResult(text);
                onScan(text);
              },
              () => {}
            )
            .catch(() => {
              if (mounted) setHasCamera(false);
            });
        } catch {
          if (mounted) setHasCamera(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setLoadError(true);
          setHasCamera(false);
        }
      });

    return () => {
      mounted = false;
      if (instance) {
        instance.stop().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!scanner) return;
    if (paused) {
      scanner.pause();
    } else {
      scanner.resume();
      lastResultRef.current = "";
    }
  }, [paused, scanner]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const barcode = manualBarcode.trim();
    if (!barcode) return;
    lastResultRef.current = barcode;
    setLastResult(barcode);
    onScan(barcode);
    setManualBarcode("");
  }

  const modeHint = {
    receive: t("scan.scanToReceive"),
    pick: t("scan.scanToPick"),
    lookup: t("scan.scanToLookup"),
  }[mode];

  if (loadError || !hasCamera) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1D1D1F] p-8">
        <div className="text-center max-w-sm">
          <p className="text-white text-lg font-semibold mb-2">
            {loadError ? t("scan.scannerUnavailable") : t("scan.cameraNotAvailable")}
          </p>
          <p className="text-[#86868B] text-sm mb-6">
            {loadError
              ? t("scan.manualHint")
              : t("scan.cameraHint")}
          </p>
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder={t("scan.typeBarcode")}
              className="w-full bg-[#2C2C2E] text-white border border-[#48484A] rounded-xl px-4 py-3 text-sm placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/30"
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="w-full bg-[#ed6d00] text-white rounded-full py-3 text-sm font-semibold hover:bg-[#FF8A1F] transition-colors disabled:opacity-40"
            >
              Submit Barcode
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-black">
      <div id="qr-reader" ref={readerRef} className="w-full h-full" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-0 right-0 text-center">
          <p className="text-white/80 text-sm font-medium">{modeHint}</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[250px] h-[250px] border-2 border-[#ed6d00]/60 rounded-2xl relative">
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#ed6d00] rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#ed6d00] rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#ed6d00] rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#ed6d00] rounded-br-lg" />
          </div>
        </div>
      </div>

      {paused && lastResult && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white font-semibold mb-2">Scanned</p>
            <p className="text-[#86868B] text-xs mb-4 font-mono">{lastResult}</p>
            <button
              onClick={() => { lastResultRef.current = ""; onResume(); }}
              className="bg-[#ed6d00] text-white px-6 py-2.5 rounded-full text-sm font-semibold pointer-events-auto"
            >
              Tap to Scan Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
