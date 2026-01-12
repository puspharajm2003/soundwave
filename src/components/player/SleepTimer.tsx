import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Clock, X, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/PlayerContext";
import { toast } from "sonner";

interface SleepTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_TIMES = [
  { label: "5 min", minutes: 5 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
];

export const SleepTimer: React.FC<SleepTimerProps> = ({ isOpen, onClose }) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { pauseSong } = usePlayer();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Time's up - pause playback
            pauseSong();
            setIsActive(false);
            setSelectedMinutes(null);
            toast.success("Sleep timer ended - playback paused", {
              icon: <Moon className="w-4 h-4" />,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, remainingSeconds, pauseSong]);

  const startTimer = useCallback((minutes: number) => {
    setSelectedMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setIsActive(true);
    setIsPaused(false);
    toast.success(`Sleep timer set for ${minutes} minutes`, {
      icon: <Moon className="w-4 h-4" />,
    });
    onClose();
  }, [onClose]);

  const cancelTimer = useCallback(() => {
    setIsActive(false);
    setSelectedMinutes(null);
    setRemainingSeconds(0);
    setIsPaused(false);
    toast.info("Sleep timer cancelled");
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
                <div className="p-2 rounded-xl bg-primary/10">
                  <Moon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Sleep Timer</h2>
                  <p className="text-sm text-muted-foreground">
                    Auto-stop playback
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

            {/* Active Timer Display */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-6 rounded-2xl bg-primary/10 text-center"
              >
                <p className="text-sm text-muted-foreground mb-2">Time Remaining</p>
                <p className="text-4xl font-display font-bold text-primary mb-4">
                  {formatTime(remainingSeconds)}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={togglePause}
                    className="flex items-center gap-2"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelTimer}
                    className="text-destructive"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Preset Times */}
            <div className="grid grid-cols-3 gap-3">
              {PRESET_TIMES.map((preset) => (
                <motion.button
                  key={preset.minutes}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startTimer(preset.minutes)}
                  className={`p-4 rounded-xl text-center transition-all ${
                    selectedMinutes === preset.minutes && isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-2 opacity-70" />
                  <span className="font-medium">{preset.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Custom Timer */}
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-sm text-muted-foreground text-center">
                Music will automatically pause when the timer ends
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SleepTimer;
