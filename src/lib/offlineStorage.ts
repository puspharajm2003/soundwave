import { openDB, IDBPDatabase } from "idb";
import { Song, Playlist } from "@/types/music";

const DB_NAME = "music-player-db";
const DB_VERSION = 1;

interface MusicDB {
  songs: {
    key: string;
    value: Song & { audioBlob?: Blob; thumbnailBlob?: Blob };
    indexes: { "by-source": string; "by-downloaded": number };
  };
  playlists: {
    key: string;
    value: Playlist;
    indexes: { "by-type": string };
  };
  listeningHistory: {
    key: string;
    value: {
      songId: string;
      timestamp: number;
      duration: number;
      completed: boolean;
    };
  };
  userPreferences: {
    key: string;
    value: unknown;
  };
  downloadQueue: {
    key: string;
    value: {
      songId: string;
      status: "pending" | "downloading" | "completed" | "failed";
      progress: number;
      addedAt: number;
    };
  };
}

class OfflineStorage {
  private db: IDBPDatabase<MusicDB> | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.db = await openDB<MusicDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Songs store
          if (!db.objectStoreNames.contains("songs")) {
            const songsStore = db.createObjectStore("songs", { keyPath: "id" });
            songsStore.createIndex("by-source", "source");
            songsStore.createIndex("by-downloaded", "isDownloaded");
          }

          // Playlists store
          if (!db.objectStoreNames.contains("playlists")) {
            const playlistsStore = db.createObjectStore("playlists", {
              keyPath: "id",
            });
            playlistsStore.createIndex("by-type", "type");
          }

          // Listening history store
          if (!db.objectStoreNames.contains("listeningHistory")) {
            db.createObjectStore("listeningHistory", {
              keyPath: "id",
              autoIncrement: true,
            });
          }

          // User preferences store
          if (!db.objectStoreNames.contains("userPreferences")) {
            db.createObjectStore("userPreferences", { keyPath: "key" });
          }

          // Download queue store
          if (!db.objectStoreNames.contains("downloadQueue")) {
            db.createObjectStore("downloadQueue", { keyPath: "songId" });
          }
        },
      });
    })();

    return this.initPromise;
  }

  // Songs
  async saveSong(song: Song, audioBlob?: Blob, thumbnailBlob?: Blob): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.put("songs", {
      ...song,
      audioBlob,
      thumbnailBlob,
      isDownloaded: !!audioBlob,
    });
  }

  async getSong(id: string): Promise<Song | undefined> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return this.db.get("songs", id);
  }

  async getDownloadedSongs(): Promise<Song[]> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return this.db.getAllFromIndex("songs", "by-downloaded", 1);
  }

  async getSongsBySource(source: string): Promise<Song[]> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return this.db.getAllFromIndex("songs", "by-source", source);
  }

  async deleteSong(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.delete("songs", id);
  }

  // Playlists
  async savePlaylist(playlist: Playlist): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.put("playlists", playlist);
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return this.db.get("playlists", id);
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return this.db.getAll("playlists");
  }

  async getPlaylistsByType(type: string): Promise<Playlist[]> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return this.db.getAllFromIndex("playlists", "by-type", type);
  }

  async deletePlaylist(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.delete("playlists", id);
  }

  // Listening History
  async addToHistory(
    songId: string,
    duration: number,
    completed: boolean
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.add("listeningHistory", {
      songId,
      timestamp: Date.now(),
      duration,
      completed,
    });
  }

  async getListeningHistory(limit = 50): Promise<
    Array<{ songId: string; timestamp: number; duration: number; completed: boolean }>
  > {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const all = await this.db.getAll("listeningHistory");
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  // User Preferences
  async setPreference(key: string, value: unknown): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.put("userPreferences", { key, value });
  }

  async getPreference<T>(key: string): Promise<T | undefined> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.get("userPreferences", key);
    return result?.value as T | undefined;
  }

  // Download Queue
  async addToDownloadQueue(songId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.put("downloadQueue", {
      songId,
      status: "pending",
      progress: 0,
      addedAt: Date.now(),
    });
  }

  async updateDownloadProgress(
    songId: string,
    progress: number,
    status: "pending" | "downloading" | "completed" | "failed"
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const item = await this.db.get("downloadQueue", songId);
    if (item) {
      await this.db.put("downloadQueue", { ...item, progress, status });
    }
  }

  async getDownloadQueue(): Promise<
    Array<{
      songId: string;
      status: string;
      progress: number;
      addedAt: number;
    }>
  > {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return this.db.getAll("downloadQueue");
  }

  async removeFromDownloadQueue(songId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.delete("downloadQueue", songId);
  }

  // Storage stats
  async getStorageStats(): Promise<{
    songsCount: number;
    playlistsCount: number;
    downloadedCount: number;
    estimatedSize: number;
  }> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const songs = await this.db.getAll("songs");
    const playlists = await this.db.getAll("playlists");
    const downloaded = songs.filter((s) => s.isDownloaded);

    // Estimate size (rough calculation)
    let estimatedSize = 0;
    for (const song of downloaded) {
      if (song.audioBlob) {
        estimatedSize += song.audioBlob.size;
      }
      if (song.thumbnailBlob) {
        estimatedSize += song.thumbnailBlob.size;
      }
    }

    return {
      songsCount: songs.length,
      playlistsCount: playlists.length,
      downloadedCount: downloaded.length,
      estimatedSize,
    };
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.clear("songs");
    await this.db.clear("playlists");
    await this.db.clear("listeningHistory");
    await this.db.clear("downloadQueue");
  }
}

export const offlineStorage = new OfflineStorage();

// Hook for using offline storage
import { useState, useEffect, useCallback } from "react";

export const useOfflineStorage = () => {
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    offlineStorage.init().then(() => setIsReady(true));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const downloadSong = useCallback(
    async (song: Song, quality: "low" | "medium" | "high" = "high") => {
      // Add to queue
      await offlineStorage.addToDownloadQueue(song.id);

      try {
        // Update status
        await offlineStorage.updateDownloadProgress(song.id, 0, "downloading");

        // Simulate download (in real app, this would fetch audio)
        // For demo, we'll just save the metadata
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark as completed
        await offlineStorage.saveSong({ ...song, isDownloaded: true });
        await offlineStorage.updateDownloadProgress(song.id, 100, "completed");
        await offlineStorage.removeFromDownloadQueue(song.id);

        return true;
      } catch (error) {
        await offlineStorage.updateDownloadProgress(song.id, 0, "failed");
        return false;
      }
    },
    []
  );

  return {
    isReady,
    isOnline,
    storage: offlineStorage,
    downloadSong,
  };
};
