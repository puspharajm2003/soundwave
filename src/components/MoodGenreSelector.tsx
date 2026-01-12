import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoodChip {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
}

const moods: MoodChip[] = [
  { id: "chill", label: "Chill", emoji: "🌊", gradient: "from-cyan-500/20 to-blue-500/20" },
  { id: "energetic", label: "Energetic", emoji: "⚡", gradient: "from-yellow-500/20 to-orange-500/20" },
  { id: "focus", label: "Focus", emoji: "🎯", gradient: "from-purple-500/20 to-pink-500/20" },
  { id: "party", label: "Party", emoji: "🎉", gradient: "from-pink-500/20 to-red-500/20" },
  { id: "sad", label: "Sad", emoji: "🌧️", gradient: "from-blue-500/20 to-indigo-500/20" },
  { id: "romantic", label: "Romantic", emoji: "💕", gradient: "from-rose-500/20 to-pink-500/20" },
  { id: "workout", label: "Workout", emoji: "💪", gradient: "from-green-500/20 to-emerald-500/20" },
  { id: "sleep", label: "Sleep", emoji: "🌙", gradient: "from-indigo-500/20 to-purple-500/20" },
];

interface MoodSelectorProps {
  selected: string | null;
  onSelect: (moodId: string) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6">
      {moods.map((mood, index) => (
        <motion.button
          key={mood.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(mood.id)}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all whitespace-nowrap",
            "bg-gradient-to-r border",
            mood.gradient,
            selected === mood.id
              ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
              : "border-transparent hover:border-border"
          )}
        >
          <span className="text-lg">{mood.emoji}</span>
          <span>{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

// Genre chips
interface GenreChip {
  id: string;
  label: string;
  color: string;
}

const genres: GenreChip[] = [
  { id: "pop", label: "Pop", color: "bg-pink-500/20 text-pink-300" },
  { id: "hiphop", label: "Hip Hop", color: "bg-amber-500/20 text-amber-300" },
  { id: "rock", label: "Rock", color: "bg-red-500/20 text-red-300" },
  { id: "electronic", label: "Electronic", color: "bg-cyan-500/20 text-cyan-300" },
  { id: "jazz", label: "Jazz", color: "bg-purple-500/20 text-purple-300" },
  { id: "classical", label: "Classical", color: "bg-emerald-500/20 text-emerald-300" },
  { id: "rnb", label: "R&B", color: "bg-violet-500/20 text-violet-300" },
  { id: "indie", label: "Indie", color: "bg-orange-500/20 text-orange-300" },
];

interface GenreSelectorProps {
  selected: string[];
  onToggle: (genreId: string) => void;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({ selected, onToggle }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre, index) => (
        <motion.button
          key={genre.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggle(genre.id)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
            genre.color,
            selected.includes(genre.id)
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "border-transparent hover:border-border"
          )}
        >
          {genre.label}
        </motion.button>
      ))}
    </div>
  );
};
