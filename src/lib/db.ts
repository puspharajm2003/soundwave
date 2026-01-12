import { openDB, DBSchema } from 'idb';
import { Song } from '@/types/music';

interface SoundWavesDB extends DBSchema {
    songs: {
        key: string;
        value: {
            song: Song;
            blob?: Blob;
            savedAt: Date;
        };
    };
    history: {
        key: number;
        value: {
            song: Song;
            playedAt: Date;
        };
        indexes: { 'by-date': Date };
    };
    favorites: {
        key: string;
        value: Song & { likedAt: Date };
    };
}

const DB_NAME = 'soundwaves-db';
const DB_VERSION = 3;

export const initDB = async () => {
    return openDB<SoundWavesDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            if (oldVersion < 2) {
                if (db.objectStoreNames.contains('songs')) {
                    db.deleteObjectStore('songs');
                }
                db.createObjectStore('songs');
            }
            if (!db.objectStoreNames.contains('history')) {
                const historyStore = db.createObjectStore('history', { autoIncrement: true });
                historyStore.createIndex('by-date', 'playedAt');
            } else if (oldVersion < 3) {
                // Upgrade history if needed, or just clear it since it's incompatible
                db.deleteObjectStore('history');
                const historyStore = db.createObjectStore('history', { autoIncrement: true });
                historyStore.createIndex('by-date', 'playedAt');
            }
            if (!db.objectStoreNames.contains('favorites')) {
                db.createObjectStore('favorites', { keyPath: 'id' });
            }
        },
    });
};

import { supabase } from '@/integrations/supabase/client';

export const saveSongData = async (song: Song, blob?: Blob) => {
    const db = await initDB();
    await db.put('songs', { song, blob, savedAt: new Date() }, song.id);

    // Sync to Supabase if user is logged in
    // Note: The current Supabase schema (src/integrations/supabase/types.ts) does NOT have a 'Song' or 'Library' table.
    // It only has 'listening_history', 'profiles', and 'user_preferences'.
    // Therefore we cannot sync the downloaded library to the cloud yet without schema changes.
    // We will stick to local persistence for library, and sync History/Profile to cloud.
};

export const getSongData = async (id: string) => {
    const db = await initDB();
    return db.get('songs', id);
};

export const getAllDownloadedSongs = async (): Promise<Song[]> => {
    const db = await initDB();
    const all = await db.getAll('songs');
    return all.map(item => item.song);
};

export const deleteSongData = async (id: string) => {
    const db = await initDB();
    await db.delete('songs', id);
};

export const toggleFavorite = async (song: Song) => {
    const db = await initDB();
    const exists = await db.get('favorites', song.id);
    if (exists) {
        await db.delete('favorites', song.id);
        return false; // removed
    } else {
        await db.put('favorites', { ...song, likedAt: new Date() });
        return true; // added
    }
};

export const getFavorites = async (): Promise<Song[]> => {
    const db = await initDB();
    const favorites = await db.getAll('favorites');
    // Sort by likedAt if needed, but for now just return reverse order?
    return favorites.reverse();
};

export const isFavorite = async (id: string): Promise<boolean> => {
    const db = await initDB();
    const exists = await db.get('favorites', id);
    return !!exists;
};

export const saveHistory = async (song: Song) => {
    const db = await initDB();
    await db.add('history', { song, playedAt: new Date() });

    // Sync to Supabase History
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            // Write directly to listening_history as per actual Supabase schema
            const { error: histError } = await supabase
                .from('listening_history')
                .insert({
                    user_id: session.user.id,
                    song_id: song.id, // Keeping original ID reference
                    song_title: song.title,
                    song_artist: song.artist,
                    song_thumbnail: song.thumbnail,
                    duration: song.duration,
                    played_at: new Date().toISOString(),
                    completed: false
                });

            if (histError) {
                console.error("Error syncing history:", histError);
            }
        }
    } catch (err) {
        console.error("Supabase history sync failed:", err);
    }
}

export const getHistory = async () => {
    const db = await initDB();
    return db.getAllFromIndex('history', 'by-date');
}

