import React from "react";
import { motion } from "framer-motion";
import { Play, MoreHorizontal } from "lucide-react";
import { Playlist } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

interface PlaylistCardProps {
  playlist: Playlist;
  index?: number;
  size?: "small" | "medium" | "large";
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ 
  playlist, 
  index = 0,
  size = "medium" 
}) => {
  const { playPlaylist, currentSong, isPlaying } = usePlayer();
  
  const isActive = playlist.songs.some(s => s.id === currentSong?.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPlaylist(playlist.songs);
  };

  const sizeClasses = {
    small: "w-36",
    medium: "w-44 md:w-52",
    large: "w-full max-w-md",
  };

  const imageClasses = {
    small: "h-36",
    medium: "h-44 md:h-52",
    large: "h-64",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={cn(
        "group cursor-pointer flex-shrink-0",
        sizeClasses[size]
      )}
    >
      <div className={cn(
        "relative rounded-2xl overflow-hidden mb-3",
        imageClasses[size]
      )}>
        {/* Grid of song thumbnails or single image */}
        {playlist.songs.length >= 4 ? (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
            {playlist.songs.slice(0, 4).map((song, i) => (
              <img
                key={song.id}
                src={song.thumbnail}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        ) : (
          <img
            src={playlist.thumbnail}
            alt={playlist.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Play button */}
        <motion.button
          onClick={handlePlay}
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          className={cn(
            "absolute bottom-3 right-3 p-4 rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 glow-primary",
            isActive && isPlaying
              ? "scale-100 opacity-100" 
              : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
          )}
        >
          <Play className="w-5 h-5 ml-0.5" />
        </motion.button>

        {/* Song count */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-medium bg-background/60 backdrop-blur-sm px-2 py-1 rounded-full">
            {playlist.songCount} songs
          </span>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full capitalize",
            playlist.type === "youtube" && "bg-destructive/80 text-destructive-foreground",
            playlist.type === "offline" && "bg-primary/80 text-primary-foreground",
            playlist.type === "online" && "bg-accent/80 text-accent-foreground",
            playlist.type === "custom" && "bg-muted text-muted-foreground"
          )}>
            {playlist.type}
          </span>
        </div>
      </div>

      <h4 className={cn(
        "font-semibold truncate mb-1",
        isActive && "text-primary"
      )}>
        {playlist.name}
      </h4>
      <p className="text-sm text-muted-foreground truncate">{playlist.description}</p>
    </motion.div>
  );
};
