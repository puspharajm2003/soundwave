import React from "react";
import { motion } from "framer-motion";
import { Bell, Settings, ChevronDown } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchValue, onSearchChange }) => {
  const [user, setUser] = React.useState<any>(null);

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
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-4">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
        </div>

        {/* Search */}
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          className="hidden md:block flex-1 max-w-md mx-auto lg:ml-0"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl glass-button relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          {user ? (
            <Link to="/profile" className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full glass-button hover:bg-white/10 transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user.user_metadata?.display_name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium max-w-[100px] truncate">
                {user.user_metadata?.display_name || "User"}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Link>
          ) : (
            <Link to="/auth" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-button hover:bg-primary/20 transition-colors">
              <span className="text-sm font-medium">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-4">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>
    </motion.header>
  );
};
