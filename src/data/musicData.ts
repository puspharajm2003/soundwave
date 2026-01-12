import { Song, Playlist, UserProfile } from "@/types/music";

// Initial check implies I should double check the type definition.
// Moving to view types/music.ts first to avoid compilation errors.

export const demoSongs: Song[] = [
  {
    id: "1",
    title: "Midnight Dreams",
    artist: "Luna Eclipse",
    album: "Cosmic Waves",
    duration: 234,
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    source: "online", // Changed to online for immediate testing
    // youtubeId: "dQw4w9WgXcQ",
    isDownloaded: false,
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "2",
    title: "Neon City",
    artist: "Synthwave Collective",
    album: "Retrowave",
    duration: 198,
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
    source: "online",
    // youtubeId: "abc123",
    isDownloaded: false,
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "3",
    title: "Ocean Breeze",
    artist: "Chill Vibes",
    album: "Summer Nights",
    duration: 267,
    thumbnail: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
    source: "online",
    isDownloaded: true,
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: "4",
    title: "Electric Soul",
    artist: "Beat Masters",
    album: "Digital Dreams",
    duration: 215,
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    source: "online",
    isDownloaded: false,
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: "5",
    title: "Starlight",
    artist: "Aurora",
    album: "Northern Lights",
    duration: 289,
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    source: "online",
    isDownloaded: true,
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: "6",
    title: "Urban Jungle",
    artist: "Metro Beats",
    album: "City Sounds",
    duration: 186,
    thumbnail: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&h=400&fit=crop",
    source: "online",
    isDownloaded: false,
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: "7",
    title: "Velvet Night",
    artist: "Jazz Fusion",
    album: "Smooth Grooves",
    duration: 312,
    thumbnail: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop",
    source: "online",
    isDownloaded: true,
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: "8",
    title: "Phoenix Rising",
    artist: "Epic Orchestra",
    album: "Cinematic",
    duration: 245,
    thumbnail: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop",
    source: "online",
    isDownloaded: false,
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
];

export const demoPlaylists: Playlist[] = [
  {
    id: "youtube-main",
    name: "YouTube Favorites",
    description: "Your favorite tracks from YouTube",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    songs: demoSongs.filter(s => s.source === "youtube"),
    type: "youtube",
    createdAt: new Date("2024-01-15"),
    songCount: 5,
  },
  {
    id: "online-music",
    name: "Online Discoveries",
    description: "Great finds from around the web",
    thumbnail: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
    songs: demoSongs.filter(s => s.source === "online"),
    type: "online",
    createdAt: new Date("2024-02-01"),
    songCount: 3,
  },
  {
    id: "offline-local",
    name: "Offline Jams",
    description: "Available anytime, anywhere",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    songs: demoSongs.filter(s => s.isDownloaded),
    type: "offline",
    createdAt: new Date("2024-02-10"),
    songCount: 4,
  },
  {
    id: "chill-vibes",
    name: "Chill Vibes",
    description: "Perfect for relaxation",
    thumbnail: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop",
    songs: [demoSongs[2], demoSongs[6]],
    type: "custom",
    createdAt: new Date("2024-02-15"),
    songCount: 2,
  },
  {
    id: "workout-mix",
    name: "Workout Mix",
    description: "High energy tracks",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    songs: [demoSongs[1], demoSongs[3], demoSongs[7]],
    type: "custom",
    createdAt: new Date("2024-02-20"),
    songCount: 3,
  },
];


