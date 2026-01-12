import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Palette, 
  Layout, 
  Music2, 
  Download, 
  Bell, 
  Shield, 
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Waves,
  Image,
  Circle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COLOR_PRESETS = [
  { name: "Cyan", primary: "187 100% 50%", accent: "280 100% 65%" },
  { name: "Purple", primary: "280 100% 65%", accent: "320 100% 60%" },
  { name: "Green", primary: "142 76% 50%", accent: "180 100% 50%" },
  { name: "Orange", primary: "24 100% 55%", accent: "40 100% 60%" },
  { name: "Pink", primary: "330 100% 60%", accent: "280 100% 65%" },
  { name: "Blue", primary: "217 100% 60%", accent: "200 100% 50%" },
];

const BACKGROUND_STYLES = [
  { id: "solid", name: "Solid", icon: Circle },
  { id: "gradient", name: "Gradient", icon: Sparkles },
  { id: "blur", name: "Blur", icon: Image },
  { id: "particles", name: "Particles", icon: Waves },
];

const PLAYER_LAYOUTS = [
  { id: "default", name: "Default", description: "Full-featured player" },
  { id: "compact", name: "Compact", description: "Smaller controls" },
  { id: "minimal", name: "Minimal", description: "Essential controls only" },
  { id: "immersive", name: "Immersive", description: "Full-screen focused" },
];

const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    updateThemeColors, 
    updateBackgroundStyle, 
    updatePlayerLayout,
    resetSettings 
  } = useSettings();

  const [activeSection, setActiveSection] = useState("appearance");

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            to="/"
            className="p-2 rounded-xl glass-button hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your experience</p>
          </div>
        </motion.div>

        {/* Section Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2"
        >
          {[
            { id: "appearance", label: "Appearance", icon: Palette },
            { id: "player", label: "Player", icon: Music2 },
            { id: "downloads", label: "Downloads", icon: Download },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "privacy", label: "Privacy", icon: Shield },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {activeSection === "appearance" && (
            <>
              {/* Theme Selector */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5" />
                  Theme
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Monitor },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateSettings({ theme: theme.id as any })}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        settings.theme === theme.id
                          ? "border-primary bg-primary/10"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <theme.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Theme Colors
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateThemeColors({ 
                        primary: preset.primary, 
                        accent: preset.accent 
                      })}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                        settings.themeColors.primary === preset.primary
                          ? "ring-2 ring-primary bg-primary/10"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, hsl(${preset.primary}), hsl(${preset.accent}))`,
                        }}
                      />
                      <span className="text-xs font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Style */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Background Style
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {BACKGROUND_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => updateBackgroundStyle({ type: style.id as any })}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        settings.backgroundStyle.type === style.id
                          ? "border-primary bg-primary/10"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <style.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{style.name}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Intensity: {settings.backgroundStyle.intensity}%
                  </label>
                  <Slider
                    value={[settings.backgroundStyle.intensity]}
                    min={0}
                    max={100}
                    onValueChange={([val]) => updateBackgroundStyle({ intensity: val })}
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === "player" && (
            <>
              {/* Player Layout */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Player Layout
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {PLAYER_LAYOUTS.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => updatePlayerLayout({ style: layout.id as any })}
                      className={cn(
                        "flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left",
                        settings.playerLayout.style === layout.id
                          ? "border-primary bg-primary/10"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <span className="font-medium">{layout.name}</span>
                      <span className="text-sm text-muted-foreground">{layout.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Features */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Music2 className="w-5 h-5" />
                  Player Features
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Waveform Visualizer</p>
                    <p className="text-sm text-muted-foreground">Show audio waveform</p>
                  </div>
                  <Switch
                    checked={settings.playerLayout.showWaveform}
                    onCheckedChange={(checked) => updatePlayerLayout({ showWaveform: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lyrics Display</p>
                    <p className="text-sm text-muted-foreground">Show lyrics when available</p>
                  </div>
                  <Switch
                    checked={settings.playerLayout.showLyrics}
                    onCheckedChange={(checked) => updatePlayerLayout({ showLyrics: checked })}
                  />
                </div>
                <div>
                  <p className="font-medium mb-2">Album Art Size</p>
                  <div className="flex gap-2">
                    {["small", "medium", "large"].map((size) => (
                      <button
                        key={size}
                        onClick={() => updatePlayerLayout({ albumArtSize: size as any })}
                        className={cn(
                          "px-4 py-2 rounded-lg capitalize transition-all",
                          settings.playerLayout.albumArtSize === size
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 hover:bg-muted"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "downloads" && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Settings
              </h3>
              <div>
                <p className="font-medium mb-2">Audio Quality</p>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map((quality) => (
                    <button
                      key={quality}
                      onClick={() => updateSettings({ audioQuality: quality as any })}
                      className={cn(
                        "px-4 py-2 rounded-lg capitalize transition-all",
                        settings.audioQuality === quality
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-download</p>
                  <p className="text-sm text-muted-foreground">Download songs automatically</p>
                </div>
                <Switch
                  checked={settings.autoDownload}
                  onCheckedChange={(checked) => updateSettings({ autoDownload: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Offline Mode</p>
                  <p className="text-sm text-muted-foreground">Only play downloaded content</p>
                </div>
                <Switch
                  checked={settings.offlineMode}
                  onCheckedChange={(checked) => updateSettings({ offlineMode: checked })}
                />
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive app notifications</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSettings({ notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Haptic Feedback</p>
                  <p className="text-sm text-muted-foreground">Vibration on interactions</p>
                </div>
                <Switch
                  checked={settings.hapticFeedback}
                  onCheckedChange={(checked) => updateSettings({ hapticFeedback: checked })}
                />
              </div>
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </h3>
              <p className="text-muted-foreground">
                Your music library and preferences are stored locally on your device. 
                No data is sent to external servers without your explicit consent.
              </p>
              <Button
                variant="destructive"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Settings
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
