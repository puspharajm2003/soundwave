import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Play, Plus, Download, Youtube, TrendingUp,
  Loader2, Radio, Link2, Music2, Sparkles, ExternalLink,
  Clock, Eye, Calendar, ListMusic
} from "lucide-react";
import { useYouTubeSearch, YouTubeSearchResult } from "@/lib/youtubeApi";
import { useYouTubeStreaming } from "@/hooks/useYouTubeStreaming";
import { usePlayer } from "@/context/PlayerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { PlayerProvider } from "@/context/PlayerContext";
import { MusicPlayer } from "@/components/player";
import { supabase } from "@/integrations/supabase/client";
import { saveSongData } from "@/lib/db";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20 }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const YouTubeContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("youtube");
  const [query, setQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [showTrending, setShowTrending] = useState(true);
  const [streamingVideoId, setStreamingVideoId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedVideo, setAnalyzedVideo] = useState<any>(null);

  // Playlist Dialog State
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const { results, isSearching, search, getTrending, convertToSong } = useYouTubeSearch();
  const { isLoading: isStreamLoading, playYouTubeVideo, getStreamInfo } = useYouTubeStreaming();
  const { playSong, addToQueue } = usePlayer();

  useEffect(() => {
    getTrending();
  }, [getTrending]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowTrending(false);
      search(query);
    }
  }, [query, search]);

  const handlePlay = useCallback(async (result: YouTubeSearchResult) => {
    setStreamingVideoId(result.videoId);

    const song = await playYouTubeVideo(result.videoId);

    if (song) {
      playSong(song);
      toast.success(`Now playing: ${song.title}`);
    } else {
      const demoSong = convertToSong(result);
      playSong(demoSong);
      toast.info(`Playing: ${result.title}`, {
        description: "Demo mode"
      });
    }

    setStreamingVideoId(null);
  }, [convertToSong, playSong, playYouTubeVideo]);

  const handleAddToQueue = useCallback((result: YouTubeSearchResult) => {
    const song = convertToSong(result);
    addToQueue(song);
    toast.success(`Added to queue: ${result.title}`);
  }, [convertToSong, addToQueue]);

  const handleAnalyzeUrl = async () => {
    if (!urlInput.trim()) return;

    setIsAnalyzing(true);
    setAnalyzedVideo(null);

    try {
      // Extract video ID and get info via playYouTubeVideo
      const videoIdMatch = urlInput.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (videoIdMatch) {
        const song = await playYouTubeVideo(videoIdMatch[1]);
        if (song) {
          setAnalyzedVideo({
            videoId: videoIdMatch[1],
            title: song.title,
            author: song.artist,
            thumbnail: song.thumbnail,
          });
          toast.success("Video found!");
        } else {
          toast.error("Could not analyze video");
        }
      } else {
        toast.error("Invalid YouTube URL");
      }
    } catch (error) {
      toast.error("Invalid URL or video not found");
    }

    setIsAnalyzing(false);
  };

  const handlePlayAnalyzed = async () => {
    if (!analyzedVideo) return;

    setStreamingVideoId(analyzedVideo.videoId);
    let song = await playYouTubeVideo(analyzedVideo.videoId);

    // FIX: If API fails to return a song (no metadata), construct one manually from what we analyzed
    if (!song) {
      song = {
        id: `yt-${analyzedVideo.videoId}`,
        title: analyzedVideo.title,
        artist: analyzedVideo.author,
        album: "YouTube",
        duration: analyzedVideo.duration || 180,
        thumbnail: analyzedVideo.thumbnail,
        source: "youtube" as const,
        isDownloaded: false,
        youtubeId: analyzedVideo.videoId,
      };
    }

    if (song) {
      playSong(song);
      toast.success(`Now playing: ${song.title}`);
    } else {
      toast.error("Failed to play video");
    }

    setStreamingVideoId(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    // In a real app, this would modify the DB.
    // For now, we'll just mock it and show success.

    // TODO: Add actual DB insert for Playlist
    toast.success(`Created playlist: ${newPlaylistName}`);
    setIsPlaylistDialogOpen(false);
    setNewPlaylistName("");
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-background"
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-destructive/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="lg:ml-64 pb-40">
        <motion.div variants={itemVariants} className="px-4 md:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/20"
            >
              <Youtube className="w-10 h-10 text-destructive" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
                YouTube Music
              </h1>
              <p className="text-muted-foreground">
                Search, stream, and download from YouTube
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-muted/30">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <span className="hidden sm:inline">URL</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search">
              <motion.div variants={itemVariants}>
                <form onSubmit={handleSearch} className="mb-8">
                  <div className="relative max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for songs, artists, albums..."
                      className="pl-12 pr-24 py-6 text-lg bg-muted/30 border-muted rounded-2xl"
                    />
                    <Button
                      type="submit"
                      disabled={isSearching}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      variant="glow"
                    >
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>
                </form>

                {/* Results */}
                <div className="grid gap-3">
                  <AnimatePresence mode="popLayout">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.id}
                        variants={itemVariants}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 5 }}
                        className="group glass-card p-4 flex items-center gap-4 cursor-pointer"
                        onClick={() => handlePlay(result)}
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60"
                          >
                            {streamingVideoId === result.videoId ? (
                              <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : (
                              <Play className="w-8 h-8 text-white fill-white" />
                            )}
                          </motion.div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate text-lg">{result.title}</h4>
                          <p className="text-muted-foreground truncate">{result.artist}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(result.duration)}
                            </span>
                            {result.viewCount && (
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {result.viewCount}
                              </span>
                            )}
                            {result.publishedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {result.publishedAt}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToQueue(result);
                            }}
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={async (e) => {
                              e.stopPropagation();
                              toast.info("Downloading...");
                              try {
                                const streamInfo = await getStreamInfo(result.videoId);
                                if (streamInfo?.audioUrl) {
                                  try {
                                    const response = await fetch(streamInfo.audioUrl);
                                    const blob = await response.blob();
                                    const song = convertToSong(result);
                                    const downloadedSong = { ...song, isDownloaded: true, source: 'youtube' as const };
                                    await saveSongData(downloadedSong, blob);
                                    toast.success("Downloaded for offline play!");
                                  } catch (err) {
                                    console.error("Download failed (CORS likely):", err);
                                    toast.error("Download failed. CORS restricted.");
                                  }
                                } else {
                                  toast.error("Stream not available for download");
                                }
                              } catch (err) {
                                toast.error("Failed to download");
                              }
                            }}
                          >
                            <Download className="w-5 h-5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url">
              <motion.div variants={itemVariants} className="max-w-2xl">
                <div className="glass-card p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Link2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Play from URL</h3>
                      <p className="text-sm text-muted-foreground">
                        Paste a YouTube video or playlist URL
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="py-6 text-lg bg-muted/30"
                    />

                    <Button
                      onClick={handleAnalyzeUrl}
                      disabled={isAnalyzing || !urlInput.trim()}
                      className="w-full"
                      variant="glow"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analyze URL
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Analyzed Video */}
                  <AnimatePresence>
                    {analyzedVideo && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-6 p-4 rounded-xl bg-muted/30 space-y-4"
                      >
                        <div className="flex gap-4">
                          <img
                            src={analyzedVideo.thumbnail}
                            alt={analyzedVideo.title}
                            className="w-32 h-32 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{analyzedVideo.title}</h4>
                            <p className="text-muted-foreground">{analyzedVideo.author}</p>

                            <div className="flex gap-2 mt-4">
                              <Button
                                onClick={handlePlayAnalyzed}
                                disabled={streamingVideoId === analyzedVideo.videoId}
                                variant="glow"
                              >
                                {streamingVideoId === analyzedVideo.videoId ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4 mr-2 fill-current" />
                                )}
                                Play Now
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  const song = {
                                    id: `yt-${analyzedVideo.videoId}`,
                                    title: analyzedVideo.title,
                                    artist: analyzedVideo.author,
                                    album: "YouTube",
                                    duration: analyzedVideo.duration || 180,
                                    thumbnail: analyzedVideo.thumbnail,
                                    source: "youtube" as const,
                                    isDownloaded: false,
                                    youtubeId: analyzedVideo.videoId,
                                  };
                                  addToQueue(song);
                                  toast.success("Added to queue");
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Queue
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => setIsPlaylistDialogOpen(true)}
                              >
                                <ListMusic className="w-4 h-4 mr-2" />
                                Add to Playlist
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Playlist Creation Dialog */}
                  <Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10">
                      <DialogHeader>
                        <DialogTitle>Add to Playlist</DialogTitle>
                        <DialogDescription>
                          Create a new playlist or add to an existing one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="playlist-name">New Playlist Name</Label>
                          <div className="flex gap-2">
                            <Input
                              id="playlist-name"
                              value={newPlaylistName}
                              onChange={(e) => setNewPlaylistName(e.target.value)}
                              placeholder="My Awesome Playlist"
                              className="bg-white/5 border-white/10"
                            />
                            <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>
                              Create
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>
            </TabsContent>

            {/* Trending Tab */}
            <TabsContent value="trending">
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-xl">Trending Now</h3>
                </div>

                {results.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.id}
                        variants={itemVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="glass-card overflow-hidden cursor-pointer group"
                        onClick={() => handlePlay(result)}
                      >
                        <div className="relative aspect-video">
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="p-4 rounded-full bg-primary/90 backdrop-blur-sm">
                              {streamingVideoId === result.videoId ? (
                                <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                              ) : (
                                <Play className="w-8 h-8 text-primary-foreground fill-current" />
                              )}
                            </div>
                          </motion.div>
                          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-xs">
                            {formatDuration(result.duration)}
                          </div>
                          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-destructive/90 text-xs font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            #{index + 1}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold truncate">{result.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">{result.artist}</p>
                          {result.viewCount && (
                            <p className="text-xs text-muted-foreground mt-1">{result.viewCount}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center glass-card">
                    <div className="p-4 rounded-full bg-primary/10 mb-4">
                      <Search className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Ready to explore?</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                      Use the search tab to find your favorite songs, artists, or albums from YouTube.
                    </p>
                    <Button variant="glow" onClick={() => setActiveTab("search")}>
                      Start Searching
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <MusicPlayer />
    </motion.div>
  );
};

const YouTubePage: React.FC = () => {
  return (
    <PlayerProvider>
      <YouTubeContent />
    </PlayerProvider>
  );
};

export default YouTubePage;
