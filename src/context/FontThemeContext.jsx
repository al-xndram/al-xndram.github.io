import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ThemeProvider } from "styled-components";
import { sansMain, serifMain } from "../styles.js";

const STORAGE_KEY = "alex-portfolio-font";

const FontThemeContext = createContext(null);

export function FontThemeProvider({ children }) {
  const [useSerif, setUseSerif] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "serif";
    } catch {
      return false;
    }
  });

  const toggleFont = useCallback(() => {
    setUseSerif((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "serif" : "sans");
      } catch {
        void 0;
      }
      return next;
    });
  }, []);

  const styledTheme = useMemo(
    () => ({
      bodyFont: useSerif ? serifMain : sansMain,
    }),
    [useSerif],
  );

  const fontCtx = useMemo(
    () => ({ useSerif, toggleFont }),
    [useSerif, toggleFont],
  );

  return (
    <ThemeProvider theme={styledTheme}>
      <FontThemeContext.Provider value={fontCtx}>
        {children}
      </FontThemeContext.Provider>
    </ThemeProvider>
  );
}

export function useFontTheme() {
  const ctx = useContext(FontThemeContext);
  if (!ctx) {
    throw new Error("useFontTheme must be used within FontThemeProvider");
  }
  return ctx;
}
