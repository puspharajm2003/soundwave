import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Link,
  Download,
  X,
  Music,
  Video,
  Check,
  Loader2,
  ListMusic,
  FileAudio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Song } from "@/types/music";
import { toast } from "@/hooks/use-toast";
import { saveSongData } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";

interface DownloadFormat {
  id: string;
  name: string;
  extension: string;
  quality: string;
  icon: React.ReactNode;
}

const AUDIO_FORMATS: DownloadFormat[] = [
  { id: "mp3-320", name: "MP3", extension: "mp3", quality: "320kbps", icon: <FileAudio className="w-4 h-4" /> },
  { id: "mp3-192", name: "MP3", extension: "mp3", quality: "192kbps", icon: <FileAudio className="w-4 h-4" /> },
  { id: "mp3-128", name: "MP3", extension: "mp3", quality: "128kbps", icon: <FileAudio className="w-4 h-4" /> },
  { id: "flac", name: "FLAC", extension: "flac", quality: "Lossless", icon: <Music className="w-4 h-4" /> },
  { id: "wav", name: "WAV", extension: "wav", quality: "Lossless", icon: <Music className="w-4 h-4" /> },
  { id: "aac", name: "AAC", extension: "aac", quality: "256kbps", icon: <FileAudio className="w-4 h-4" /> },
  { id: "ogg", name: "OGG", extension: "ogg", quality: "256kbps", icon: <FileAudio className="w-4 h-4" /> },
  { id: "m4a", name: "M4A", extension: "m4a", quality: "256kbps", icon: <FileAudio className="w-4 h-4" /> },
];

interface URLDownloaderProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadComplete?: (song: Song) => void;
}

interface ParsedURL {
  platform: "youtube" | "soundcloud" | "spotify" | "other";
  type: "single" | "playlist";
  id: string;
  title?: string;
}

const parseURL = (url: string): ParsedURL | null => {
  try {
    const urlObj = new URL(url);

    // YouTube
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      const isPlaylist = urlObj.searchParams.has("list");
      const videoId = urlObj.searchParams.get("v") || urlObj.pathname.slice(1);
      return {
        platform: "youtube",
        type: isPlaylist ? "playlist" : "single",
        id: isPlaylist ? urlObj.searchParams.get("list")! : videoId,
      };
    }

    // SoundCloud
    if (urlObj.hostname.includes("soundcloud.com")) {
      const isPlaylist = urlObj.pathname.includes("/sets/");
      return {
        platform: "soundcloud",
        type: isPlaylist ? "playlist" : "single",
        id: urlObj.pathname,
      };
    }

    // Spotify
    if (urlObj.hostname.includes("spotify.com")) {
      const isPlaylist = urlObj.pathname.includes("/playlist/");
      const id = urlObj.pathname.split("/").pop() || "";
      return {
        platform: "spotify",
        type: isPlaylist ? "playlist" : "single",
        id,
      };
    }

    return {
      platform: "other",
      type: "single",
      id: url,
    };
  } catch {
    return null;
  }
};

