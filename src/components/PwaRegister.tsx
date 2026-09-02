"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const isLocalhost =
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";

    const isSecureContext =
      location.protocol === "https:" || isLocalhost;

    if (!isSecureContext) {
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Keep silent in production; app should continue without SW.
      }
    };

    register();
  }, []);

  return null;
}
