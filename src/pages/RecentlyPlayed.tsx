import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/SongCard";
import { usePlayer } from "@/context/PlayerContext";
import { useLocalMusic } from "@/hooks/useLocalMusic";

const RecentlyPlayed: React.FC = () => {
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const { history } = useLocalMusic();

  const handlePlayAll = () => {
    if (history.length > 0) {
      playSong(history[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 glass-nav border-b border-white/5">
        <div className="flex items-center gap-4 p-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-medium">Recently Played</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold font-display mb-2">Listening History</h2>
            <p className="text-muted-foreground">{history.length} tracks</p>
          </div>
          {history.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={handlePlayAll} variant="glow" className="gap-2">
                <Play className="w-4 h-4" /> Play All
              </Button>
            </div>
          )}
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((song, index) => (
              <SongCard key={`${song.id}-${index}`} song={song} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-medium mb-2">No history yet</h3>
            <p className="text-muted-foreground">Songs you play will appear here</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecentlyPlayed;
