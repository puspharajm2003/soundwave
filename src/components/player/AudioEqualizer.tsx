import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Music2, X, RotateCcw, Save } from "lucide-react";

export interface EqualizerPreset {
  id: string;
  name: string;
  icon?: string;
  bands: number[];
}

const DEFAULT_BANDS = [0, 0, 0, 0, 0, 0, 0, 0];

const FREQUENCY_LABELS = ["32", "64", "125", "250", "500", "1K", "2K", "8K"];

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { id: "flat", name: "Flat", bands: [0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "bass-boost", name: "Bass Boost", bands: [6, 5, 4, 2, 0, 0, 0, 0] },
  { id: "vocal", name: "Vocal", bands: [-2, -1, 0, 3, 4, 3, 1, 0] },
  { id: "rock", name: "Rock", bands: [4, 3, 1, 0, -1, 1, 3, 4] },
  { id: "pop", name: "Pop", bands: [-1, 1, 3, 4, 3, 1, -1, -2] },
  { id: "jazz", name: "Jazz", bands: [3, 2, 1, 2, -1, -1, 0, 2] },
  { id: "classical", name: "Classical", bands: [4, 3, 2, 1, -1, 0, 2, 3] },
  { id: "electronic", name: "Electronic", bands: [4, 3, 0, -2, -1, 2, 4, 5] },
  { id: "acoustic", name: "Acoustic", bands: [3, 2, 1, 1, 2, 2, 3, 2] },
  { id: "r-and-b", name: "R&B", bands: [3, 5, 4, 1, -1, 1, 2, 3] },
];

interface AudioEqualizerProps {
  isOpen: boolean;
  onClose: () => void;
  onBandsChange?: (bands: number[]) => void;
  onPresetChange?: (preset: EqualizerPreset) => void;
}

export const AudioEqualizer: React.FC<AudioEqualizerProps> = ({
  isOpen,
  onClose,
  onBandsChange,
  onPresetChange,
}) => {
  const [bands, setBands] = useState<number[]>(DEFAULT_BANDS);
  const [selectedPreset, setSelectedPreset] = useState<string>("flat");
  const [customPresets, setCustomPresets] = useState<EqualizerPreset[]>([]);

  const handleBandChange = useCallback((index: number, value: number) => {
    const newBands = [...bands];
    newBands[index] = value;
    setBands(newBands);
    setSelectedPreset("custom");
    onBandsChange?.(newBands);
  }, [bands, onBandsChange]);

  const handlePresetSelect = useCallback((preset: EqualizerPreset) => {
    setBands([...preset.bands]);
    setSelectedPreset(preset.id);
    onPresetChange?.(preset);
    onBandsChange?.(preset.bands);
  }, [onBandsChange, onPresetChange]);

  const handleReset = useCallback(() => {
    setBands(DEFAULT_BANDS);
    setSelectedPreset("flat");
    onBandsChange?.(DEFAULT_BANDS);
  }, [onBandsChange]);

  const handleSavePreset = useCallback(() => {
    const newPreset: EqualizerPreset = {
      id: `custom-${Date.now()}`,
      name: `Custom ${customPresets.length + 1}`,
      bands: [...bands],
    };
    setCustomPresets([...customPresets, newPreset]);
  }, [bands, customPresets]);

  const allPresets = [...EQUALIZER_PRESETS, ...customPresets];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-2xl p-6 md:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Music2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Equalizer</h2>
                  <p className="text-sm text-muted-foreground">
                    Customize your sound
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Presets
              </h3>
              <div className="flex flex-wrap gap-2">
                {allPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      selectedPreset === preset.id
                        ? "bg-primary text-primary-foreground glow-primary"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                  >
                    {preset.name}
                  </button>
                ))}
                {selectedPreset === "custom" && (
                  <span className="px-4 py-2 rounded-xl text-sm font-medium bg-accent/20 text-accent">
                    Custom
                  </span>
                )}
              </div>
            </div>

            {/* Frequency Bands */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Frequency Bands
              </h3>
              <div className="flex items-end justify-between gap-2 md:gap-4 h-48 px-2">
                {bands.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center h-full">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="h-full flex flex-col justify-center">
                        <Slider
                          orientation="vertical"
                          value={[value]}
                          min={-12}
                          max={12}
                          step={1}
                          onValueChange={([val]) => handleBandChange(index, val)}
                          className="h-32"
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        {FREQUENCY_LABELS[index]}
                      </span>
                      <div className="text-xs text-primary mt-1">
                        {value > 0 ? `+${value}` : value}dB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visualizer Preview */}
            <div className="mb-6 p-4 rounded-xl bg-muted/30">
              <div className="flex items-end justify-between h-16 gap-1">
                {bands.map((value, index) => (
                  <motion.div
                    key={index}
                    animate={{ height: `${((value + 12) / 24) * 100}%` }}
                    className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t"
                    style={{ minHeight: "8px" }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSavePreset}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Preset
                </Button>
                <Button onClick={onClose} variant="glow">
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
