"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CameraView from "../components/CameraView";
import PickProgressBar from "../components/PickProgressBar";

const WAREHOUSE_ID = "00000000-0000-0000-0000-000000000001";

interface PickTaskItem {
  id: string;
  pick_task_id: string;
  product_id: string;
  location_id: string;
  quantity_to_pick: number;
  status: string;
  products?: { name: string; sku: string; upc: string };
  locations?: { barcode: string; zone: string; aisle: string; rack: string; shelf: string; bin: string };
}

export default function PickPage() {
  const t = useTranslations("saas");
  const [phase, setPhase] = useState<"select" | "scan">("select");
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [items, setItems] = useState<PickTaskItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [expectingLocation, setExpectingLocation] = useState(true);
  const [scannedLocation, setScannedLocation] = useState(false);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [pickedCount, setPickedCount] = useState(0);

  useEffect(() => {
    fetch("/api/saas/scanner/pick/task")
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks || []));
  }, []);

  function startTask(task: any) {
    setSelectedTask(task);
    const pendingItems = (task.pick_items || []).filter((i: PickTaskItem) => i.status !== "picked");
    setItems(pendingItems);
    setCurrentItemIndex(0);
    setExpectingLocation(true);
    setScannedLocation(false);
    setPickedCount(0);
    setPhase("scan");
  }

  async function handleScan(barcode: string) {
    setPaused(true);
    const currentItem = items[currentItemIndex];
    if (!currentItem) return;

    if (expectingLocation) {
      // Verify scanned location matches expected location
      if (currentItem.locations?.barcode === barcode) {
        setScannedLocation(true);
        setExpectingLocation(false);
        setMessage(t("locationConfirmed"));
        setPaused(false);
      } else {
        setMessage(`Wrong location! Expected: ${currentItem.locations?.barcode || currentItem.location_id}`);
        setPaused(false);
      }
      return;
    }

    // Scan product barcode
    const productMatch =
      currentItem.products?.upc === barcode ||
      currentItem.products?.sku === barcode;
    if (productMatch) {
      try {
        const res = await fetch("/api/saas/scanner/pick/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pickItemId: currentItem.id, quantityPicked: currentItem.quantity_to_pick }),
        });
        const data = await res.json();
        if (data.success) {
          setPickedCount((c) => c + 1);
          setMessage(`Picked: ${currentItem.products?.name || currentItem.products?.sku}`);

          if (data.taskComplete) {
            setMessage(t("allPicksComplete"));
            setTimeout(() => setPhase("select"), 2000);
          } else if (currentItemIndex < items.length - 1) {
            setCurrentItemIndex((i) => i + 1);
            setExpectingLocation(true);
            setScannedLocation(false);
            setPaused(false);
          }
        } else {
          setMessage(data.error || t("confirmFailed"));
          setPaused(false);
        }
      } catch {
        setMessage(t("networkError"));
        setPaused(false);
      }
    } else {
      setMessage(`Wrong product! Expected: ${currentItem.products?.sku || currentItem.products?.name}`);
      setPaused(false);
    }
  }

  if (phase === "select") {
    return (
      <div className="p-6">
        <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-4">{t("pickTasks")}</h2>
        {tasks.length === 0 ? (
          <p className="text-[#86868B] text-sm">{t("noActivePickTasks")}</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => startTask(task)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-black/5 text-left hover:border-[#ed6d00]/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1D1D1F]">{task.pick_type?.toUpperCase()} Pick</p>
                    <p className="text-xs text-[#86868B] mt-0.5">{(task.pick_items || []).length} items</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    task.status === "in_progress" ? "bg-[#ed6d00]/10 text-[#ed6d00]" : "bg-[#8E8E93]/10 text-[#8E8E93]"
                  }`}>{task.status}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const totalItems = items.length;
  const currentItem = items[currentItemIndex];

  return (
    <>
      <CameraView mode="pick" onScan={handleScan} paused={paused} onResume={() => { setPaused(false); setMessage(""); }} />
      <div className="p-4 bg-[#F5F5F7] space-y-3">
        <PickProgressBar current={pickedCount} total={totalItems} complete={pickedCount >= totalItems} />

        {currentItem && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#86868B] uppercase font-medium">
                {expectingLocation ? t("scanLocation") : t("scanProduct")}
              </p>
              <span className="text-[11px] bg-[#F5F5F7] text-[#86868B] px-2 py-0.5 rounded-full">
                {currentItemIndex + 1}/{totalItems}
              </span>
            </div>

            {!expectingLocation && scannedLocation && (
              <div className="mb-2">
                <p className="text-sm font-semibold text-[#1D1D1F]">{currentItem.products?.name || currentItem.product_id}</p>
                <p className="text-xs text-[#86868B]">SKU: {currentItem.products?.sku} · Qty: {currentItem.quantity_to_pick}</p>
              </div>
            )}

            {expectingLocation && (
              <div>
                <p className="text-sm font-semibold text-[#1D1D1F]">{currentItem.locations?.barcode || currentItem.location_id}</p>
                <p className="text-xs text-[#86868B]">
                  {[currentItem.locations?.zone, currentItem.locations?.aisle, currentItem.locations?.rack, currentItem.locations?.shelf, currentItem.locations?.bin]
                    .filter(Boolean)
                    .join(" > ")}
                </p>
              </div>
            )}
          </div>
        )}

        {message && (
          <p className={`text-sm rounded-xl px-4 py-2.5 font-medium ${
            message.includes("Wrong") ? "bg-[#FF3B30]/10 text-[#FF3B30]" :
            message.includes("confirmed") || message.includes("Picked") ? "bg-[#34C759]/10 text-[#34C759]" :
            "bg-[#ed6d00]/10 text-[#ed6d00]"
          }`}>{message}</p>
        )}
      </div>
    </>
  );
}
