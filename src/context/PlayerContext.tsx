import React, { createContext, useContext, useState, useCallback } from "react";
import { Song, PlayerState } from "@/types/music";
import { demoSongs } from "@/data/musicData";

interface PlayerContextType extends PlayerState {
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  setQueue: (songs: Song[]) => void;
  setQueue: (songs: Song[]) => void;
  playPlaylist: (songs: Song[], startIndex?: number) => void;
  radioMode: boolean;
  toggleRadioMode: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    progress: 0,
    volume: 80,
    shuffle: false,
    repeat: "none",
    queue: demoSongs,
    queueIndex: 0,
    radioMode: false,
  });

  // Auto-queue similar songs in radio mode
  React.useEffect(() => {
    if (state.radioMode && state.queue.length > 0 && state.queueIndex >= state.queue.length - 1) {
      import("@/lib/recommendationEngine").then(({ recommendationEngine }) => {
        recommendationEngine.getRecommendations(5).then(recs => {
          if (recs.length > 0) {
            setState(prev => ({
              ...prev,
              queue: [...prev.queue, ...recs.map(r => r.song)]
            }));
          }
        });
      });
    }
  }, [state.radioMode, state.queueIndex, state.queue.length]);

  const playSong = useCallback((song: Song) => {
    const index = state.queue.findIndex(s => s.id === song.id);
    setState(prev => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      progress: 0,
      queueIndex: index >= 0 ? index : 0,
    }));
  }, [state.queue]);

  const pauseSong = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resumeSong = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const nextSong = useCallback(() => {
    setState(prev => {
      let nextIndex = prev.queueIndex + 1;
      if (prev.shuffle) {
        nextIndex = Math.floor(Math.random() * prev.queue.length);
      } else if (nextIndex >= prev.queue.length) {
        nextIndex = prev.repeat === "all" ? 0 : prev.queueIndex;
      }
      return {
        ...prev,
        currentSong: prev.queue[nextIndex],
        queueIndex: nextIndex,
        progress: 0,
        isPlaying: nextIndex !== prev.queueIndex || prev.repeat === "all",
      };
    });
  }, []);

  const prevSong = useCallback(() => {
    setState(prev => {
      const prevIndex = prev.queueIndex > 0 ? prev.queueIndex - 1 : prev.queue.length - 1;
      return {
        ...prev,
        currentSong: prev.queue[prevIndex],
        queueIndex: prevIndex,
        progress: 0,
      };
    });
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState(prev => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState(prev => ({
      ...prev,
      repeat: prev.repeat === "none" ? "all" : prev.repeat === "all" ? "one" : "none",
    }));
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, song] }));
  }, []);

  const removeFromQueue = useCallback((songId: string) => {
    setState(prev => {
      const newQueue = prev.queue.filter(s => s.id !== songId);
      let newIndex = prev.queueIndex;
      const removedIndex = prev.queue.findIndex(s => s.id === songId);
      if (removedIndex < prev.queueIndex) {
        newIndex = Math.max(0, prev.queueIndex - 1);
      }
      return { ...prev, queue: newQueue, queueIndex: newIndex };
    });
  }, []);

  const setQueue = useCallback((songs: Song[]) => {
    setState(prev => {
      const currentIndex = prev.currentSong
        ? songs.findIndex(s => s.id === prev.currentSong!.id)
        : 0;
      return {
        ...prev,
        queue: songs,
        queueIndex: currentIndex >= 0 ? currentIndex : 0
      };
    });
  }, []);

  const playPlaylist = useCallback((songs: Song[], startIndex = 0) => {
    setState(prev => ({
      ...prev,
      queue: songs,
      currentSong: songs[startIndex],
      queueIndex: startIndex,
      isPlaying: true,
      progress: 0,
    }));
  }, []);

  const toggleRadioMode = useCallback(() => {
    setState(prev => ({ ...prev, radioMode: !prev.radioMode }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        pauseSong,
        resumeSong,
        nextSong,
        prevSong,
        setProgress,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        setQueue,
        playPlaylist,
        radioMode: state.radioMode,
        toggleRadioMode,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
