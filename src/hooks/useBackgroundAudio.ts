import { useState, useCallback, useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types/music";

interface BackgroundAudioState {
  isBackgroundPlayEnabled: boolean;
  wakeLock: WakeLockSentinel | null;
}

export const useBackgroundAudio = () => {
  const [state, setState] = useState<BackgroundAudioState>({
    isBackgroundPlayEnabled: true,
    wakeLock: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentSong, isPlaying } = usePlayer();

  // Request wake lock to prevent device sleep during playback
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && isPlaying) {
      try {
        const wakeLock = await navigator.wakeLock.request('screen');
        setState(prev => ({ ...prev, wakeLock }));
        
        wakeLock.addEventListener('release', () => {
          console.log('Wake Lock released');
          setState(prev => ({ ...prev, wakeLock: null }));
        });
        
        console.log('Wake Lock acquired');
      } catch (err) {
        console.log('Wake Lock request failed:', err);
      }
    }
  }, [isPlaying]);

  // Release wake lock
  const releaseWakeLock = useCallback(async () => {
    if (state.wakeLock) {
      await state.wakeLock.release();
      setState(prev => ({ ...prev, wakeLock: null }));
    }
  }, [state.wakeLock]);

  // Handle visibility change to maintain background playback
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        // Re-acquire wake lock when returning to foreground
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, requestWakeLock]);

  // Manage wake lock based on playback state
  useEffect(() => {
    if (isPlaying && state.isBackgroundPlayEnabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isPlaying, state.isBackgroundPlayEnabled, requestWakeLock, releaseWakeLock]);

  // Toggle background playback
  const toggleBackgroundPlay = useCallback(() => {
    setState(prev => ({
      ...prev,
      isBackgroundPlayEnabled: !prev.isBackgroundPlayEnabled,
    }));
  }, []);

  // Set up audio element for background playback
  const setupBackgroundAudio = useCallback((audioElement: HTMLAudioElement) => {
    audioRef.current = audioElement;
    
    // Ensure audio continues in background
    audioElement.setAttribute('x-webkit-airplay', 'allow');
    audioElement.preload = 'auto';
    
    // Handle audio interruptions (phone calls, etc.)
    audioElement.addEventListener('pause', (e) => {
      // If paused externally, save state for resume
      console.log('Audio paused externally');
    });
  }, []);

  // Handle audio source for streaming
  const setAudioSource = useCallback((song: Song) => {
    if (audioRef.current) {
      // Check if song has a stream URL (from YouTube streaming)
      const streamUrl = (song as any).streamUrl;
      
      if (streamUrl) {
        audioRef.current.src = streamUrl;
        audioRef.current.load();
      }
    }
  }, []);

  return {
    isBackgroundPlayEnabled: state.isBackgroundPlayEnabled,
    hasWakeLock: !!state.wakeLock,
    toggleBackgroundPlay,
    setupBackgroundAudio,
    setAudioSource,
    requestWakeLock,
    releaseWakeLock,
  };
};
