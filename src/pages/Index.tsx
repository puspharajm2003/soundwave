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

  const { recommendations, isLoading, refreshRecommendations } = useRecommendations(demoSongs);
  const { downloadedSongs, history } = useLocalMusic();

  useEffect(() => {
    if (!user) {
      setPlaylists(demoPlaylists);
    } else {
      setPlaylists([]);
    }
  }, [user]);

  useEffect(() => {
    if (!currentSong) {
      playSong(demoSongs[0]);
    }
  }, []);

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

  const featuredSong = demoSongs[4];
  const downloadedCount = demoSongs.filter(s => s.isDownloaded).length;

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

          {/* Show Featured/Demo content ONLY if NOT logged in, OR if user has no data (optional, but per request 'remove fake data') */}
          {!user ? (
            <>
              <motion.div
                ref={heroRef}
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="mb-10 stagger-section"
              >
                <FeaturedCard song={featuredSong} />
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
              <div className="stagger-section">
                <RecommendationSection
                  recommendations={recommendations}
                  isLoading={isLoading}
                  onRefresh={refreshRecommendations}
                />
              </div>

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
                  </HorizontalScroll>
                </Section>
              </div>

              <div className="stagger-section">
                <Section title="Recently Played" subtitle="Pick up where you left off" showViewAll>
                  {user && history.length > 0 ? (
                    <Grid columns={4}>
                      {history.slice(0, 4).map((song, index) => (
                        <SongCard key={song.id} song={song} index={index} />
                      ))}
                    </Grid>
                  ) : !user ? (
                    <Grid columns={4}>
                      {demoSongs.slice(0, 4).map((song, index) => (
                        <SongCard key={song.id} song={song} index={index} />
                      ))}
                    </Grid>
                  ) : (
                    <p className="text-muted-foreground">No recent history.</p>
                  )}
                </Section>
              </div>

              <div className="stagger-section">
                <Section title="Trending Now" subtitle="What everyone's listening to" showViewAll>
                  <div className="glass-card rounded-2xl overflow-hidden">
                    {demoSongs.map((song, index) => (
                      <SongCard key={song.id} song={song} index={index} showIndex compact />
                    ))}
                  </div>
                </Section>
              </div>
            </>
          ) : (
            // LOGGED IN STATE - Clean Slate (or Real Data in future)
            <div className="space-y-8">
              <div className="flex items-center justify-center h-[50vh] flex-col text-muted-foreground space-y-4">
                <div className="p-6 rounded-full bg-white/5">
                  <User className="w-12 h-12 opacity-50" />
                </div>
                <p>Your library is empty. Start adding music!</p>

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => setShowYouTubeSearch(true)} variant="glow">
                    <Youtube className="mr-2 h-4 w-4" /> Search YouTube
                  </Button>
                  <Button onClick={() => setShowURLDownloader(true)} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Import URL
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="stagger-section">
            <Section title="Downloaded" subtitle="Available offline" showViewAll>
              {user ? (
                downloadedSongs.length > 0 ? (
                  <Grid columns={5}>
                    {downloadedSongs.map((song, index) => (
                      <SongCard key={song.id} song={song} index={index} />
                    ))}
                  </Grid>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No downloaded songs yet.</p>
                  </div>
                )
              ) : (
                <Grid columns={5}>
                  {demoSongs.filter(s => s.isDownloaded).map((song, index) => (
                    <SongCard key={song.id} song={song} index={index} />
                  ))}
                </Grid>
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
        availableSongs={demoSongs}
        onSave={handleSavePlaylist}
      />
    </div>
  );
};

const Index: React.FC = () => {
  return <HomeContent />;
};

export default Index;
