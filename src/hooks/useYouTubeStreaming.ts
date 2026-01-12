import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/types/music";
import { toast } from "sonner";

interface YouTubeStreamInfo {
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: number;
  audioUrl: string | null;
  streamAvailable: boolean;
}

interface UseYouTubeStreamingResult {
  isLoading: boolean;
  error: string | null;
  currentStream: YouTubeStreamInfo | null;
  getStreamInfo: (videoIdOrUrl: string) => Promise<YouTubeStreamInfo | null>;
  playYouTubeVideo: (videoIdOrUrl: string) => Promise<Song | null>;
}

export const useYouTubeStreaming = (): UseYouTubeStreamingResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<YouTubeStreamInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Extract video ID from URL or use directly
  const extractVideoId = (input: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getStreamInfo = useCallback(async (videoIdOrUrl: string): Promise<YouTubeStreamInfo | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const videoId = extractVideoId(videoIdOrUrl);
      
      if (!videoId) {
        throw new Error("Invalid YouTube URL or video ID");
      }

      console.log("Fetching stream info for:", videoId);

      const { data, error: fnError } = await supabase.functions.invoke('youtube-audio', {
        body: { videoId, action: 'stream' }
      });

      if (fnError) {
        console.error("Edge function error:", fnError);
        throw new Error(fnError.message || "Failed to fetch stream info");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to get stream info");
      }

      const streamInfo: YouTubeStreamInfo = data.data;
      setCurrentStream(streamInfo);
      
      return streamInfo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch stream";
      console.error("Stream error:", errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const playYouTubeVideo = useCallback(async (videoIdOrUrl: string): Promise<Song | null> => {
    const streamInfo = await getStreamInfo(videoIdOrUrl);
    
    if (!streamInfo) {
      toast.error("Failed to get video info");
      return null;
    }

    // Create a Song object from the stream info
    const song: Song = {
      id: `yt-${streamInfo.videoId}`,
      title: streamInfo.title,
      artist: streamInfo.author,
      album: "YouTube",
      duration: streamInfo.duration || 180,
      thumbnail: streamInfo.thumbnail,
      source: "youtube",
      isDownloaded: false,
      youtubeId: streamInfo.videoId,
    };

    if (streamInfo.audioUrl && streamInfo.streamAvailable) {
      toast.success(`Loading: ${streamInfo.title}`);
      // The audioUrl can be used directly with an audio element
      // Store it for the player to use
      (song as any).streamUrl = streamInfo.audioUrl;
    } else {
      toast.info("Stream not available - using demo playback", {
        description: "Real streaming requires external service"
      });
    }

    return song;
  }, [getStreamInfo]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return {
    isLoading,
    error,
    currentStream,
    getStreamInfo,
    playYouTubeVideo,
  };
};
