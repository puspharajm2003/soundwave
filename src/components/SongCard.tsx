import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Download, MoreHorizontal, Check } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

interface SongCardProps {
  song: Song;
  index?: number;
  showIndex?: boolean;
  compact?: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  index = 0, 
  showIndex = false,
  compact = false 
}) => {
  const { currentSong, isPlaying, playSong, pauseSong, resumeSong } = usePlayer();
  const isActive = currentSong?.id === song.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      isPlaying ? pauseSong() : resumeSong();
    } else {
      playSong(song);
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group",
          isActive && "bg-muted/50"
        )}
        onClick={() => playSong(song)}
      >
        {showIndex && (
          <span className="w-6 text-center text-muted-foreground text-sm">
            {isActive && isPlaying ? (
              <div className="music-wave mx-auto">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              index + 1
            )}
          </span>
        )}
        
        <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={handlePlayClick}
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-background/60 transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            {isActive && isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium truncate text-sm",
            isActive && "text-primary"
          )}>
            {song.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {song.isDownloaded ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <button className="p-1 hover:text-primary transition-colors">
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>

        <span className="text-sm text-muted-foreground">
          {formatTime(song.duration)}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer"
      onClick={() => playSong(song)}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button */}
        <motion.button
          onClick={handlePlayClick}
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          className={cn(
            "absolute bottom-3 right-3 p-4 rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 glow-primary",
            isActive 
              ? "scale-100 opacity-100" 
              : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
          )}
        >
          {isActive && isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </motion.button>

        {/* Downloaded indicator */}
        {song.isDownloaded && (
          <div className="absolute top-3 right-3 p-1.5 rounded-full bg-primary/20 backdrop-blur-sm">
            <Download className="w-3 h-3 text-primary" />
          </div>
        )}
      </div>

      <h4 className={cn(
        "font-medium truncate mb-1",
        isActive && "text-primary"
      )}>
        {song.title}
      </h4>
      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
    </motion.div>
  );
};
