import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, Plus, Download, Youtube, TrendingUp, X, Loader2, Wifi, WifiOff } from "lucide-react";
import { useYouTubeSearch, YouTubeSearchResult } from "@/lib/youtubeApi";
import { useYouTubeStreaming } from "@/hooks/useYouTubeStreaming";
import { usePlayer } from "@/context/PlayerContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface YouTubeSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToPlaylist?: (song: any) => void;
}

export const YouTubeSearch: React.FC<YouTubeSearchProps> = ({
  isOpen,
  onClose,
  onAddToPlaylist,
}) => {
  const [query, setQuery] = useState("");
  const [showTrending, setShowTrending] = useState(true);
  const [streamingVideoId, setStreamingVideoId] = useState<string | null>(null);
  const { results, isSearching, search, getTrending, convertToSong } = useYouTubeSearch();
  const { isLoading: isStreamLoading, playYouTubeVideo } = useYouTubeStreaming();
  const { playSong, addToQueue } = usePlayer();

  useEffect(() => {
    if (isOpen && showTrending) {
      getTrending();
    }
  }, [isOpen, showTrending, getTrending]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowTrending(false);
      search(query);
    }
  }, [query, search]);

  const handlePlay = useCallback(async (result: YouTubeSearchResult) => {
    setStreamingVideoId(result.videoId);
    
    // Try to get real stream first
    const song = await playYouTubeVideo(result.videoId);
    
    if (song) {
      playSong(song);
      toast.success(`Now playing: ${song.title}`);
    } else {
      // Fallback to demo song
      const demoSong = convertToSong(result);
      playSong(demoSong);
      toast.info(`Playing: ${result.title}`, {
        description: "Using demo audio"
      });
    }
    
    setStreamingVideoId(null);
  }, [convertToSong, playSong, playYouTubeVideo]);

  const handleAddToQueue = useCallback((result: YouTubeSearchResult) => {
    const song = convertToSong(result);
    addToQueue(song);
    toast.success(`Added to queue: ${result.title}`);
  }, [convertToSong, addToQueue]);

  const handleAddToPlaylist = useCallback((result: YouTubeSearchResult) => {
    const song = convertToSong(result);
    onAddToPlaylist?.(song);
    toast.success(`Added to YouTube Playlist: ${result.title}`);
  }, [convertToSong, onAddToPlaylist]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] bg-background/95 backdrop-blur-xl"
        >
          <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-destructive/10">
                  <Youtube className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">YouTube Music</h2>
                  <p className="text-sm text-muted-foreground">
                    Search and stream from YouTube
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for songs, artists, albums..."
                  className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                )}
              </div>
            </form>

            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">
                {showTrending ? "Trending Now" : `Results for "${query}"`}
              </h3>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={result.thumbnail}
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handlePlay(result)}
                        disabled={streamingVideoId === result.videoId}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                      >
                        {streamingVideoId === result.videoId ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Play className="w-6 h-6 text-white fill-white" />
                        )}
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{result.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.artist}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(result.duration)}
                        </span>
                        {result.viewCount && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {result.viewCount}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleAddToQueue(result)}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        title="Add to queue"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleAddToPlaylist(result)}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        title="Save to YouTube Playlist"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {results.length === 0 && !isSearching && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Youtube className="w-16 h-16 mb-4 opacity-50" />
                  <p>Search for music on YouTube</p>
                </div>
              )}
            </div>

            {/* Stream Status Notice */}
            <div className="mt-4 p-4 rounded-xl bg-muted/30 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Wifi className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Real YouTube Streaming</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Audio streams from YouTube via privacy-respecting proxies
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default YouTubeSearch;
