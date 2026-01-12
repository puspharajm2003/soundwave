import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song, Playlist } from "@/types/music";

// Extending existing types or defining DB matching types
export interface DB_Song {
    id: string;
    title: string;
    artist: string;
    album: string | null;
    coverUrl: string;
    audioUrl: string;
    duration: number;
}

export interface DB_Playlist {
    id: string;
    title: string;
    coverUrl: string | null;
    userId: string;
}

export const useSupabaseMusic = () => {
    const { data: songs = [], isLoading: isLoadingSongs, error: songsError } = useQuery({
        queryKey: ['supabase-songs'],
        queryFn: async () => {
            // Cast to any because types aren't regenerated yet
            const { data, error } = await (supabase as any).from('Song').select('*');
            if (error) throw error;

            return data.map((s: any) => ({
                id: s.id,
                title: s.title,
                artist: s.artist,
                album: s.album || '',
                thumbnail: s.coverUrl,
                source: 'online', // Standardize to match app type
                streamUrl: s.audioUrl,
                duration: s.duration,
                isDownloaded: false // Default for cloud data
            })) as Song[];
        }
    });

    const { data: playlists = [], isLoading: isLoadingPlaylists } = useQuery({
        queryKey: ['supabase-playlists'],
        queryFn: async () => {
            const { data, error } = await (supabase as any).from('Playlist').select('*');
            if (error) throw error;
            return data as DB_Playlist[];
        }
    });

    const { data: likedSongs = [], isLoading: isLoadingLikeds } = useQuery({
        queryKey: ['supabase-liked'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return [];

            const { data, error } = await (supabase as any).from('LikedSong')
                .select(`
          songId,
          song:Song (*)
        `)
                .eq('userId', session.user.id);

            if (error) throw error;

            return data.map((item: any) => ({
                id: item.song.id,
                title: item.song.title,
                artist: item.song.artist,
                album: item.song.album || '',
                thumbnail: item.song.coverUrl,
                source: 'online',
                streamUrl: item.song.audioUrl,
                duration: item.song.duration,
                isDownloaded: false
            })) as Song[];
        }
    });

    return {
        songs,
        playlists,
        likedSongs,
        isLoadingSongs,
        isLoadingPlaylists,
        isLoadingLikeds,
        songsError
    };
};
