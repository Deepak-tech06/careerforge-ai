"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import api from "../lib/api";

export type ThemeType = "DEFAULT" | "EMERALD" | "CYBERPUNK" | "XSTAR" | "LUXURY" | "DAYLIGHT" | "SUNSET" | "MINT" | "HOSTIM" | "NEBULA";

export const THEMES: Record<ThemeType, Record<string, string>> = {
  DEFAULT: {
    "--primary": "#6c63ff",
    "--primary-rgb": "108, 99, 255",
    "--secondary": "#38bdf8",
    "--accent": "#a78bfa",
    "--bg": "#050508",
    "--bg-card": "rgba(255, 255, 255, 0.03)",
    "--border": "rgba(255, 255, 255, 0.08)",
    "--border-focus": "rgba(108, 99, 255, 0.5)",
    "--text-main": "#ffffff",
    "--text-muted": "#888888",
    "--text-sub": "#aaaaaa",
    "--nav-bg": "rgba(5, 5, 8, 0.85)",
    "--nav-text": "#ffffff",
    "--nav-text-sub": "#aaaaaa",
  },
  EMERALD: {
    "--primary": "#10b981",
    "--primary-rgb": "16, 185, 129",
    "--secondary": "#34d399",
    "--accent": "#059669",
    "--bg": "#020617",
    "--bg-card": "rgba(16, 185, 129, 0.05)",
    "--border": "rgba(52, 211, 153, 0.2)",
    "--border-focus": "rgba(16, 185, 129, 0.5)",
    "--text-main": "#ecfdf5",
    "--text-muted": "#6ee7b7",
    "--text-sub": "#a7f3d0",
    "--nav-bg": "rgba(2, 6, 23, 0.85)",
    "--nav-text": "#ecfdf5",
    "--nav-text-sub": "#a7f3d0",
  },
  CYBERPUNK: {
    "--primary": "#f43f5e",
    "--primary-rgb": "244, 63, 94",
    "--secondary": "#eab308",
    "--accent": "#06b6d4",
    "--bg": "#09090b",
    "--bg-card": "rgba(244, 63, 94, 0.05)",
    "--border": "rgba(6, 182, 212, 0.3)",
    "--border-focus": "rgba(244, 63, 94, 0.5)",
    "--text-main": "#fef08a",
    "--text-muted": "#f43f5e",
    "--text-sub": "#cbd5e1",
    "--nav-bg": "rgba(9, 9, 11, 0.85)",
    "--nav-text": "#fef08a",
    "--nav-text-sub": "#cbd5e1",
  },
  XSTAR: {
    "--primary": "#ff0055", // Neon Pink-Red
    "--primary-rgb": "255, 0, 85",
    "--secondary": "#00f0ff", // Cyber Cyan
    "--accent": "#bc13fe", // Electric Purple
    "--bg": "#050508", // Deepest Blue-Black
    "--bg-card": "rgba(255, 255, 255, 0.02)",
    "--border": "rgba(255, 255, 255, 0.05)",
    "--border-focus": "rgba(255, 0, 85, 0.5)",
    "--text-main": "#ffffff",
    "--text-muted": "#9e9eab",
    "--text-sub": "#767685",
    "--nav-bg": "rgba(5, 5, 8, 0.85)",
    "--nav-text": "#ffffff",
    "--nav-text-sub": "#9e9eab",
  },
  LUXURY: {
    "--primary": "#d4af37", // Metallic Gold
    "--primary-rgb": "212, 175, 55",
    "--secondary": "#f3e5ab", // Light Vanilla Gold
    "--accent": "#e8d399", // Soft Gold
    "--bg": "#030303", // Pure Blackish
    "--bg-card": "#0f0e0c", // Very dark brown-tinted black
    "--border": "#2e2716", // Dark Gold Border
    "--border-focus": "#d4af37",
    "--text-main": "#ffffff",
    "--text-muted": "#b8b09d",
    "--text-sub": "#8a816c",
    "--nav-bg": "rgba(3, 3, 3, 0.85)",
    "--nav-text": "#d4af37",
    "--nav-text-sub": "#b8b09d",
  },
  DAYLIGHT: {
    "--primary": "#4f46e5", // Vibrant Indigo
    "--primary-rgb": "79, 70, 229",
    "--secondary": "#0ea5e9", // Brilliant Sky Blue
    "--accent": "#8b5cf6", // Vivid Violet
    "--bg": "#f8fafd", // Ultra-light cool grey/blue
    "--bg-card": "#ffffff", // Pure white cards
    "--border": "#e2e8f0", // Soft grey borders
    "--border-focus": "#4f46e5",
    "--text-main": "#0f172a", // Deep slate for high readability
    "--text-muted": "#64748b", // Medium slate
    "--text-sub": "#94a3b8", // Light slate
    "--nav-bg": "rgba(255, 255, 255, 0.85)",
    "--nav-text": "#0f172a",
    "--nav-text-sub": "#64748b",
  },
  SUNSET: {
    "--primary": "#ff6b6b", // Vibrant Coral
    "--primary-rgb": "255, 107, 107",
    "--secondary": "#ffb84c", // Warm Marigold
    "--accent": "#f24c3d", // Vivid Red-Orange
    "--bg": "#fff9f5", // Very soft warm cream/peach
    "--bg-card": "#ffffff", // Pure white
    "--border": "#fde8e0", // Soft peach border
    "--border-focus": "#ff6b6b",
    "--text-main": "#2d1e17", // Deep espresso brown
    "--text-muted": "#786054", // Soft taupe
    "--text-sub": "#b59a8d", // Lighter taupe
    "--nav-bg": "rgba(255, 255, 255, 0.85)",
    "--nav-text": "#2d1e17",
    "--nav-text-sub": "#786054",
  },
  MINT: {
    "--primary": "#0d9488", // Vibrant Teal
    "--primary-rgb": "13, 148, 136",
    "--secondary": "#0284c7", // Ocean Blue
    "--accent": "#059669", // Emerald Green
    "--bg": "#f0fdf4", // Icy mint frost
    "--bg-card": "#ffffff", // Pure white
    "--border": "#dcfce7", // Soft mint border
    "--border-focus": "#0d9488",
    "--text-main": "#064e3b", // Deep forest green
    "--text-muted": "#047857", // Medium dark green
    "--text-sub": "#34d399", // Soft green
    "--nav-bg": "rgba(240, 253, 244, 0.85)",
    "--nav-text": "#064e3b",
    "--nav-text-sub": "#047857",
  },
  HOSTIM: {
    "--primary": "#00b4d8", // Bright sky blue
    "--primary-rgb": "0, 180, 216",
    "--secondary": "#0077b6", // Deep ocean blue
    "--accent": "#90e0ef", // Soft cloud blue
    "--bg": "linear-gradient(180deg, #caf0f8 0%, #f8fafd 100%)", // Light sky gradient
    "--bg-card": "#ffffff", // Pure white
    "--border": "#e2e8f0", // Light gray
    "--border-focus": "#00b4d8",
    "--text-main": "#0f172a", // Dark slate
    "--text-muted": "#64748b", // Muted slate
    "--text-sub": "#94a3b8", // Light slate
    "--nav-bg": "#0077b6", // Deep ocean blue for HOSTIM nav
    "--nav-text": "#ffffff", // Pure white text
    "--nav-text-sub": "#caf0f8", // Light sky blue
  },
  NEBULA: {
    "--primary": "#a855f7", // Glowing purple
    "--primary-rgb": "168, 85, 247",
    "--secondary": "#ec4899", // Neon pink
    "--accent": "#06b6d4", // Electric cyan
    "--bg": "radial-gradient(ellipse at 50% -20%, #2e1065 0%, #03000a 80%)", // Glowing space radial gradient
    "--bg-card": "rgba(255, 255, 255, 0.025)", // Ultra-clean glass card
    "--border": "rgba(168, 85, 247, 0.15)", // Glowing purple border
    "--border-focus": "rgba(236, 72, 153, 0.6)", // Neon pink focus border
    "--text-main": "#f8fafc", // Cool white
    "--text-muted": "#94a3b8", // Space slate grey
    "--text-sub": "#cbd5e1", // Light slate
    "--nav-bg": "rgba(3, 0, 10, 0.85)", // Glassy dark nav
    "--nav-text": "#f8fafc",
    "--nav-text-sub": "#94a3b8",
  },
};

