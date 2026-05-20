"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModeSelector from "./components/ModeSelector";
import type { ScanMode } from "@/types/saas";

export default function ScanPage() {
  const router = useRouter();

  function handleSelect(mode: ScanMode) {
    router.push(`/saas/scan/${mode}`);
  }

  return <ModeSelector onSelect={handleSelect} />;
}
