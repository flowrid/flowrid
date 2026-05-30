"use client";

import { useState, useRef, useEffect } from "react";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: string[];           // 静态选项列表
  fetchOptions?: (query: string) => Promise<string[]>; // 动态搜索
  className?: string;
}

export default function Autocomplete({
  value,
  onChange,
  placeholder,
  options = [],
  fetchOptions,
  className = "",
}: AutocompleteProps) {
  const [input, setInput] = useState(value);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<string[]>(options);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 同步外部 value
  useEffect(() => {
    setInput(value);
  }, [value]);

  // 点击外部关闭
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // 搜索
  useEffect(() => {
    if (!open) return;

    if (fetchOptions && input.trim()) {
      setLoading(true);
      const timer = setTimeout(async () => {
        const results = await fetchOptions(input.trim());
        setItems(results);
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }

    // 静态过滤
    const q = input.toLowerCase();
    setItems(options.filter((o) => o.toLowerCase().includes(q)));
  }, [input, open, options, fetchOptions]);

  function select(item: string) {
    setInput(item);
    onChange(item);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) { setOpen(true); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      select(items[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const baseClass = "w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={input}
        placeholder={placeholder}
        onChange={(e) => { setInput(e.target.value); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={`${baseClass} ${className}`}
      />
      {open && items.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-2.5 text-sm text-text-secondary">Searching...</p>
          ) : (
            items.map((item, i) => (
              <button
                key={item}
                onClick={() => select(item)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  i === highlightIndex ? "bg-gray-50 text-primary" : "text-text-secondary"
                }`}
              >
                {item}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