const ThemeContext = createContext<{
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  isAdmin: boolean;
  isLightBg: boolean;
  isLightNav: boolean;
}>({ theme: "HOSTIM", setTheme: () => {}, isAdmin: false, isLightBg: true, isLightNav: false });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("HOSTIM");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("cf_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAdmin(user.role === 'ADMIN');
      }
    } catch {
      // ignore
    }
  }, []);

  const isLightBg = ['DAYLIGHT', 'SUNSET', 'MINT', 'HOSTIM'].includes(theme);
  const isLightNav = ['DAYLIGHT', 'SUNSET', 'MINT'].includes(theme);

  const applyTheme = (t: ThemeType) => {
    setThemeState(t);
    const root = document.documentElement;
    const colors = THEMES[t];
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value);
    }
  };

  useEffect(() => {
    // Immediately apply default theme on mount
    applyTheme("HOSTIM");

    // Fetch persisted theme from backend
    api
      .get("/settings/theme")
      .then(({ data }) => {
        if (THEMES[data.theme as ThemeType]) {
          applyTheme(data.theme as ThemeType);
        }
      })
      .catch(() => {
        // Retain HOSTIM as fallback if request fails
      });
  }, []);

  const setTheme = async (t: ThemeType) => {
    applyTheme(t);
    try {
      await api.post("/settings/theme", { theme: t });
    } catch (err) {
      console.error("Failed to save theme", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isAdmin, isLightBg, isLightNav }}>
      {children}
    </ThemeContext.Provider>
  );
}
