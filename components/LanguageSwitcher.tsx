"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const languages = [
  { code: "en", name: "English" },
  { code: "zh", name: "简体中文" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "ja", name: "日本語" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [open, handleOutside]);

  function switchLocale(nextLocale: string) {
    if (switching) return;
    setSwitching(true);
    setOpen(false);
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
    // 延迟一帧确保 cookie 已写入，然后强制跳转
    setTimeout(() => {
      window.location.href = window.location.href;
    }, 50);
  }

  return (
    <div ref={menuRef} className="relative flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ${switching ? "opacity-50" : ""}`}
        aria-label="Switch language"
        disabled={switching}
      >
        <img
          src="/images/multilingual.png"
          alt="Language"
          className="w-[22px] h-[22px] opacity-60 hover:opacity-100 transition-opacity"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchLocale(lang.code);
              }}
              className={`block w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                locale === lang.code
                  ? "text-primary font-semibold bg-primary/5"
                  : "text-text-secondary hover:bg-gray-50 hover:text-text"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
