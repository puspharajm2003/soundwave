import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
}

export interface BackgroundStyle {
  type: "solid" | "gradient" | "blur" | "particles";
  intensity: number;
}

export interface PlayerLayout {
  style: "default" | "compact" | "minimal" | "immersive";
  showWaveform: boolean;
  showLyrics: boolean;
  albumArtSize: "small" | "medium" | "large";
}

export interface AppSettings {
  theme: "dark" | "light" | "system";
  themeColors: ThemeColors;
  backgroundStyle: BackgroundStyle;
  playerLayout: PlayerLayout;
  audioQuality: "low" | "medium" | "high";
  autoDownload: boolean;
  offlineMode: boolean;
  notifications: boolean;
  hapticFeedback: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  themeColors: {
    primary: "187 100% 50%",
    accent: "280 100% 65%",
    background: "240 15% 4%",
  },
  backgroundStyle: {
    type: "gradient",
    intensity: 50,
  },
  playerLayout: {
    style: "default",
    showWaveform: true,
    showLyrics: true,
    albumArtSize: "large",
  },
  audioQuality: "high",
  autoDownload: false,
  offlineMode: false,
  notifications: true,
  hapticFeedback: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateThemeColors: (colors: Partial<ThemeColors>) => void;
  updateBackgroundStyle: (style: Partial<BackgroundStyle>) => void;
  updatePlayerLayout: (layout: Partial<PlayerLayout>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "soundwave-settings";

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", settings.themeColors.primary);
    root.style.setProperty("--accent", settings.themeColors.accent);
    root.style.setProperty("--glow-primary", settings.themeColors.primary);
    root.style.setProperty("--glow-accent", settings.themeColors.accent);
    root.style.setProperty("--gradient-start", settings.themeColors.primary);
    root.style.setProperty("--gradient-end", settings.themeColors.accent);
    root.style.setProperty("--ring", settings.themeColors.primary);
    root.style.setProperty("--sidebar-primary", settings.themeColors.primary);
    root.style.setProperty("--sidebar-ring", settings.themeColors.primary);
  }, [settings.themeColors]);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    if (settings.theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(isDark ? "dark" : "light");
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateThemeColors = useCallback((colors: Partial<ThemeColors>) => {
    setSettings((prev) => ({
      ...prev,
      themeColors: { ...prev.themeColors, ...colors },
    }));
  }, []);

  const updateBackgroundStyle = useCallback((style: Partial<BackgroundStyle>) => {
    setSettings((prev) => ({
      ...prev,
      backgroundStyle: { ...prev.backgroundStyle, ...style },
    }));
  }, []);

  const updatePlayerLayout = useCallback((layout: Partial<PlayerLayout>) => {
    setSettings((prev) => ({
      ...prev,
      playerLayout: { ...prev.playerLayout, ...layout },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateThemeColors,
        updateBackgroundStyle,
        updatePlayerLayout,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
