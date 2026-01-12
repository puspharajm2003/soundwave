import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FullScreenPlayer } from "./FullScreenPlayer";
import { MiniPlayer } from "./MiniPlayer";
import { usePlayer } from "@/context/PlayerContext";

export const MusicPlayer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentSong } = usePlayer();

  if (!currentSong) return null;

  return (
    <AnimatePresence mode="wait">
      {isExpanded ? (
        <FullScreenPlayer
          key="fullscreen"
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(false)}
        />
      ) : (
        <MiniPlayer key="mini" onExpand={() => setIsExpanded(true)} />
      )}
    </AnimatePresence>
  );
};

export { FullScreenPlayer } from "./FullScreenPlayer";
export { MiniPlayer } from "./MiniPlayer";
export { RotatingAlbumArt } from "./RotatingAlbumArt";
export { WaveformVisualizer } from "./WaveformVisualizer";
export { LyricsView } from "./LyricsView";
export { AudioEqualizer } from "./AudioEqualizer";
export { QueuePanel } from "./QueuePanel";
export { SleepTimer } from "./SleepTimer";
export { CrossfadeSettings } from "./CrossfadeSettings";
