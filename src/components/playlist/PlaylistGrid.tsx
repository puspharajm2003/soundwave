import React from "react";
import { motion } from "framer-motion";
import { Play, Download, Wifi, WifiOff, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Playlist, Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistClick: (playlist: Playlist) => void;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  playlists,
  onPlaylistClick,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {playlists.map((playlist, index) => (
        <PlaylistGridCard
          key={playlist.id}
          playlist={playlist}
          index={index}
          onClick={() => onPlaylistClick(playlist)}
        />
      ))}
    </div>
  );
};

interface PlaylistGridCardProps {
  playlist: Playlist;
  index: number;
  onClick: () => void;
}

const PlaylistGridCard: React.FC<PlaylistGridCardProps> = ({
  playlist,
  index,
  onClick,
}) => {
  const { playPlaylist, currentSong, isPlaying } = usePlayer();
  const isActive = playlist.songs.some((s) => s.id === currentSong?.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPlaylist(playlist.songs);
  };

  const typeIcons = {
    youtube: <WifiOff className="w-3 h-3" />,
    offline: <Download className="w-3 h-3" />,
    online: <Wifi className="w-3 h-3" />,
    custom: null,
    smart: <Sparkles className="w-3 h-3" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
        {/* Artwork */}
        {playlist.songs.length >= 4 ? (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
            {playlist.songs.slice(0, 4).map((song) => (
              <img
                key={song.id}
                src={song.thumbnail}
                alt={song.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full capitalize inline-flex items-center gap-1",
              playlist.type === "youtube" && "bg-destructive/80 text-destructive-foreground",
              playlist.type === "offline" && "bg-primary/80 text-primary-foreground",
              playlist.type === "online" && "bg-accent/80 text-accent-foreground",
              playlist.type === "custom" && "bg-muted text-muted-foreground",
              playlist.type === "smart" && "bg-gradient-to-r from-primary to-accent text-foreground"
            )}
          >
            {typeIcons[playlist.type]}
            {playlist.type}
          </span>
        </div>

        {/* Song count */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-medium bg-background/60 backdrop-blur-sm px-2 py-1 rounded-full">
            {playlist.songCount} songs
          </span>
        </div>
      </div>

      <h4
        className={cn(
          "font-semibold truncate mb-1",
          isActive && "text-primary"
        )}
      >
        {playlist.name}
      </h4>
      <p className="text-sm text-muted-foreground truncate">
        {playlist.description}
      </p>
    </motion.div>
  );
};

// Smart playlist types for AI recommendations
export const SmartPlaylistTypes = [
  {
    id: "recently-played",
    name: "Recently Played",
    description: "Songs you listened to recently",
    icon: Clock,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "most-played",
    name: "Most Played",
    description: "Your top tracks",
    icon: TrendingUp,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "offline-only",
    name: "Offline Ready",
    description: "Available without internet",
    icon: Download,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "ai-mix",
    name: "AI Mix",
    description: "Personalized for you",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
];

export const SmartPlaylistCard: React.FC<{
  type: (typeof SmartPlaylistTypes)[0];
  songs: Song[];
  index: number;
}> = ({ type, songs, index }) => {
  const { playPlaylist } = usePlayer();
  const Icon = type.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => playPlaylist(songs)}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 cursor-pointer group",
        "bg-gradient-to-br",
        type.gradient
      )}
    >
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      
      <div className="relative z-10">
        <Icon className="w-8 h-8 mb-3 text-white" />
        <h4 className="font-bold text-white mb-1">{type.name}</h4>
        <p className="text-sm text-white/80">{type.description}</p>
        <p className="text-xs text-white/60 mt-2">{songs.length} songs</p>
      </div>

      {/* Play icon on hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className="absolute bottom-4 right-4 p-3 bg-white/20 backdrop-blur-sm rounded-full"
      >
        <Play className="w-5 h-5 text-white ml-0.5" />
      </motion.div>
    </motion.div>
  );
};
