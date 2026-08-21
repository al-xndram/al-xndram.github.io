import { useState, useEffect, useRef } from "react";

const THROTTLE_MS = 60 * 1000;

export default function useArenaRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);
  const lastRef = useRef(0);

  useEffect(() => {
    function tryRefresh() {
      const now = Date.now();
      if (now - lastRef.current < THROTTLE_MS) return;
      lastRef.current = now;
      setRefreshKey((k) => k + 1);
    }

    function onVisibility() {
      if (document.visibilityState === "visible") tryRefresh();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tryRefresh);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tryRefresh);
    };
  }, []);

  return refreshKey;
}
