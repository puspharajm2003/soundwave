import React, { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  X,
  ListMusic,
  Play,
  Pause,
  Trash2,
  GripVertical,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ isOpen, onClose }) => {
  const {
    queue,
    currentSong,
    queueIndex,
    isPlaying,
    playSong,
    pauseSong,
    resumeSong,
    setQueue,
    removeFromQueue,
  } = usePlayer();

  const handleReorder = (newQueue: Song[]) => {
    setQueue(newQueue);
  };

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        pauseSong();
      } else {
        resumeSong();
      }
    } else {
      playSong(song);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const upNext = queue.slice(queueIndex + 1);
  const previouslyPlayed = queue.slice(0, queueIndex);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] flex items-end md:items-center justify-end bg-background/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="glass-card w-full md:w-96 h-[80vh] md:h-full md:max-h-[90vh] md:mr-4 md:my-4 rounded-t-3xl md:rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <ListMusic className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-bold">Queue</h2>
                  <p className="text-xs text-muted-foreground">
                    {queue.length} song{queue.length !== 1 ? "s" : ""}
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Music className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium">Queue is empty</p>
                  <p className="text-sm">Add songs to start listening</p>
                </div>
              ) : (
                <>
                  {/* Now Playing */}
                  {currentSong && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Now Playing
                      </p>
                      <motion.div
                        layoutId={`queue-${currentSong.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
                      >
                        <div className="relative">
                          <img
                            src={currentSong.thumbnail}
                            alt={currentSong.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-background/40 rounded-lg">
                            {isPlaying ? (
                              <div className="flex gap-0.5">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ height: [4, 12, 4] }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.5,
                                      delay: i * 0.1,
                                    }}
                                    className="w-1 bg-primary rounded-full"
                                  />
                                ))}
                              </div>
                            ) : (
                              <Pause className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-primary">
                            {currentSong.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {currentSong.artist}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(currentSong.duration)}
                        </span>
                      </motion.div>
                    </div>
                  )}

                  {/* Up Next */}
                  {upNext.length > 0 && (
                    <div className="p-4 pt-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Up Next
                      </p>
                      <Reorder.Group
                        axis="y"
                        values={upNext}
                        onReorder={(newUpNext) => {
                          handleReorder([...previouslyPlayed, currentSong!, ...newUpNext]);
                        }}
                        className="space-y-1"
                      >
                        {upNext.map((song, index) => (
                          <Reorder.Item
                            key={song.id}
                            value={song}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <motion.div
                              layout
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors group"
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-50" />
                              <span className="text-xs text-muted-foreground w-4">
                                {index + 1}
                              </span>
                              <img
                                src={song.thumbnail}
                                alt={song.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm">
                                  {song.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {song.artist}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handlePlaySong(song)}
                                  className="p-1.5 rounded-full hover:bg-primary/20"
                                >
                                  <Play className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeFromQueue(song.id)}
                                  className="p-1.5 rounded-full hover:bg-destructive/20 text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </div>
                  )}

                  {/* Previously Played */}
                  {previouslyPlayed.length > 0 && (
                    <div className="p-4 pt-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Previously Played
                      </p>
                      <div className="space-y-1 opacity-60">
                        {previouslyPlayed.map((song, index) => (
                          <motion.div
                            key={song.id}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors group"
                          >
                            <span className="text-xs text-muted-foreground w-8">
                              {index + 1}
                            </span>
                            <img
                              src={song.thumbnail}
                              alt={song.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">
                                {song.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {song.artist}
                              </p>
                            </div>
                            <button
                              onClick={() => handlePlaySong(song)}
                              className="p-1.5 rounded-full hover:bg-primary/20 opacity-0 group-hover:opacity-100"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {queue.length > 0 && (
              <div className="p-4 border-t border-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (currentSong) {
                      setQueue([currentSong]);
                    }
                  }}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Queue
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