export const URLDownloader: React.FC<URLDownloaderProps> = ({
  isOpen,
  onClose,
  onDownloadComplete,
}) => {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [parsedURL, setParsedURL] = useState<ParsedURL | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("mp3-320");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [detectedTracks, setDetectedTracks] = useState<Array<{ id: string; title: string; artist: string; thumbnail: string }>>([]);

  const handleURLChange = (value: string) => {
    setUrl(value);
    if (value.length > 10) {
      const parsed = parseURL(value);
      setParsedURL(parsed);
    } else {
      setParsedURL(null);
      setDetectedTracks([]);
    }
  };

  const handleAnalyze = async () => {
    if (!parsedURL) return;

    setIsAnalyzing(true);

    // Simulate API call to analyze URL
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (parsedURL.type === "playlist") {
      // Simulate detected playlist tracks
      setDetectedTracks([
        { id: "1", title: "Track 1", artist: "Artist A", thumbnail: "https://picsum.photos/seed/track1/80/80" },
        { id: "2", title: "Track 2", artist: "Artist B", thumbnail: "https://picsum.photos/seed/track2/80/80" },
        { id: "3", title: "Track 3", artist: "Artist C", thumbnail: "https://picsum.photos/seed/track3/80/80" },
        { id: "4", title: "Track 4", artist: "Artist D", thumbnail: "https://picsum.photos/seed/track4/80/80" },
        { id: "5", title: "Track 5", artist: "Artist E", thumbnail: "https://picsum.photos/seed/track5/80/80" },
      ]);
    } else {
      setDetectedTracks([
        { id: "1", title: "Detected Track", artist: "Unknown Artist", thumbnail: "https://picsum.photos/seed/single/80/80" },
      ]);
    }

    setIsAnalyzing(false);
  };

  const handleDownload = async () => {
    if (detectedTracks.length === 0) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    const format = AUDIO_FORMATS.find(f => f.id === selectedFormat);

    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setDownloadProgress(i);
    }

    // Create song objects from downloaded tracks
    const savePromises = detectedTracks.map(async (track, index) => {
      const song: Song = {
        id: `download-${Date.now()}-${index}`,
        title: track.title,
        artist: track.artist,
        album: "Downloaded",
        duration: 180 + Math.floor(Math.random() * 120),
        thumbnail: track.thumbnail,
        source: parsedURL?.platform === "youtube" ? "youtube" : "local",
        isDownloaded: true,
      };

      // Save metadata to IndexedDB
      // For now we don't have a real blob for "simulated" download, but we save the song.
      // If we had a blob, we'd pass it as second arg.
      await saveSongData(song);

      return song;
    });

    const savedSongs = await Promise.all(savePromises);

    // Invalidate query to update UI
    queryClient.invalidateQueries({ queryKey: ['local-songs'] });

    savedSongs.forEach(song => {
      onDownloadComplete?.(song);
    });

    toast({
      title: "Download Complete",
      description: `${detectedTracks.length} track(s) downloaded and saved to library.`,
    });

    setIsDownloading(false);
    setUrl("");
    setParsedURL(null);
    setDetectedTracks([]);
    onClose();
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "youtube": return "text-destructive";
      case "soundcloud": return "text-orange-500";
      case "spotify": return "text-green-500";
      default: return "text-primary";
    }
  };

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
            className="glass-card w-full max-w-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Download Music</h2>
                  <p className="text-sm text-muted-foreground">
                    Paste a link from YouTube, SoundCloud, or Spotify
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

            {/* URL Input */}
            <div className="mb-6">
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => handleURLChange(e.target.value)}
                  placeholder="Paste YouTube, SoundCloud, or Spotify URL..."
                  className="pl-12 pr-4 py-6 text-lg bg-muted/30 border-muted"
                />
              </div>

              {parsedURL && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2"
                >
                  <span className={cn("text-sm font-medium capitalize", getPlatformColor(parsedURL.platform))}>
                    {parsedURL.platform}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    {parsedURL.type === "playlist" ? (
                      <>
                        <ListMusic className="w-4 h-4" />
                        Playlist detected
                      </>
                    ) : (
                      <>
                        <Music className="w-4 h-4" />
                        Single track
                      </>
                    )}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Analyze Button */}
            {parsedURL && detectedTracks.length === 0 && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full mb-6"
                variant="glow"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Analyze URL
                  </>
                )}
              </Button>
            )}

            {/* Detected Tracks */}
            {detectedTracks.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Detected Tracks ({detectedTracks.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detectedTracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                    >
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground">{track.artist}</p>
                      </div>
                      <Check className="w-4 h-4 text-green-500" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Format Selection */}
            {detectedTracks.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Select Format
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AUDIO_FORMATS.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={cn(
                        "p-3 rounded-xl text-left transition-all",
                        selectedFormat === format.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {format.icon}
                        <span className="font-medium">{format.name}</span>
                      </div>
                      <span className="text-xs opacity-70">{format.quality}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Download Progress */}
            {isDownloading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Downloading...</span>
                  <span className="text-sm font-medium">{downloadProgress}%</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${downloadProgress}%` }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </motion.div>
            )}

            {/* Download Button */}
            {detectedTracks.length > 0 && !isDownloading && (
              <Button
                onClick={handleDownload}
                className="w-full"
                variant="glow"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download {detectedTracks.length} Track{detectedTracks.length > 1 ? "s" : ""}
              </Button>
            )}

            {/* Supported Platforms */}
            <div className="mt-6 pt-6 border-t border-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Supports YouTube, YouTube Music, SoundCloud, Spotify, and direct audio URLs
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
