"use client";

import { useState } from "react";
import CameraView from "../components/CameraView";
import ScanResultCard from "../components/ScanResultCard";

export default function LookupPage() {
  const [result, setResult] = useState<any>(null);
  const [paused, setPaused] = useState(false);

  async function handleScan(barcode: string) {
    setPaused(true);
    try {
      const res = await fetch("/api/saas/scanner/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    }
  }

  return (
    <>
      <CameraView mode="lookup" onScan={handleScan} paused={paused} onResume={() => { setPaused(false); setResult(null); }} />
      {result && (
        <div className="p-4 bg-[#F5F5F7]">
          <ScanResultCard result={result} />
        </div>
      )}
    </>
  );
}
