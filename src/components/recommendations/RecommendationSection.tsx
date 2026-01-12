import React from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Brain, TrendingUp, Clock } from "lucide-react";
import { AIRecommendation } from "@/lib/recommendationEngine";
import { SongCard } from "@/components/SongCard";
import { cn } from "@/lib/utils";

interface RecommendationSectionProps {
  recommendations: AIRecommendation[];
  isLoading: boolean;
  onRefresh: () => void;
  title?: string;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  recommendations,
  isLoading,
  onRefresh,
  title = "Made for You",
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Personalized based on your listening
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-full glass-button transition-all",
            isLoading && "animate-spin"
          )}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Recommendations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendations.map((rec, index) => (
            <RecommendationCard key={rec.song.id} recommendation={rec} index={index} />
          ))}
        </div>
      )}
    </motion.section>
  );
};

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  index: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  index,
}) => {
  const { song, reason, confidence } = recommendation;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <SongCard song={song} index={index} />

      {/* Reason badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 + 0.2 }}
        className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"
      >
        <Brain className="w-3 h-3 text-primary" />
        <span className="truncate">{reason}</span>
      </motion.div>

      {/* Confidence indicator */}
      <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
          className="h-full bg-gradient-to-r from-primary to-accent"
        />
      </div>
    </motion.div>
  );
};

// Because You Listened To component
interface BecauseYouListenedProps {
  basedOnSong: { title: string; artist: string };
  recommendations: AIRecommendation[];
}

export const BecauseYouListened: React.FC<BecauseYouListenedProps> = ({
  basedOnSong,
  recommendations,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-accent" />
        <div>
          <h2 className="text-xl font-display font-bold">
            Because you listened to
          </h2>
          <p className="text-sm text-muted-foreground">
            {basedOnSong.title} by {basedOnSong.artist}
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recommendations.map((rec, index) => (
          <div key={rec.song.id} className="flex-shrink-0 w-44">
            <SongCard song={rec.song} index={index} />
          </div>
        ))}
      </div>
    </motion.section>
  );
};

// Recently Played Smart Section
interface RecentlyPlayedAIProps {
  songs: AIRecommendation[];
}

export const RecentlyPlayedAI: React.FC<RecentlyPlayedAIProps> = ({ songs }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-display font-bold">Jump Back In</h2>
          <p className="text-sm text-muted-foreground">
            Continue where you left off
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {songs.slice(0, 6).map((rec, index) => (
          <motion.div
            key={rec.song.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-3 rounded-xl flex items-center gap-3 group cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <img
              src={rec.song.thumbnail}
              alt={rec.song.title}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{rec.song.title}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {rec.song.artist}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};
