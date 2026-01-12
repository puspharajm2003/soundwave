import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CrossfadeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  enabled: boolean;
  duration: number;
  onSettingsChange: (enabled: boolean, duration: number) => void;
}

export const CrossfadeSettings: React.FC<CrossfadeSettingsProps> = ({
  isOpen,
  onClose,
  enabled,
  duration,
  onSettingsChange,
}) => {
  const [localEnabled, setLocalEnabled] = useState(enabled);
  const [localDuration, setLocalDuration] = useState(duration);

  const handleSave = () => {
    onSettingsChange(localEnabled, localDuration);
    toast.success(
      localEnabled
        ? `Crossfade enabled (${localDuration}s)`
        : "Crossfade disabled"
    );
    onClose();
  };

  const presets = [
    { label: "Short", value: 2 },
    { label: "Medium", value: 5 },
    { label: "Long", value: 8 },
    { label: "Extra Long", value: 12 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-md p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Waves className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Crossfade</h2>
                  <p className="text-sm text-muted-foreground">
                    Seamless song transitions
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

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 mb-6">
              <div>
                <p className="font-medium">Enable Crossfade</p>
                <p className="text-sm text-muted-foreground">
                  Blend songs together
                </p>
              </div>
              <Switch
                checked={localEnabled}
                onCheckedChange={setLocalEnabled}
              />
            </div>

            {/* Duration Slider */}
            <div className={`space-y-4 ${!localEnabled && "opacity-50 pointer-events-none"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Duration</span>
                <span className="text-sm text-primary font-bold">
                  {localDuration} seconds
                </span>
              </div>

              <Slider
                value={[localDuration]}
                onValueChange={(value) => setLocalDuration(value[0])}
                min={1}
                max={15}
                step={1}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1s</span>
                <span>15s</span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setLocalDuration(preset.value)}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      localDuration === preset.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Visual Preview */}
              <div className="mt-6 p-4 rounded-xl bg-muted/20">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Preview
                </p>
                <div className="relative h-12 rounded-lg overflow-hidden bg-muted/30">
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary to-transparent"
                    initial={{ width: "60%" }}
                    animate={{ width: "40%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                  <motion.div
                    className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-accent to-transparent"
                    initial={{ width: "30%" }}
                    animate={{ width: "50%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Songs blend for {localDuration}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              variant="glow"
              className="w-full mt-6"
            >
              Save Settings
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CrossfadeSettings;
