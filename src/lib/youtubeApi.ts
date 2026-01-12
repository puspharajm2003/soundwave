import { Song } from "@/types/music";

export interface YouTubeSearchResult {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  viewCount?: string;
  publishedAt?: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
}

// Demo YouTube search results for UI demonstration
// REPLACED: No fake data. Return empty or real data only.
const DEMO_YOUTUBE_RESULTS: YouTubeSearchResult[] = [];

class YouTubeAPI {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async search(query: string): Promise<YouTubeSearchResult[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&q=${encodeURIComponent(
          query
        )}&key=${this.apiKey}`
      );

      if (!response.ok) throw new Error("YouTube API error");

      const data = await response.json();

      return data.items.map((item: any) => ({
        id: item.id.videoId,
        videoId: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        duration: 0, // Would need additional API call for duration
        publishedAt: new Date(item.snippet.publishedAt).getFullYear().toString(),
      }));
    } catch (error) {
      console.error("YouTube search error:", error);
      return [];
    }
  }

  async getTrending(): Promise<YouTubeSearchResult[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&maxResults=20&key=${this.apiKey}`
      );

      if (!response.ok) throw new Error("YouTube API error");

      const data = await response.json();

      return data.items.map((item: any) => ({
        id: item.id,
        videoId: item.id,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url,
        duration: 0,
        viewCount: `${(parseInt(item.statistics.viewCount) / 1000000).toFixed(1)}M views`,
        publishedAt: new Date(item.snippet.publishedAt).getFullYear().toString(),
      }));
    } catch (error) {
      console.error("YouTube trending error:", error);
      return [];
    }
  }

  convertToSong(result: YouTubeSearchResult): Song {
    return {
      id: `yt-${result.videoId}`,
      title: result.title,
      artist: result.artist,
      album: "YouTube Music",
      duration: result.duration || 180,
      thumbnail: result.thumbnail,
      source: "youtube",
      isDownloaded: false,
      youtubeId: result.videoId,
    };
  }
}

export const youtubeApi = new YouTubeAPI();

// React hook for YouTube search
import { useState, useCallback } from "react";

export const useYouTubeSearch = () => {
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await youtubeApi.search(query);
      setResults(searchResults);
    } catch (err) {
      setError("Failed to search YouTube");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getTrending = useCallback(async () => {
    setIsSearching(true);
    setError(null);

    try {
      const trendingResults = await youtubeApi.getTrending();
      setResults(trendingResults);
    } catch (err) {
      setError("Failed to get trending");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    getTrending,
    convertToSong: youtubeApi.convertToSong.bind(youtubeApi),
  };
};
