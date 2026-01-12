import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: number;
  audioUrl?: string;
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch video info using YouTube's oEmbed API (no API key required)
async function getVideoInfo(videoId: string): Promise<YouTubeVideoInfo> {
  console.log(`Fetching video info for: ${videoId}`);

  const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    const response = await fetch(oEmbedUrl);
    if (!response.ok) {
      throw new Error(`oEmbed API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      videoId,
      title: data.title || "Unknown Title",
      author: data.author_name || "Unknown Artist",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 0, // oEmbed doesn't provide duration
    };
  } catch (error) {
    console.error("Error fetching video info:", error);
    // Return basic info with video ID
    return {
      videoId,
      title: "YouTube Video",
      author: "Unknown Artist",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: 0,
    };
  }
}

// Try to get audio stream URL using various methods
async function getAudioStreamUrl(videoId: string): Promise<string | null> {
  console.log(`Attempting to get audio stream for: ${videoId}`);

  // Method 1: Try Invidious instances (privacy-respecting YouTube frontend)
  const invidiousInstances = [
    "https://inv.tux.pizza",
    "https://invidious.flokinet.to",
    "https://invidious.projectsegfau.lt",
    "https://vid.puffyan.us",
    "https://invidious.kavin.rocks",
    "https://yewtu.be",
  ];

  for (const instance of invidiousInstances) {
    try {
      const apiUrl = `${instance}/api/v1/videos/${videoId}`;
      console.log(`Trying Invidious instance: ${instance}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        // Find audio-only format
        const audioFormats = data.adaptiveFormats?.filter((f: any) =>
          f.type?.includes('audio') || f.mimeType?.includes('audio')
        ) || [];

        if (audioFormats.length > 0) {
          // Sort by bitrate and get best quality
          audioFormats.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
          const bestAudio = audioFormats[0];
          console.log(`Found audio stream from ${instance}`);
          return bestAudio.url;
        }

        // Fallback to regular formats with audio
        const formatWithAudio = data.formatStreams?.find((f: any) =>
          f.type?.includes('audio') || f.container === 'mp4'
        );

        if (formatWithAudio?.url) {
          console.log(`Found video+audio stream from ${instance}`);
          return formatWithAudio.url;
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Invidious instance ${instance} failed:`, errorMessage);
      continue;
    }
  }

  // Method 2: Try Piped instances
  const pipedInstances = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.yt",
    "https://pa.il.ax",
    "https://pipedapi.moomoo.me",
  ];

  for (const instance of pipedInstances) {
    try {
      const apiUrl = `${instance}/streams/${videoId}`;
      console.log(`Trying Piped instance: ${instance}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        // Find audio streams
        const audioStreams = data.audioStreams || [];
        if (audioStreams.length > 0) {
          // Sort by bitrate
          audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
          console.log(`Found audio stream from ${instance}`);
          return audioStreams[0].url;
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Piped instance ${instance} failed:`, errorMessage);
      continue;
    }
  }

  console.log("No audio stream found from any instance");
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, url, action } = await req.json();

    console.log(`Received request: action=${action}, videoId=${videoId}, url=${url}`);

    // Extract video ID if URL provided
    let resolvedVideoId = videoId;
    if (url && !videoId) {
      resolvedVideoId = extractVideoId(url);
    }

    if (!resolvedVideoId) {
      return new Response(
        JSON.stringify({ error: "Invalid video ID or URL" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === "info") {
      // Get video info only
      const info = await getVideoInfo(resolvedVideoId);
      return new Response(
        JSON.stringify({ success: true, data: info }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === "stream") {
      // Get video info and audio stream URL
      const [info, audioUrl] = await Promise.all([
        getVideoInfo(resolvedVideoId),
        getAudioStreamUrl(resolvedVideoId),
      ]);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            ...info,
            audioUrl,
            streamAvailable: !!audioUrl,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default: return both info and stream
    const [info, audioUrl] = await Promise.all([
      getVideoInfo(resolvedVideoId),
      getAudioStreamUrl(resolvedVideoId),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...info,
          audioUrl,
          streamAvailable: !!audioUrl,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: "Failed to process YouTube audio request"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
