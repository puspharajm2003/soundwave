import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Library,
  Download,
  Settings,
  User,
  Radio,
  TrendingUp,
  Clock,
  Heart,
  Youtube,
  LogIn,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "youtube", label: "YouTube", icon: Youtube, path: "/youtube" },
  { id: "library", label: "Library", icon: Library, path: "/library/liked" },
  { id: "downloads", label: "Downloads", icon: Download, path: "/library/downloads" },
];

const libraryItems = [
  { id: "liked", label: "Liked Songs", icon: Heart, path: "/library/liked" },
  { id: "recent", label: "Recently Played", icon: Clock, path: "/recently-played" },
  { id: "trending", label: "Trending", icon: TrendingUp, path: "/youtube" },
  { id: "radio", label: "Radio", icon: Radio, path: "/radio" },
];

import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mobileNavItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "new", label: "New", icon: Sparkles, path: "/youtube" }, // Linking to YouTube/Trending for "New"
  { id: "radio", label: "Radio", icon: Radio, path: "/" },
  { id: 'library', label: 'Library', icon: Library, path: '/library/liked' },
  { id: "search", label: "Search", icon: Search, path: "/youtube" }, // Search points to YouTube search tab
];

import { usePlayer } from "@/context/PlayerContext";

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  // ... existing user state logic ...
  const [user, setUser] = React.useState<any>(null);
  const location = useLocation();
  const { currentSong } = usePlayer(); // Hook to check if song is playing

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-sidebar border-r border-sidebar-border p-6 pb-32 z-30 overflow-y-auto scrollbar-none"
      >
        {/* ... (Keep existing Desktop Sidebar content exactly as is) ... */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Radio className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-bold gradient-text">SoundWave</h1>
        </div>

        <nav className="space-y-2 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="neon-line mb-8" />

        <div className="flex-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">
            Your Library
          </h3>
          <nav className="space-y-1">
            {libraryItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all text-sm",
                  activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-sidebar-border">
          <Link
            to="/settings"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          {user ? (
            <Link
              to="/profile"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <Avatar className="w-8 h-8 border-2 border-primary/20">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.user_metadata?.display_name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="font-medium truncate text-sm text-foreground">
                  {user.user_metadata?.display_name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  View Profile
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <LogIn className="w-5 h-5" />
              <span className="font-medium">Login</span>
            </Link>
          )}
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation (Updated) */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.5 }}
        className={cn(
          "lg:hidden fixed left-4 right-4 z-50 glass-card h-16 rounded-full flex items-center justify-around shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl bg-black/40 transition-all duration-500 ease-out",
          currentSong ? "bottom-24" : "bottom-6"
        )}
      >
        {mobileNavItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => onTabChange(item.id)}
            className="relative group flex flex-col items-center justify-center w-full h-full"
          >
            {/* Active Indicator - Glowing Dot */}
            {activeTab === item.id && (
              <motion.div
                layoutId="nav-indicator-mobile"
                className="absolute -top-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "relative z-10 transition-all duration-300 flex flex-col items-center gap-1",
                activeTab === item.id
                  ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]"
                  : "text-muted-foreground/60"
              )}
            >
              <item.icon className={cn("w-6 h-6", activeTab === item.id && "fill-current/20")} />
            </motion.div>

            <span className="sr-only">{item.label}</span>
          </Link>
        ))}
      </motion.nav>
    </>
  );
};
