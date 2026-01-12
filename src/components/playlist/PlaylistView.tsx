import React, { useState, useRef, useCallback } from "react";
import { motion, Reorder, useDragControls, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  MoreHorizontal,
  Trash2,
  Edit2,
  Download,
  Share2,
  Lock,
  Grid3X3,
  List,
  GripVertical,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Playlist, Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { SongCard } from "@/components/SongCard";
import { cn } from "@/lib/utils";

interface PlaylistViewProps {
  playlist: Playlist;
  onBack: () => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ playlist, onBack }) => {
  const { playPlaylist, currentSong, isPlaying, playSong, pauseSong } = usePlayer();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [songs, setSongs] = useState(playlist.songs);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playlist.name);

  const isActive = songs.some((s) => s.id === currentSong?.id);

  const handlePlayAll = () => {
    if (isActive && isPlaying) {
      pauseSong();
    } else {
      playPlaylist(songs);
    }
  };

  const handleReorder = (newOrder: Song[]) => {
    setSongs(newOrder);
  };

  const typeIcons = {
    youtube: <Lock className="w-3 h-3" />,
    offline: <Download className="w-3 h-3" />,
    online: null,
    custom: <Edit2 className="w-3 h-3" />,
    smart: null,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen bg-background"
    >
      {/* Hero Header */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 scale-110 blur-2xl opacity-50"
          style={{
            backgroundImage: `url(${playlist.thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
          <button
            onClick={onBack}
            className="absolute top-6 left-6 p-2 glass-button rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-end gap-6">
            {/* Playlist artwork */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-36 h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl album-glow flex-shrink-0"
            >
              {songs.length >= 4 ? (
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
                  {songs.slice(0, 4).map((song) => (
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
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full capitalize inline-flex items-center gap-1",
                    playlist.type === "youtube" && "bg-destructive/20 text-destructive",
                    playlist.type === "offline" && "bg-primary/20 text-primary",
                    playlist.type === "online" && "bg-accent/20 text-accent",
                    playlist.type === "custom" && "bg-muted text-muted-foreground",
                    playlist.type === "smart" && "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground"
                  )}
                >
                  {typeIcons[playlist.type]}
                  {playlist.type}
                </span>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl md:text-4xl font-display font-bold bg-transparent border-b-2 border-primary outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 text-primary"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <h1 className="text-2xl md:text-4xl font-display font-bold truncate mb-1">
                  {editedName}
                </h1>
              )}

              <p className="text-muted-foreground truncate mb-3">
                {playlist.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{songs.length} songs</span>
                <span>•</span>
                <span>
                  {Math.floor(
                    songs.reduce((acc, s) => acc + s.duration, 0) / 60
                  )}{" "}
                  min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium glow-primary"
          >
            {isActive && isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 ml-0.5" />
                Play All
              </>
            )}
          </motion.button>

          <button className="p-3 glass-button rounded-full">
            <Download className="w-5 h-5" />
          </button>

          <button className="p-3 glass-button rounded-full">
            <Share2 className="w-5 h-5" />
          </button>

          {playlist.type === "custom" && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "p-3 rounded-full transition-colors",
                isEditing ? "bg-primary/20 text-primary" : "glass-button"
              )}
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground"
            )}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground"
            )}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Songs List */}
      <div className="p-6">
        {viewMode === "list" ? (
          <Reorder.Group
            axis="y"
            values={songs}
            onReorder={handleReorder}
            className="space-y-1"
          >
            {songs.map((song, index) => (
              <DraggableSongItem
                key={song.id}
                song={song}
                index={index}
                isEditing={isEditing && playlist.type === "custom"}
              />
            ))}
          </Reorder.Group>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {songs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} />
            ))}
          </motion.div>
        )}

        {/* Add songs button for custom playlists */}
        {playlist.type === "custom" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full mt-6 p-4 border-2 border-dashed border-muted rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add songs
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Draggable song item component
const DraggableSongItem: React.FC<{
  song: Song;
  index: number;
  isEditing: boolean;
}> = ({ song, index, isEditing }) => {
  const controls = useDragControls();
  const { currentSong, isPlaying, playSong, pauseSong, resumeSong } = usePlayer();
  const isActive = currentSong?.id === song.id;

  const handlePlay = () => {
    if (isActive) {
      isPlaying ? pauseSong() : resumeSong();
    } else {
      playSong(song);
    }
  };

  return (
    <Reorder.Item
      value={song}
      dragListener={isEditing}
      dragControls={controls}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-colors group",
        isActive ? "bg-primary/10" : "hover:bg-muted/50"
      )}
    >
      {isEditing && (
        <button
          onPointerDown={(e) => controls.start(e)}
          className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      )}

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

      <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handlePlay}
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
        <h4
          className={cn(
            "font-medium truncate text-sm",
            isActive && "text-primary"
          )}
        >
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
        <button className="p-1 hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <span className="text-sm text-muted-foreground">
        {Math.floor(song.duration / 60)}:
        {(song.duration % 60).toString().padStart(2, "0")}
      </span>

      {isEditing && (
        <button className="p-1 text-destructive hover:text-destructive/80 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </Reorder.Item>
  );
};
