import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  Heart,
  ChevronUp,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { RotatingAlbumArt } from "./RotatingAlbumArt";
import { useColorExtractor } from "@/hooks/useColorExtractor";
import { cn } from "@/lib/utils";

interface MiniPlayerProps {
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const {
    currentSong,
    isPlaying,
    progress,
    pauseSong,
    resumeSong,
    nextSong,
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);
  const { colors } = useColorExtractor(currentSong?.thumbnail);

  if (!currentSong) return null;

  const progressPercent = (progress / currentSong.duration) * 100;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
    >
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${progressPercent}%` }}
          layoutId="progress-bar"
        />
      </div>

      <div
        className="glass-card border-t border-glass-border backdrop-blur-xl"
        style={{
          background: `linear-gradient(90deg, ${colors.muted}40 0%, hsl(var(--glass) / 0.6) 100%)`,
        }}
      >
        <div className="flex items-center gap-4 p-3 md:p-4">
          {/* Album Art */}
          <button onClick={onExpand} className="relative group flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden">
              <motion.img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronUp className="w-6 h-6" />
            </div>
            
            {/* Playing indicator */}
            {isPlaying && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <div className="music-wave scale-75">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </button>

          {/* Song Info */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={onExpand}
          >
            <motion.h4
              key={currentSong.id + "-mini-title"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-medium truncate"
            >
              {currentSong.title}
            </motion.h4>
            <motion.p
              key={currentSong.id + "-mini-artist"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-sm text-muted-foreground truncate"
            >
              {currentSong.artist}
            </motion.p>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={cn(
                "p-2 rounded-full transition-all hidden sm:block",
                isLiked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            </button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                isPlaying ? pauseSong() : resumeSong();
              }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSong();
              }}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
