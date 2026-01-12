import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types/music";
import { getFavorites, toggleFavorite } from "@/lib/db";
import { Heart, Play, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LikedSongs: React.FC = () => {
    const [activeTab, setActiveTab] = useState("library");
    const [favorites, setFavorites] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const { playSong, isPlaying, currentSong } = usePlayer();

    useEffect(() => {
        const loadFavorites = async () => {
            const favs = await getFavorites();
            setFavorites(favs);
            setLoading(false);
        };
        loadFavorites();
    }, []);

    const handlePlay = (song: Song) => {
        playSong(song);
    };

    const handleRemove = async (song: Song, e: React.MouseEvent) => {
        e.stopPropagation();
        await toggleFavorite(song);
        setFavorites(prev => prev.filter(s => s.id !== song.id));
        toast.success("Removed from Liked Songs");
    };

    const filtered = favorites.filter(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.artist.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="min-h-screen bg-background">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="lg:ml-64 pb-40 px-4 md:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/5 border border-pink-500/20">
                        <Heart className="w-10 h-10 text-pink-500 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
                            Liked Songs
                        </h1>
                        <p className="text-muted-foreground">
                            {favorites.length} songs you love
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Filter liked songs..."
                            className="pl-10 bg-white/5 border-white/10"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-muted-foreground animate-pulse">Loading favorites...</div>
                ) : filtered.length > 0 ? (
                    <div className="grid gap-2">
                        {filtered.map((song, i) => (
                            <motion.div
                                key={song.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn(
                                    "group flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer",
                                    currentSong?.id === song.id ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5 border border-transparent"
                                )}
                                onClick={() => handlePlay(song)}
                            >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-5 h-5 text-white fill-white" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={cn("font-medium truncate", currentSong?.id === song.id && "text-primary")}>
                                        {song.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
                                        onClick={(e) => handleRemove(song, e)}
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass-card">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <Heart className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No liked songs yet</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Tap the heart icon on any song to add it to your collection.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LikedSongs;
