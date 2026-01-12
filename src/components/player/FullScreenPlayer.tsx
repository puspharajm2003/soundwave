import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ChevronDown,
  Heart,
  ListMusic,
  Download,
  Share2,
  Mic2,
  MoreHorizontal,
  SlidersHorizontal,
  Moon,
  Waves,
  Radio,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { Slider } from "@/components/ui/slider";
import { RotatingAlbumArt } from "./RotatingAlbumArt";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { LyricsView } from "./LyricsView";
import { AudioEqualizer } from "./AudioEqualizer";
import { QueuePanel } from "./QueuePanel";
import { SleepTimer } from "./SleepTimer";
import { CrossfadeSettings } from "./CrossfadeSettings";
import { SocialShare } from "@/components/sharing";
import { useColorExtractor } from "@/hooks/useColorExtractor";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useWebAudio } from "@/hooks/useWebAudio";
import { useCrossfade } from "@/hooks/useCrossfade";
import { cn } from "@/lib/utils";

interface FullScreenPlayerProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isExpanded,
  onToggleExpand,
}) => {
  const {
    currentSong,
    isPlaying,
    progress,
    volume,
    shuffle,
    repeat,
    pauseSong,
    resumeSong,
    nextSong,
    prevSong,
    setProgress,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    radioMode,
    toggleRadioMode,
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showCrossfade, setShowCrossfade] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [equalizerBands, setEqualizerBands] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  const { colors } = useColorExtractor(currentSong?.thumbnail);
  const { setEqualizerBands: applyEqualizer, initialize: initAudio } = useWebAudio();
  const { crossfadeEnabled, crossfadeDuration, updateSettings: updateCrossfade } = useCrossfade();

  // Initialize audio on mount
  useEffect(() => {
    initAudio();
  }, [initAudio]);

  // Apply equalizer bands when they change
  const handleEqualizerChange = useCallback((bands: number[]) => {
    setEqualizerBands(bands);
    applyEqualizer(bands);
  }, [applyEqualizer]);

  // Media Session for lock-screen controls
  useMediaSession(
    currentSong,
    isPlaying,
    progress,
    currentSong?.duration || 0,
    {
      onPlay: resumeSong,
      onPause: pauseSong,
      onPreviousTrack: prevSong,
      onNextTrack: nextSong,
      onSeekTo: setProgress,
    }
  );

  // Simulate progress for demo
  useEffect(() => {
    if (isPlaying && currentSong) {
      const interval = setInterval(() => {
        setProgress(Math.min(progress + 1, currentSong.duration));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, progress, currentSong, setProgress]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  }, [isMuted, volume, prevVolume, setVolume]);

  const handleDrag = useCallback(
    (_: any, info: PanInfo) => {
      if (info.offset.y > 100) {
        onToggleExpand();
      } else if (info.offset.y < -100) {
        setShowLyrics(true);
      }
    },
    [onToggleExpand]
  );

  if (!currentSong) return null;

  const progressPercent = (progress / currentSong.duration) * 100;

  const sourceLabel =
    currentSong.source === "youtube"
      ? "YouTube"
      : currentSong.source === "online"
        ? "Online"
        : "Local";

  const isLocal = currentSong.source === "local";

  return (
    <AnimatePresence mode="wait">
      {isExpanded && (
        <motion.div
          key="fullscreen-player"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDrag}
          className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${colors.background} 0%, hsl(var(--background)) 100%)`,
          }}
        >
          {/* Dynamic background */}
          <div
            className="absolute inset-0 opacity-40 blur-3xl scale-125"
            style={{
              backgroundImage: `url(${currentSong.thumbnail})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />

          {/* Lyrics overlay */}
          <LyricsView
            isVisible={showLyrics}
            currentTime={progress}
            songId={currentSong.id}
          />

          {/* Main content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 md:p-6"
            >
              <button
                onClick={onToggleExpand}
                className="p-2 glass-button rounded-full hover:bg-muted/50 transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Now Playing
                </p>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block",
                    currentSong.source === "youtube" &&
                    "bg-destructive/20 text-destructive",
                    currentSong.source === "online" &&
                    "bg-accent/20 text-accent",
                    currentSong.source === "local" &&
                    "bg-primary/20 text-primary"
                  )}
                >
                  {sourceLabel}
                </span>
              </div>

              <button
                onClick={() => setShowQueue(!showQueue)}
                className={cn(
                  "p-2 glass-button rounded-full transition-colors",
                  showQueue && "bg-primary/20 text-primary"
                )}
              >
                <ListMusic className="w-6 h-6" />
              </button>
            </motion.div>

            {/* Album Art */}
            <div className="flex-1 flex items-center justify-center py-4 md:py-8 px-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <RotatingAlbumArt
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  isPlaying={isPlaying}
                  size="large"
                />
              </motion.div>
            </div>

            {/* Song Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-6 mb-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <motion.h2
                    key={currentSong.id + "-title"}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl md:text-3xl font-display font-bold truncate"
                  >
                    {currentSong.title}
                  </motion.h2>
                  <motion.p
                    key={currentSong.id + "-artist"}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground text-lg truncate"
                  >
                    {currentSong.artist}
                  </motion.p>
                </div>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    "p-3 rounded-full transition-all",
                    isLiked
                      ? "text-destructive scale-110"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Heart
                    className={cn("w-7 h-7", isLiked && "fill-current")}
                  />
                </button>
              </div>
            </motion.div>

            {/* Waveform Visualizer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-6 mb-2"
            >
              <WaveformVisualizer
                isPlaying={isPlaying}
                progress={progressPercent}
                onSeek={(percent) =>
                  setProgress((percent / 100) * currentSong.duration)
                }
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(currentSong.duration)}</span>
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-6 mb-6"
            >
              <div className="flex items-center justify-center gap-6 md:gap-8 mb-6">
                <button
                  onClick={toggleShuffle}
                  className={cn(
                    "p-3 rounded-full transition-all",
                    shuffle
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={prevSong}
                  className="p-3 text-foreground hover:text-primary hover:scale-110 transition-all"
                >
                  <SkipBack className="w-8 h-8" />
                </button>

                <button
                  onClick={isPlaying ? pauseSong : resumeSong}
                  className="p-6 bg-primary text-primary-foreground rounded-full glow-primary hover:scale-105 transition-transform shadow-2xl"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </button>

                <button
                  onClick={nextSong}
                  className="p-3 text-foreground hover:text-primary hover:scale-110 transition-all"
                >
                  <SkipForward className="w-8 h-8" />
                </button>

                <button
                  onClick={toggleRepeat}
                  className={cn(
                    "p-3 rounded-full transition-all",
                    repeat !== "none"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {repeat === "one" ? (
                    <Repeat1 className="w-5 h-5" />
                  ) : (
                    <Repeat className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      showLyrics
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Mic2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowEqualizer(true)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowShare(true)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowSleepTimer(true)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Moon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowCrossfade(true)}
                    className={cn(
                      "p-2 transition-colors",
                      crossfadeEnabled ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Waves className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 w-32">
                  <button
                    onClick={toggleMute}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {volume === 0 || isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <Slider
                    value={[volume]}
                    max={100}
                    onValueChange={([val]) => {
                      setVolume(val);
                      setIsMuted(false);
                    }}
                    className="flex-1"
                  />
                </div>

                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Swipe indicator */}
            <div className="flex justify-center pb-6">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
          </div>

          {/* Equalizer Modal */}
          <AudioEqualizer
            isOpen={showEqualizer}
            onClose={() => setShowEqualizer(false)}
            onBandsChange={handleEqualizerChange}
          />

          {/* Queue Panel */}
          <QueuePanel
            isOpen={showQueue}
            onClose={() => setShowQueue(false)}
          />

          {/* Sleep Timer */}
          <SleepTimer
            isOpen={showSleepTimer}
            onClose={() => setShowSleepTimer(false)}
          />

          {/* Crossfade Settings */}
          <CrossfadeSettings
            isOpen={showCrossfade}
            onClose={() => setShowCrossfade(false)}
            enabled={crossfadeEnabled}
            duration={crossfadeDuration}
            onSettingsChange={updateCrossfade}
          />

          {/* Social Share */}
          <SocialShare
            isOpen={showShare}
            onClose={() => setShowShare(false)}
            item={currentSong}
            type="song"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
