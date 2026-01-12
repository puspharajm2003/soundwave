import React, { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types/music";
import { userProfile } from "@/data/musicData";
import { useSupabaseMusic } from "@/hooks/useSupabaseMusic";
import { Heart, Play, Clock, Search, Music, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LikedSongs: React.FC = () => {
    const [activeTab, setActiveTab] = useState("library");
    const [query, setQuery] = useState("");
    const { playSong, isPlaying, currentSong } = usePlayer();

    const { likedSongs, isLoadingLikeds } = useSupabaseMusic();

    const handleRemove = async (song: Song, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { error } = await (supabase as any).from('LikedSong')
                    .delete()
                    .match({ userId: session.user.id, songId: song.id });
                if (error) throw error;
                toast.success("Removed from Liked Songs");
                window.location.reload();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove song");
        }
    };

    const filtered = likedSongs.filter(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.artist.toLowerCase().includes(query.toLowerCase()));

    const handlePlay = (song: Song) => {
        playSong(song);
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-pink-500/10 via-background/50 to-background" />
                <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/20 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="lg:ml-64 pb-0 relative z-10 min-h-screen flex flex-col">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row items-end gap-6 pt-12 pb-8 px-4 md:px-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-48 h-48 md:w-60 md:h-60 rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center border border-white/10 group relative"
                    >
                        <Heart className="w-20 h-20 text-white fill-white drop-shadow-md z-10" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                    </motion.div>

                    <div className="flex-1 space-y-4 mb-2">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h5 className="uppercase tracking-widest text-xs font-bold text-pink-400 mb-1">Playlist</h5>
                            <h1 className="text-4xl md:text-7xl font-display font-black tracking-tight text-white mb-4">
                                Liked Songs
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                                    {userProfile?.username?.[0] || "U"}
                                </div>
                                <span className="text-white font-medium">{userProfile?.username || "You"}</span>
                                <span>•</span>
                                <span>{likedSongs.length} songs</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Controls & List Container */}
                <div className="bg-background/80 backdrop-blur-xl border-t border-white/5 flex-1">
                    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {likedSongs.length > 0 && (
                                    <Button
                                        size="lg"
                                        className="rounded-full w-14 h-14 bg-pink-500 hover:bg-pink-400 hover:scale-105 transition-all shadow-glow-pink p-0 flex items-center justify-center shrink-0"
                                        onClick={() => handlePlay(likedSongs[0])}
                                    >
                                        <Play className="w-6 h-6 fill-black text-black ml-1" />
                                    </Button>
                                )}
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Filter title or artist..."
                                        className="pl-10 h-10 bg-white/5 border-white/10 rounded-full focus-visible:ring-pink-500/50 hover:bg-white/10 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 md:px-8 py-4 pb-40">
                        {/* Header Row */}
                        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_1.5fr_auto_auto] gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-white/5 mb-2">
                            <div className="w-8 text-center">#</div>
                            <div>Title</div>
                            <div className="hidden md:block">Album</div>
                            <div className="hidden md:block text-right pr-8"><Clock className="w-4 h-4 ml-auto" /></div>
                            <div className="w-12 text-center"></div>
                        </div>

                        {isLoadingLikeds ? (
                            <div className="space-y-1">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-transparent">
                                        <Skeleton className="w-10 h-4" />
                                        <Skeleton className="w-12 h-12 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                        <Skeleton className="h-4 w-10" />
                                    </div>
                                ))}
                            </div>
                        ) : filtered.length > 0 ? (
                            <div className="space-y-1">
                                {filtered.map((song, i) => {
                                    const isCurrent = currentSong?.id === song.id;
                                    return (
                                        <motion.div
                                            key={song.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className={cn(
                                                "group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_1.5fr_auto_auto] gap-4 items-center px-4 py-3 rounded-xl transition-all cursor-default hover:bg-white/5 border border-transparent hover:border-white/5",
                                                isCurrent && "bg-white/10 border-white/10"
                                            )}
                                            onDoubleClick={() => handlePlay(song)}
                                        >
                                            <div className="w-8 text-center text-muted-foreground font-medium text-sm lg:text-base relative flex justify-center">
                                                <span className={cn("group-hover:opacity-0 transition-opacity", isCurrent && "text-pink-500")}>
                                                    {isCurrent && isPlaying ? (
                                                        <div className="flex gap-[2px] h-3 items-end justify-center">
                                                            <span className="w-0.5 bg-pink-500 animate-[music-bar-1_0.5s_ease-in-out_infinite]" />
                                                            <span className="w-0.5 bg-pink-500 animate-[music-bar-2_0.5s_ease-in-out_infinite_0.1s]" />
                                                            <span className="w-0.5 bg-pink-500 animate-[music-bar-3_0.5s_ease-in-out_infinite_0.2s]" />
                                                        </div>
                                                    ) : (
                                                        i + 1
                                                    )}
                                                </span>
                                                <button
                                                    onClick={() => handlePlay(song)}
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {isCurrent && isPlaying ? <div className="w-3 h-3 bg-white" /> : <Play className="w-4 h-4 fill-white text-white" />}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                                                    <img src={song.thumbnail} alt={song.title} loading="lazy" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0 flex flex-col justify-center">
                                                    <h4 className={cn(
                                                        "font-medium truncate text-base leading-tight mb-0.5",
                                                        isCurrent ? "text-pink-500" : "text-white"
                                                    )}>
                                                        {song.title}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground truncate group-hover:text-white/70 transition-colors">
                                                        {song.artist}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="hidden md:flex items-center text-sm text-muted-foreground truncate min-w-0">
                                                <span className="truncate group-hover:text-white/70 transition-colors">{song.album || "Single"}</span>
                                            </div>

                                            <div className="hidden md:flex justify-end text-sm text-muted-foreground font-variant-numeric tabular-nums pr-8">
                                                {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                                            </div>

                                            <div className="w-12 flex justify-center">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 hover:bg-pink-500/20 text-pink-500 hover:text-pink-400 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    onClick={(e) => handleRemove(song, e)}
                                                >
                                                    <Heart className="w-5 h-5 fill-current" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                                    <Disc className="w-16 h-16 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Songs you like appear here</h3>
                                <p className="text-muted-foreground max-w-sm mb-8">
                                    Save songs by tapping the heart icon. They'll be waiting for you here.
                                </p>
                                <Button
                                    variant="outline"
                                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 px-8"
                                    onClick={() => setActiveTab("home")}
                                >
                                    Find Songs
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LikedSongs;
