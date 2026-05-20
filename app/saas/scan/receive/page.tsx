"use client";

import { useState } from "react";
import CameraView from "../components/CameraView";
import QuantityInput from "../components/QuantityInput";

const WAREHOUSE_ID = "00000000-0000-0000-0000-000000000001";

export default function ReceivePage() {
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [receivedCount, setReceivedCount] = useState(0);

  async function handleScan(barcode: string) {
    setPaused(true);
    try {
      const res = await fetch("/api/saas/scanner/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode, warehouseId: WAREHOUSE_ID }),
      });
      const data = await res.json();
      if (data.type === "product") {
        setScannedProduct(data.data);
      } else {
        setMessage("Product not found — try again");
        setPaused(false);
      }
    } catch {
      setMessage("Scan error");
      setPaused(false);
    }
  }

  async function handleConfirm() {
    if (!scannedProduct) return;
    try {
      const res = await fetch("/api/saas/scanner/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receivingId: "00000000-0000-0000-0000-000000000001",
          warehouseId: WAREHOUSE_ID,
          items: [{ product_id: scannedProduct.id, quantity_received: quantity }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReceivedCount((c) => c + quantity);
        setMessage(`Added ${quantity} × ${scannedProduct.name || scannedProduct.sku}`);
        setScannedProduct(null);
        setQuantity(1);
        setPaused(false);
      } else {
        setMessage(data.error || "Failed");
      }
    } catch {
      setMessage("Network error");
    }
  }

  return (
    <>
      <CameraView mode="receive" onScan={handleScan} paused={paused} onResume={() => { setPaused(false); setMessage(""); }} />
      <div className="p-4 bg-[#F5F5F7] space-y-3">
        {message && (
          <p className={`text-sm rounded-xl px-4 py-2.5 font-medium ${message.includes("error") || message.includes("not found") ? "bg-[#FF3B30]/10 text-[#FF3B30]" : "bg-[#34C759]/10 text-[#34C759]"}`}>
            {message}
          </p>
        )}
        {receivedCount > 0 && (
          <p className="text-xs text-[#86868B] text-center">{receivedCount} units received this session</p>
        )}
        {scannedProduct && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
              <p className="text-sm font-semibold text-[#1D1D1F]">{scannedProduct.name || scannedProduct.sku}</p>
              <p className="text-xs text-[#86868B] mt-0.5">SKU: {scannedProduct.sku}</p>
            </div>
            <QuantityInput value={quantity} onChange={setQuantity} onConfirm={handleConfirm} />
          </>
        )}
      </div>
    </>
  );
}
