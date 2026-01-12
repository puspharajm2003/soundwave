import React, { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Plus,
  GripVertical,
  Trash2,
  Save,
  Image,
  Music,
  ListMusic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Song, Playlist } from "@/types/music";
import { toast } from "@/hooks/use-toast";

interface PlaylistEditorProps {
  isOpen: boolean;
  onClose: () => void;
  playlist?: Playlist;
  availableSongs: Song[];
  onSave: (playlist: Playlist) => void;
}

export const PlaylistEditor: React.FC<PlaylistEditorProps> = ({
  isOpen,
  onClose,
  playlist,
  availableSongs,
  onSave,
}) => {
  const isEditing = !!playlist;
  
  const [name, setName] = useState(playlist?.name || "");
  const [description, setDescription] = useState(playlist?.description || "");
  const [songs, setSongs] = useState<Song[]>(playlist?.songs || []);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddSong = useCallback((song: Song) => {
    if (!songs.find(s => s.id === song.id)) {
      setSongs([...songs, song]);
    }
  }, [songs]);

  const handleRemoveSong = useCallback((songId: string) => {
    setSongs(songs.filter(s => s.id !== songId));
  }, [songs]);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a playlist name",
        variant: "destructive",
      });
      return;
    }

    const newPlaylist: Playlist = {
      id: playlist?.id || `playlist-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      thumbnail: songs[0]?.thumbnail || "https://picsum.photos/seed/playlist/400/400",
      songs,
      type: "custom",
      createdAt: playlist?.createdAt || new Date(),
      songCount: songs.length,
    };

    onSave(newPlaylist);
    toast({
      title: isEditing ? "Playlist updated" : "Playlist created",
      description: `"${name}" has been ${isEditing ? "updated" : "created"}`,
    });
    onClose();
  }, [name, description, songs, playlist, isEditing, onSave, onClose]);

  const filteredAvailableSongs = availableSongs.filter(
    song =>
      !songs.find(s => s.id === song.id) &&
      (song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-3xl p-6 md:p-8 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <ListMusic className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">
                    {isEditing ? "Edit Playlist" : "Create Playlist"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {songs.length} song{songs.length !== 1 ? "s" : ""}
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

            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Playlist Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Playlist Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cover Image</label>
                  <div className="flex items-center gap-2">
                    {songs[0]?.thumbnail ? (
                      <img
                        src={songs[0].thumbnail}
                        alt="Cover"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                        <Image className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from first song
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your playlist..."
                  className="bg-muted/30 resize-none"
                  rows={2}
                />
              </div>

              {/* Songs List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Songs</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSongPicker(!showSongPicker)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Songs
                  </Button>
                </div>

                {songs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No songs added yet</p>
                    <p className="text-sm">Click "Add Songs" to get started</p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={songs}
                    onReorder={setSongs}
                    className="space-y-2"
                  >
                    {songs.map((song, index) => (
                      <Reorder.Item
                        key={song.id}
                        value={song}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <motion.div
                          layout
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 group"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100" />
                          <span className="text-sm text-muted-foreground w-6">
                            {index + 1}
                          </span>
                          <img
                            src={song.thumbnail}
                            alt={song.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{song.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {song.artist}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveSong(song.id)}
                            className="p-2 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </div>

              {/* Song Picker */}
              <AnimatePresence>
                {showSongPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-muted/20 border border-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Add Songs</h4>
                        <button
                          onClick={() => setShowSongPicker(false)}
                          className="p-1 rounded hover:bg-muted/50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search songs..."
                        className="mb-3 bg-muted/30"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredAvailableSongs.map((song) => (
                          <button
                            key={song.id}
                            onClick={() => handleAddSong(song)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <img
                              src={song.thumbnail}
                              alt={song.title}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div className="flex-1 text-left min-w-0">
                              <p className="text-sm font-medium truncate">
                                {song.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {song.artist}
                              </p>
                            </div>
                            <Plus className="w-4 h-4 text-primary" />
                          </button>
                        ))}
                        {filteredAvailableSongs.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground py-4">
                            No songs found
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-muted/30">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} variant="glow">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Save Changes" : "Create Playlist"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
