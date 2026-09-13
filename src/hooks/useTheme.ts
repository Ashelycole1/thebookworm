"use client";

import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from document attribute or localStorage (defaulting to light)
  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem("bookworm-theme");
      const currentDocTheme = document.documentElement.getAttribute("data-theme") as Theme;
      const initialTheme: Theme = stored === "dark" || currentDocTheme === "dark" ? "dark" : "light";
      
      setThemeState(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
      document.documentElement.style.colorScheme = initialTheme;
    } catch {
      setThemeState("light");
    }
  }, []);

  // Sync across tabs & components
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "bookworm-theme" && e.newValue) {
        const nextTheme: Theme = e.newValue === "dark" ? "dark" : "light";
        setThemeState(nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
        document.documentElement.style.colorScheme = nextTheme;
      }
    };

    const handleCustomEvent = (e: CustomEvent<Theme>) => {
      const nextTheme = e.detail;
      setThemeState(nextTheme);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("bookworm-theme-change" as any, handleCustomEvent as any);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("bookworm-theme-change" as any, handleCustomEvent as any);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme: Theme = prev === "dark" ? "light" : "dark";
      try {
        document.documentElement.setAttribute("data-theme", nextTheme);
        document.documentElement.style.colorScheme = nextTheme;
        window.localStorage.setItem("bookworm-theme", nextTheme);
        window.dispatchEvent(new CustomEvent("bookworm-theme-change", { detail: nextTheme }));
      } catch {}
      return nextTheme;
    });
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    const nextTheme: Theme = newTheme === "dark" ? "dark" : "light";
    setThemeState(nextTheme);
    try {
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.documentElement.style.colorScheme = nextTheme;
      window.localStorage.setItem("bookworm-theme", nextTheme);
      window.dispatchEvent(new CustomEvent("bookworm-theme-change", { detail: nextTheme }));
    } catch {}
  }, []);

  return {
    theme,
    darkMode: theme === "dark",
    toggleTheme,
    setTheme,
    mounted,
  };
}
