import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SettingsProvider } from "@/context/SettingsContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { SoundController } from "@/components/SoundController";
// import { AudioController } from "@/components/AudioController";
import { registerServiceWorker } from "@/hooks/usePWA";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import RecentlyPlayed from "./pages/RecentlyPlayed";
import YouTube from "./pages/YouTube";
import LikedSongs from "./pages/LikedSongs";
import Radio from "./pages/Radio";
import Downloads from "./pages/Downloads";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Analytics />
      <SettingsProvider>
        <PlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SoundController />
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/recently-played" element={<RecentlyPlayed />} />
                  <Route path="/youtube" element={<YouTube />} />
                  <Route path="/radio" element={<Radio />} />
                  <Route path="/library/liked" element={<LikedSongs />} />
                  <Route path="/library/downloads" element={<Downloads />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </TooltipProvider>
        </PlayerProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
