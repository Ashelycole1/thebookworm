"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("bookworm-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDarkMode = storedTheme ? storedTheme === "dark" : prefersDark;
    setDarkMode(initialDarkMode);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const theme = darkMode ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    window.localStorage.setItem("bookworm-theme", theme);
  }, [darkMode]);

  return (
    <button
      type="button"
      className="header-theme-toggle"
      onClick={() => setDarkMode((value) => !value)}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <SunMedium size={17} strokeWidth={2} /> : <MoonStar size={17} strokeWidth={2} />}
    </button>
  );
}
