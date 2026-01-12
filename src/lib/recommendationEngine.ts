import { Song } from "@/types/music";
import { offlineStorage } from "./offlineStorage";

export interface ListeningHistoryEntry {
  songId: string;
  timestamp: number;
  duration: number;
  completed: boolean;
}

export interface RecommendationScore {
  songId: string;
  score: number;
  reasons: string[];
}

export interface AIRecommendation {
  song: Song;
  score: number;
  reason: string;
  confidence: number;
}

// Scoring weights
const WEIGHTS = {
  playFrequency: 0.3,
  completionRate: 0.25,
  recency: 0.2,
  genreSimilarity: 0.15,
  timeContext: 0.1,
};

class RecommendationEngine {
  private history: ListeningHistoryEntry[] = [];
  private songs: Song[] = [];

  async initialize(songs: Song[]): Promise<void> {
    this.songs = songs;
    this.history = await offlineStorage.getListeningHistory(200);
  }

  // Calculate play frequency score
  private calculatePlayFrequency(songId: string): number {
    const plays = this.history.filter((h) => h.songId === songId).length;
    const maxPlays = Math.max(
      ...this.songs.map(
        (s) => this.history.filter((h) => h.songId === s.id).length
      ),
      1
    );
    return plays / maxPlays;
  }

  // Calculate completion rate score
  private calculateCompletionRate(songId: string): number {
    const entries = this.history.filter((h) => h.songId === songId);
    if (entries.length === 0) return 0.5; // Neutral for unplayed
    const completed = entries.filter((h) => h.completed).length;
    return completed / entries.length;
  }

  // Calculate recency score (more recent = higher score)
  private calculateRecency(songId: string): number {
    const entries = this.history.filter((h) => h.songId === songId);
    if (entries.length === 0) return 0.3; // Some base score for discovery

    const mostRecent = Math.max(...entries.map((h) => h.timestamp));
    const now = Date.now();
    const daysSincePlay = (now - mostRecent) / (1000 * 60 * 60 * 24);

    // Score decays over 30 days
    return Math.max(0, 1 - daysSincePlay / 30);
  }

  // Calculate genre similarity score
  private calculateGenreSimilarity(song: Song, recentSongs: Song[]): number {
    if (recentSongs.length === 0) return 0.5;

    // Simple similarity based on artist and source
    const recentArtists = new Set(recentSongs.map((s) => s.artist));
    const recentSources = new Set(recentSongs.map((s) => s.source));

    let score = 0;
    if (recentArtists.has(song.artist)) score += 0.6;
    if (recentSources.has(song.source)) score += 0.4;

    return Math.min(1, score);
  }

  // Calculate time context score
  private calculateTimeContext(song: Song): number {
    const hour = new Date().getHours();

    // Morning (6-12): upbeat music
    // Afternoon (12-18): varied
    // Evening (18-22): chill
    // Night (22-6): ambient/slow

    // Simple heuristic based on duration (longer songs = more chill)
    const isLongSong = song.duration > 240;
    const isShortSong = song.duration < 180;

    if (hour >= 6 && hour < 12) {
      return isShortSong ? 0.8 : 0.4;
    } else if (hour >= 12 && hour < 18) {
      return 0.6;
    } else if (hour >= 18 && hour < 22) {
      return isLongSong ? 0.8 : 0.5;
    } else {
      return isLongSong ? 0.9 : 0.3;
    }
  }

  // Generate recommendations
  async getRecommendations(
    count: number = 10,
    excludeIds: string[] = []
  ): Promise<AIRecommendation[]> {
    const recentHistory = this.history.slice(0, 20);
    const recentSongIds = new Set(recentHistory.map((h) => h.songId));
    const recentSongs = this.songs.filter((s) => recentSongIds.has(s.id));

    const scores: RecommendationScore[] = this.songs
      .filter((song) => !excludeIds.includes(song.id))
      .map((song) => {
        const playFrequency = this.calculatePlayFrequency(song.id);
        const completionRate = this.calculateCompletionRate(song.id);
        const recency = this.calculateRecency(song.id);
        const genreSimilarity = this.calculateGenreSimilarity(song, recentSongs);
        const timeContext = this.calculateTimeContext(song);

        const score =
          playFrequency * WEIGHTS.playFrequency +
          completionRate * WEIGHTS.completionRate +
          recency * WEIGHTS.recency +
          genreSimilarity * WEIGHTS.genreSimilarity +
          timeContext * WEIGHTS.timeContext;

        const reasons: string[] = [];
        if (playFrequency > 0.5) reasons.push("You play this often");
        if (completionRate > 0.7) reasons.push("You usually finish this song");
        if (recency > 0.7) reasons.push("Recently played");
        if (genreSimilarity > 0.5) reasons.push("Similar to your favorites");
        if (timeContext > 0.6) reasons.push("Perfect for this time of day");

        return { songId: song.id, score, reasons };
      });

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    // Map to recommendations
    return scores.slice(0, count).map((scoreData) => {
      const song = this.songs.find((s) => s.id === scoreData.songId)!;
      const primaryReason =
        scoreData.reasons[0] || "Recommended for you";
      const confidence = Math.min(95, Math.round(scoreData.score * 100));

      return {
        song,
        score: scoreData.score,
        reason: primaryReason,
        confidence,
      };
    });
  }

