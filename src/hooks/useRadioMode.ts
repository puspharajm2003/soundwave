import { useState, useCallback, useEffect } from "react";
import { Song } from "@/types/music";
import { recommendationEngine, AIRecommendation } from "@/lib/recommendationEngine";
import { toast } from "sonner";

interface RadioModeState {
  isEnabled: boolean;
  seedSong: Song | null;
  upcomingTracks: Song[];
  history: Song[];
}

export const useRadioMode = (
  songs: Song[],
  currentSong: Song | null,
  addToQueue: (song: Song) => void
) => {
  const [state, setState] = useState<RadioModeState>({
    isEnabled: false,
    seedSong: null,
    upcomingTracks: [],
    history: [],
  });

  // Initialize recommendation engine when songs change
  useEffect(() => {
    if (songs.length > 0) {
      recommendationEngine.initialize(songs);
    }
  }, [songs]);

  // Auto-queue similar songs when radio mode is enabled
  useEffect(() => {
    if (!state.isEnabled || !currentSong) return;

    const queueSimilarSongs = async () => {
      // Only queue when we're running low on upcoming tracks
      if (state.upcomingTracks.length >= 3) return;

      try {
        // Get similar songs based on current playing song
        const similar = await recommendationEngine.getSimilarSongs(currentSong, 5);
        
        // Filter out songs already in history or upcoming
        const historyIds = new Set(state.history.map(s => s.id));
        const upcomingIds = new Set(state.upcomingTracks.map(s => s.id));
        const currentId = currentSong.id;
        
        const newTracks = similar.filter(
          song => !historyIds.has(song.id) && 
                  !upcomingIds.has(song.id) && 
                  song.id !== currentId
        );

        if (newTracks.length > 0) {
          // Add to queue and upcoming tracks
          const tracksToAdd = newTracks.slice(0, 3);
          tracksToAdd.forEach(song => addToQueue(song));
          
          setState(prev => ({
            ...prev,
            upcomingTracks: [...prev.upcomingTracks, ...tracksToAdd],
          }));
        } else {
          // If no similar songs, get general recommendations
          const recommendations = await recommendationEngine.getRecommendations(5, [
            currentId,
            ...Array.from(historyIds),
            ...Array.from(upcomingIds),
          ]);
          
          if (recommendations.length > 0) {
            const tracksToAdd = recommendations.slice(0, 3).map(r => r.song);
            tracksToAdd.forEach(song => addToQueue(song));
            
            setState(prev => ({
              ...prev,
              upcomingTracks: [...prev.upcomingTracks, ...tracksToAdd],
            }));
          }
        }
      } catch (error) {
        console.error("Error queuing similar songs:", error);
      }
    };

    // Queue more songs when needed
    const interval = setInterval(queueSimilarSongs, 5000);
    queueSimilarSongs(); // Initial queue

    return () => clearInterval(interval);
  }, [state.isEnabled, currentSong, state.upcomingTracks, state.history, addToQueue]);

  // Track when song changes (for history)
  useEffect(() => {
    if (state.isEnabled && currentSong) {
      setState(prev => {
        // Remove current song from upcoming if it's there
        const newUpcoming = prev.upcomingTracks.filter(s => s.id !== currentSong.id);
        
        // Add previous song to history (avoid duplicates)
        const newHistory = prev.seedSong && prev.seedSong.id !== currentSong.id
          ? [...prev.history.filter(s => s.id !== prev.seedSong!.id), prev.seedSong]
          : prev.history;

        return {
          ...prev,
          seedSong: currentSong,
          upcomingTracks: newUpcoming,
          history: newHistory.slice(-20), // Keep last 20 songs in history
        };
      });
    }
  }, [currentSong, state.isEnabled]);

  const enableRadioMode = useCallback((seedSong?: Song) => {
    const seed = seedSong || currentSong;
    if (!seed) {
      toast.error("No song selected for radio mode");
      return;
    }

    setState({
      isEnabled: true,
      seedSong: seed,
      upcomingTracks: [],
      history: [],
    });

    toast.success(`🎵 Radio mode started`, {
      description: `Playing songs similar to "${seed.title}"`,
    });
  }, [currentSong]);

  const disableRadioMode = useCallback(() => {
    setState({
      isEnabled: false,
      seedSong: null,
      upcomingTracks: [],
      history: [],
    });

    toast.info("Radio mode disabled");
  }, []);

  const toggleRadioMode = useCallback(() => {
    if (state.isEnabled) {
      disableRadioMode();
    } else {
      enableRadioMode();
    }
  }, [state.isEnabled, enableRadioMode, disableRadioMode]);

  const skipToNextSimilar = useCallback(async () => {
    if (!currentSong) return;

    try {
      const similar = await recommendationEngine.getSimilarSongs(currentSong, 3);
      const historyIds = new Set(state.history.map(s => s.id));
      const nextSong = similar.find(s => !historyIds.has(s.id) && s.id !== currentSong.id);
      
      if (nextSong) {
        addToQueue(nextSong);
        setState(prev => ({
          ...prev,
          upcomingTracks: [...prev.upcomingTracks, nextSong],
        }));
      }
    } catch (error) {
      console.error("Error finding next similar song:", error);
    }
  }, [currentSong, state.history, addToQueue]);

  return {
    isEnabled: state.isEnabled,
    seedSong: state.seedSong,
    upcomingTracks: state.upcomingTracks,
    history: state.history,
    enableRadioMode,
    disableRadioMode,
    toggleRadioMode,
    skipToNextSimilar,
  };
};
