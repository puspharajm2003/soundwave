import { useEffect, useCallback } from "react";
import { Song } from "@/types/music";

interface MediaSessionHandlers {
  onPlay?: () => void;
  onPause?: () => void;
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
  onSeekTo?: (time: number) => void;
}

export const useMediaSession = (
  song: Song | null,
  isPlaying: boolean,
  currentTime: number,
  duration: number,
  handlers: MediaSessionHandlers
) => {
  const updateMediaSession = useCallback(() => {
    if (!song || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album || "SoundWave",
      artwork: [
        { src: song.thumbnail, sizes: "96x96", type: "image/jpeg" },
        { src: song.thumbnail, sizes: "128x128", type: "image/jpeg" },
        { src: song.thumbnail, sizes: "192x192", type: "image/jpeg" },
        { src: song.thumbnail, sizes: "256x256", type: "image/jpeg" },
        { src: song.thumbnail, sizes: "384x384", type: "image/jpeg" },
        { src: song.thumbnail, sizes: "512x512", type: "image/jpeg" },
      ],
    });
  }, [song]);

  const updatePlaybackState = useCallback(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  const updatePositionState = useCallback(() => {
    if (!("mediaSession" in navigator) || !duration) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1,
        position: Math.min(currentTime, duration),
      });
    } catch (e) {
      // Position state not supported
    }
  }, [currentTime, duration]);

  // Set up action handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const actionHandlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ["play", handlers.onPlay || null],
      ["pause", handlers.onPause || null],
      ["previoustrack", handlers.onPreviousTrack || null],
      ["nexttrack", handlers.onNextTrack || null],
      ["seekto", handlers.onSeekTo 
        ? ((details: MediaSessionActionDetails) => {
            if (details.seekTime !== undefined) {
              handlers.onSeekTo!(details.seekTime);
            }
          }) 
        : null
      ],
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {
        // Action not supported
      }
    }

    return () => {
      for (const [action] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) {
          // Action not supported
        }
      }
    };
  }, [handlers]);

  // Update metadata when song changes
  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession]);

  // Update playback state
  useEffect(() => {
    updatePlaybackState();
  }, [updatePlaybackState]);

  // Update position state periodically
  useEffect(() => {
    updatePositionState();
  }, [updatePositionState]);

  return {
    updateMediaSession,
    updatePlaybackState,
    updatePositionState,
  };
};
