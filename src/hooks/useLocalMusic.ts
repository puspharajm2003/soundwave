import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllDownloadedSongs, getHistory } from '@/lib/db';
import { Song } from '@/types/music';

export const useLocalMusic = () => {
    const queryClient = useQueryClient();

    const { data: downloadedSongs = [], isLoading: isLoadingDownloads } = useQuery({
        queryKey: ['local-songs'],
        queryFn: getAllDownloadedSongs,
    });

    const { data: history = [], isLoading: isLoadingHistory } = useQuery({
        queryKey: ['local-history'],
        queryFn: async () => {
            const hist = await getHistory();
            // Sort by playedAt desc and extract song
            // We remove duplicates by song.id if desired, but for history usually we want the list.
            // However, "Recently Played" usually implies unique items.
            // Let's deduplicate by ID, keeping most recent.
            const uniqueMap = new Map<string, Song>();

            // Sort descending first so we process newest first
            const sorted = hist.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());

            sorted.forEach(item => {
                if (!uniqueMap.has(item.song.id)) {
                    uniqueMap.set(item.song.id, item.song);
                }
            });

            return Array.from(uniqueMap.values());
        },
    });

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['local-songs'] });
        queryClient.invalidateQueries({ queryKey: ['local-history'] });
    };

    return {
        downloadedSongs,
        isLoadingDownloads,
        history,
        isLoadingHistory,
        refresh
    };
};
