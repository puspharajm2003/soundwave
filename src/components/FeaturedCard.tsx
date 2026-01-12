import React from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

interface FeaturedCardProps {
  song: Song;
  index?: number;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ song, index = 0 }) => {
  const { currentSong, isPlaying, playSong, pauseSong, resumeSong } = usePlayer();
  const isActive = currentSong?.id === song.id;

  const handlePlayClick = () => {
    if (isActive) {
      isPlaying ? pauseSong() : resumeSong();
    } else {
      playSong(song);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden group cursor-pointer"
      onClick={handlePlayClick}
    >
      {/* Background Image */}
      <motion.img
        src={song.thumbnail}
        alt={song.title}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8 }}
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      
      {/* Animated accent line */}
      <motion.div 
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 bg-gradient-to-b from-primary to-accent rounded-full"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 96, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
        <motion.span 
          className="text-primary text-sm font-medium uppercase tracking-widest mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Featured Track
        </motion.span>
        
        <motion.h1 
          className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-3 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {song.title}
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {song.artist} • {song.album}
        </motion.p>
        
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            className={cn(
              "flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all",
              "bg-primary text-primary-foreground glow-primary hover:scale-105"
            )}
          >
            {isActive && isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 ml-0.5" />
                Play Now
              </>
            )}
          </button>
          
          <button className="px-6 py-4 rounded-full font-medium glass-button">
            Add to Playlist
          </button>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10">
        <motion.div 
          className="w-20 h-20 md:w-32 md:h-32 rounded-full border border-primary/30 animate-pulse-glow"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        />
      </div>
    </motion.div>
  );
};
