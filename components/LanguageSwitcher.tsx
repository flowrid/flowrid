"use client";

import { useState, useRef, useEffect } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      document.addEventListener("click", handleOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleOutside);
    };
  }, [open]);

  function handleOutside(e: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }

  function switchLocale(nextLocale: string) {
    setOpen(false);
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <div ref={menuRef} className="relative flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        aria-label="Switch language"
      >
        <img
          src="/images/multilingual.png"
          alt="Language"
          className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
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
