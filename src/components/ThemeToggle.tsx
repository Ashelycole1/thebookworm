"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { darkMode, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      className="header-theme-toggle"
      onClick={toggleTheme}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted && darkMode ? <SunMedium size={17} strokeWidth={2} /> : <MoonStar size={17} strokeWidth={2} />}
    </button>
  );
}