  // Get mood-based recommendations
  async getMoodRecommendations(
    mood: string,
    count: number = 10
  ): Promise<AIRecommendation[]> {
    // Simple mood mapping based on song characteristics
    const moodFilters: Record<string, (song: Song) => number> = {
      energetic: (song) => (song.duration < 200 ? 0.8 : 0.4),
      chill: (song) => (song.duration > 240 ? 0.8 : 0.4),
      focus: (song) => (song.source === "online" ? 0.7 : 0.5),
      party: (song) => (song.source === "youtube" ? 0.7 : 0.5),
      sad: (song) => (song.duration > 250 ? 0.7 : 0.4),
      happy: (song) => (song.duration < 220 ? 0.7 : 0.4),
    };

    const filter = moodFilters[mood] || (() => 0.5);

    const recommendations = this.songs.map((song) => ({
      song,
      score: filter(song),
      reason: `Matches your ${mood} mood`,
      confidence: Math.round(filter(song) * 100),
    }));

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  // Get similar songs
  async getSimilarSongs(song: Song, count: number = 5): Promise<Song[]> {
    return this.songs
      .filter((s) => s.id !== song.id)
      .map((s) => ({
        song: s,
        similarity:
          (s.artist === song.artist ? 0.5 : 0) +
          (s.source === song.source ? 0.3 : 0) +
          (Math.abs(s.duration - song.duration) < 60 ? 0.2 : 0),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count)
      .map((item) => item.song);
  }

  // Get discovery recommendations (unplayed or rarely played)
  async getDiscoveryRecommendations(count: number = 10): Promise<AIRecommendation[]> {
    const playedIds = new Set(this.history.map((h) => h.songId));
    const rarelyPlayed = this.songs
      .filter((song) => {
        const plays = this.history.filter((h) => h.songId === song.id).length;
        return plays < 2;
      })
      .map((song) => ({
        song,
        score: playedIds.has(song.id) ? 0.5 : 0.8,
        reason: playedIds.has(song.id)
          ? "Give this another listen"
          : "You haven't played this yet",
        confidence: playedIds.has(song.id) ? 60 : 85,
      }));

    return rarelyPlayed.slice(0, count);
  }

  // Record a play event
  async recordPlay(songId: string, duration: number, completed: boolean): Promise<void> {
    await offlineStorage.addToHistory(songId, duration, completed);
    this.history = await offlineStorage.getListeningHistory(200);
  }
}

export const recommendationEngine = new RecommendationEngine();

// React hook for recommendations
import { useState, useEffect, useCallback } from "react";

export const useRecommendations = (songs: Song[]) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) {
      setRecommendations([]);
      return;
    }

    const init = async () => {
      setIsLoading(true);
      await recommendationEngine.initialize(songs);
      const recs = await recommendationEngine.getRecommendations(10);
      setRecommendations(recs);
      setIsLoading(false);
    };

    init();
  }, [songs, isEnabled]);

  const refreshRecommendations = useCallback(async () => {
    setIsLoading(true);
    const recs = await recommendationEngine.getRecommendations(10);
    setRecommendations(recs);
    setIsLoading(false);
  }, []);

  const getMoodRecommendations = useCallback(async (mood: string) => {
    return recommendationEngine.getMoodRecommendations(mood);
  }, []);

  const recordPlay = useCallback(
    async (songId: string, duration: number, completed: boolean) => {
      await recommendationEngine.recordPlay(songId, duration, completed);
      refreshRecommendations();
    },
    [refreshRecommendations]
  );

  return {
    recommendations,
    isLoading,
    isEnabled,
    setIsEnabled,
    refreshRecommendations,
    getMoodRecommendations,
    recordPlay,
  };
};
