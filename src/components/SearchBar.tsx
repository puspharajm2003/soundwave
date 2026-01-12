import React from "react";
import { motion } from "framer-motion";
import { Search, Mic, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, className }) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative max-w-xl w-full",
        className
      )}
    >
      <div className={cn(
        "relative flex items-center rounded-2xl transition-all duration-300",
        isFocused 
          ? "bg-muted/80 ring-2 ring-primary/50" 
          : "bg-muted/50 hover:bg-muted/80"
      )}>
        <Search className="w-5 h-5 text-muted-foreground absolute left-4" />
        <Input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-12 pr-20 py-6 bg-transparent border-none text-base placeholder:text-muted-foreground focus-visible:ring-0"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {value && (
            <button
              onClick={() => onChange("")}
              className="p-1.5 rounded-full hover:bg-background/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button className="p-2 rounded-full glass-button">
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Search suggestions dropdown would go here */}
      {isFocused && value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-0 right-0 mt-2 glass-card p-4 rounded-2xl shadow-2xl"
        >
          <p className="text-sm text-muted-foreground">
            Search for "{value}"...
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
