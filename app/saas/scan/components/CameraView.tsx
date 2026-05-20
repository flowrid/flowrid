"use client";

import { useEffect, useRef, useState } from "react";

interface CameraViewProps {
  mode: "receive" | "pick" | "lookup";
  onScan: (decodedText: string) => void;
  paused: boolean;
  onResume: () => void;
}

export default function CameraView({ mode, onScan, paused, onResume }: CameraViewProps) {
  const [scanner, setScanner] = useState<any>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [lastResult, setLastResult] = useState("");
  const readerRef = useRef<HTMLDivElement>(null);
  const lastResultRef = useRef("");

  useEffect(() => {
    let instance: any = null;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      instance = new Html5Qrcode("qr-reader");
      setScanner(instance);

      instance
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
          (text: string) => {
            if (paused) return;
            if (text === lastResultRef.current) return; // deduplicate
            lastResultRef.current = text;
            setLastResult(text);
            onScan(text);
          },
          () => {} // ignore errors during scan
        )
        .catch(() => setHasCamera(false));
    });

    return () => {
      if (instance) {
        instance.stop().catch(() => {});
      }
    };
  }, []);

  // Pause/resume scanner
  useEffect(() => {
    if (!scanner) return;
    if (paused) {
      scanner.pause();
    } else {
      scanner.resume();
      lastResultRef.current = ""; // allow re-scan after resume
    }
  }, [paused, scanner]);

  if (!hasCamera) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1D1D1F] p-8 text-center">
        <div>
          <p className="text-white text-lg font-semibold mb-2">Camera Not Available</p>
          <p className="text-[#86868B] text-sm">Please allow camera access or use a device with a camera.</p>
        </div>
      </div>
    );
  }

  const modeHint = {
    receive: "Scan product barcode to receive",
    pick: "Scan barcode to pick item",
    lookup: "Scan any barcode to lookup",
  }[mode];

  return (
    <div className="flex-1 relative bg-black">
      <div id="qr-reader" ref={readerRef} className="w-full h-full" />

      {/* Scan overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-0 right-0 text-center">
          <p className="text-white/80 text-sm font-medium">{modeHint}</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[250px] h-[250px] border-2 border-[#ed6d00]/60 rounded-2xl relative">
            {/* Corner accents */}
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
