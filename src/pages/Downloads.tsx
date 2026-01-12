import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types/music";
import { getAllDownloadedSongs, deleteSongData } from "@/lib/db";
import { Download, Play, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Downloads: React.FC = () => {
    const [activeTab, setActiveTab] = useState("downloads");
    const [downloads, setDownloads] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const { playSong, currentSong } = usePlayer();

    useEffect(() => {
        loadDownloads();
    }, []);

    const loadDownloads = async () => {
        const songs = await getAllDownloadedSongs();
        setDownloads(songs);
        setLoading(false);
    };

    const handlePlay = (song: Song) => {
        playSong(song);
    };

    const handleDelete = async (song: Song, e: React.MouseEvent) => {
        e.stopPropagation();
        await deleteSongData(song.id);
        const newSongs = downloads.filter(s => s.id !== song.id);
        setDownloads(newSongs);
        toast.success("Removed from downloads");
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="lg:ml-64 pb-40 px-4 md:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/5 border border-green-500/20">
                        <Download className="w-10 h-10 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
                            Downloads
                        </h1>
                        <p className="text-muted-foreground">
                            {downloads.length} songs available offline
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-muted-foreground animate-pulse">Loading downloads...</div>
                ) : downloads.length > 0 ? (
                    <div className="grid gap-2">
                        {downloads.map((song, i) => (
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
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => handleDelete(song, e)}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass-card">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <Download className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No downloads yet</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Download songs from YouTube to listen offline.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Downloads;
