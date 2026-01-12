import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { Youtube, Download, Plus, User, Clock, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { MusicPlayer } from "@/components/player";
import { FeaturedCard } from "@/components/FeaturedCard";
import { PlaylistCard } from "@/components/PlaylistCard";
import { SongCard } from "@/components/SongCard";
import { Section, HorizontalScroll, Grid } from "@/components/Section";
import { QuickActions } from "@/components/QuickActions";
import { MoodSelector } from "@/components/MoodGenreSelector";
import { ConnectionStatus } from "@/components/StatusIndicators";
import { RecommendationSection } from "@/components/recommendations";
import { YouTubeSearch } from "@/components/youtube";
import { URLDownloader } from "@/components/download";
import { PlaylistEditor } from "@/components/playlist";
import { PlayerProvider, usePlayer } from "@/context/PlayerContext";
import { demoSongs, demoPlaylists } from "@/data/musicData";
import { useSupabaseMusic } from "@/hooks/useSupabaseMusic"; // Added hook
import { useRecommendations } from "@/lib/recommendationEngine";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { Playlist } from "@/types/music";
import { useLocalMusic } from "@/hooks/useLocalMusic";

import { supabase } from "@/integrations/supabase/client";

const HomeContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchValue, setSearchValue] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false);
  const [showURLDownloader, setShowURLDownloader] = useState(false);
  const [showPlaylistEditor, setShowPlaylistEditor] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [user, setUser] = useState<any>(null); // Add User state

  const { currentSong, playSong, addToQueue } = usePlayer();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { isInstallable, installApp, isOnline } = usePWA();

  // Real Data Hook
  const { songs: realSongs, isLoadingSongs } = useSupabaseMusic();

  // Auth Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const { recommendations, isLoading: isLoadingRecs } = useRecommendations(realSongs);
  const { downloadedSongs, history } = useLocalMusic();

  // GSAP page load animations
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(".floating-orb",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2, stagger: 0.2 }
      );

      tl.fromTo(".stagger-section",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
        "-=0.8"
      );

      // Floating orb animation
      gsap.to(".floating-orb", {
        y: "random(-20, 20)",
        x: "random(-10, 10)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSavePlaylist = (playlist: Playlist) => {
    setPlaylists(prev => {
      const exists = prev.find(p => p.id === playlist.id);
      if (exists) {
        return prev.map(p => p.id === playlist.id ? playlist : p);
      }
      return [...prev, playlist];
    });
  };

  const featuredSong = realSongs[0];
  const downloadedCount = downloadedSongs.length; // Use real download count

  if (isLoadingSongs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Simple loading indicator */}
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading library...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Background decorative orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="floating-orb absolute top-40 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="floating-orb absolute bottom-40 left-1/3 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="lg:ml-64 pb-40">
        <Header searchValue={searchValue} onSearchChange={setSearchValue} />

        <div className="px-4 md:px-6 py-6">
          {/* USER GREETING / AUTH CHECK */}
          {user && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Welcome, {user.user_metadata?.display_name || "User"}</h2>
              <p className="text-muted-foreground">Your personal library is ready.</p>
            </div>
          )}

          {/* PWA Install Banner */}
          {isInstallable && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 glass-card p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">Install SoundWave</p>
                <p className="text-sm text-muted-foreground">Get the full app experience</p>
              </div>
              <Button onClick={installApp} variant="glow" size="sm">
                Install
              </Button>
            </motion.div>
          )}

          <div className="mb-6 stagger-section">
            <ConnectionStatus isOnline={isOnline} downloadCount={downloadedCount} />
          </div>

          <motion.div
            ref={heroRef}
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="mb-10 stagger-section"
          >
            {featuredSong ? (
              <FeaturedCard song={featuredSong} />
            ) : (
              <div className="relative group overflow-hidden p-8 md:p-12 rounded-[2rem] glass-card border-white/10 text-center space-y-6">
                {/* Ambient Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className="relative z-10 w-24 h-24 mx-auto glass-card rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-500"
                >
                  <Youtube className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                </motion.div>

                <div className="relative z-10 space-y-2 max-w-lg mx-auto">
                  <h2 className="text-3xl font-display font-bold tracking-tight text-white drop-shadow-sm">
                    Start Your Journey
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your library is waiting to be filled. Search for any song on YouTube to begin.
                  </p>
                </div>

                <div className="relative z-10 flex justify-center pt-2">
                  <Button
                    onClick={() => setShowYouTubeSearch(true)}
                    variant="glow"
                    size="lg"
                    className="gap-2 h-12 px-8 text-base shadow-glow-primary hover:scale-105 transition-transform"
                  >
                    <Youtube className="w-5 h-5" />
                    Search YouTube
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Action Buttons */}
          <div className="stagger-section mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              onClick={() => setShowYouTubeSearch(true)}
              variant="glass"
              className="flex items-center justify-center gap-2 py-5 bg-destructive/10 hover:bg-destructive/20 border-destructive/20"
            >
              <Youtube className="w-5 h-5 text-destructive" />
              <span>YouTube</span>
            </Button>
            {/* ... other buttons ... */}
            <Button
              onClick={() => setShowURLDownloader(true)}
              variant="glass"
              className="flex items-center justify-center gap-2 py-5"
            >
              <Download className="w-5 h-5 text-primary" />
              <span>Download</span>
            </Button>
            <Button
              onClick={() => setShowPlaylistEditor(true)}
              variant="glass"
              className="flex items-center justify-center gap-2 py-5"
            >
              <Plus className="w-5 h-5 text-accent" />
              <span>Playlist</span>
            </Button>
            <Link to="/recently-played" className="w-full">
              <Button
                variant="glass"
                className="w-full flex items-center justify-center gap-2 py-5"
              >
                <Clock className="w-5 h-5 text-secondary" />
                <span>History</span>
              </Button>
            </Link>
            <Link to="/profile" className="w-full">
              <Button
                variant="glass"
                className="w-full flex items-center justify-center gap-2 py-5"
              >
                <User className="w-5 h-5 text-accent" />
                <span>Profile</span>
              </Button>
            </Link>
            <Link to="/settings" className="w-full">
              <Button
                variant="glass"
                className="w-full flex items-center justify-center gap-2 py-5"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span>Settings</span>
              </Button>
            </Link>
          </div>

          <div className="stagger-section">
            <Section title="How are you feeling?" className="mb-8">
              <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
            </Section>
          </div>

          <div className="stagger-section">
            <QuickActions />
          </div>

          {/* AI Recommendations */}
          {realSongs.length > 0 && (
            <div className="stagger-section">
              <RecommendationSection
                recommendations={recommendations}
                isLoading={isLoadingRecs}
                onRefresh={() => { }} // Hook handles refresh internally mostly
              />
            </div>
          )}

          <div className="stagger-section">
            <Section
              title="Your Playlists"
              subtitle="Your music collections"
              showViewAll
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlaylistEditor(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </Button>
              }
            >
              <HorizontalScroll>
                {playlists.map((playlist, index) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} index={index} />
                ))}
                {playlists.length === 0 && (
                  <p className="text-muted-foreground p-4">No playlists yet.</p>
                )}
              </HorizontalScroll>
            </Section>
          </div>

          <div className="stagger-section">
            <Section title="Recently Played" subtitle="Pick up where you left off" showViewAll>
              {history.length > 0 ? (
                <Grid columns={4}>
                  {history.slice(0, 4).map((song, index) => (
                    <SongCard key={song.id} song={song} index={index} />
                  ))}
                </Grid>
              ) : (
                <p className="text-muted-foreground">No recent history.</p>
              )}
            </Section>
          </div>

          <div className="stagger-section">
            <Section title="Library Songs" subtitle="All added songs" showViewAll>
              {realSongs.length > 0 ? (
                <div className="glass-card rounded-2xl overflow-hidden p-4 grid gap-2">
                  {realSongs.slice(0, 10).map((song, index) => (
                    <SongCard key={song.id} song={song} index={index} showIndex compact />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No songs in library.</p>
              )}
            </Section>
          </div>

          <div className="stagger-section">
            <Section title="Downloaded" subtitle="Available offline" showViewAll>
              {downloadedSongs.length > 0 ? (
                <Grid columns={5}>
                  {downloadedSongs.map((song, index) => (
                    <SongCard key={song.id} song={song} index={index} />
                  ))}
                </Grid>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No downloaded songs yet.</p>
                </div>
              )}
            </Section>
          </div>
        </div>
      </main>

      <MusicPlayer />

      {/* YouTube Search Modal */}
      <YouTubeSearch
        isOpen={showYouTubeSearch}
        onClose={() => setShowYouTubeSearch(false)}
        onAddToPlaylist={(song) => addToQueue(song)}
      />

      {/* URL Downloader Modal */}
      <URLDownloader
        isOpen={showURLDownloader}
        onClose={() => setShowURLDownloader(false)}
        onDownloadComplete={(song) => addToQueue(song)}
      />

      {/* Playlist Editor Modal */}
      <PlaylistEditor
        isOpen={showPlaylistEditor}
        onClose={() => setShowPlaylistEditor(false)}
        availableSongs={realSongs}
        onSave={handleSavePlaylist}
      />
    </div>
  );
};

const Index: React.FC = () => {
  return <HomeContent />;
};

export default Index;
