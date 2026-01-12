import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsViewProps {
  isVisible: boolean;
  currentTime: number;
  songId: string;
}

// Demo lyrics data
const demoLyrics: Record<string, LyricLine[]> = {
  "1": [
    { time: 0, text: "In the midnight hour" },
    { time: 4, text: "I close my eyes" },
    { time: 8, text: "Dreaming of a world" },
    { time: 12, text: "Where the stars align" },
    { time: 16, text: "" },
    { time: 18, text: "Cosmic waves are calling" },
    { time: 22, text: "Through the endless night" },
    { time: 26, text: "I'm floating, I'm falling" },
    { time: 30, text: "Into the light" },
    { time: 34, text: "" },
    { time: 36, text: "Midnight dreams" },
    { time: 40, text: "Take me away" },
    { time: 44, text: "To a place where" },
    { time: 48, text: "I can stay" },
  ],
  default: [
    { time: 0, text: "♪ ♫ ♪" },
    { time: 5, text: "Music plays" },
    { time: 10, text: "Rhythm sways" },
    { time: 15, text: "In the groove" },
    { time: 20, text: "We move" },
    { time: 25, text: "♪ ♫ ♪" },
  ],
};

export const LyricsView: React.FC<LyricsViewProps> = ({
  isVisible,
  currentTime,
  songId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lyrics = demoLyrics[songId] || demoLyrics.default;
  
  const currentLineIndex = lyrics.findIndex((line, i) => {
    const nextLine = lyrics[i + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const activeElement = containerRef.current.querySelector('[data-active="true"]');
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLineIndex, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25 }}
          className="absolute inset-0 bg-background/95 backdrop-blur-xl flex items-center justify-center z-20 overflow-hidden"
        >
          <div
            ref={containerRef}
            className="h-full w-full max-w-2xl overflow-y-auto py-32 px-6 scrollbar-hide"
          >
            <div className="space-y-6 text-center">
              {lyrics.map((line, i) => (
                <motion.p
                  key={i}
                  data-active={i === currentLineIndex}
                  initial={{ opacity: 0.3, scale: 0.95 }}
                  animate={{
                    opacity: i === currentLineIndex ? 1 : 0.3,
                    scale: i === currentLineIndex ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "text-2xl md:text-3xl font-display font-bold transition-all duration-300",
                    i === currentLineIndex
                      ? "text-foreground glow-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {line.text || "•••"}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Gradient overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
