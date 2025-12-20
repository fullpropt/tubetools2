import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: number;
  rewardMin: number;
  rewardMax: number;
  channelTitle: string;
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 180;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  return hours * 3600 + minutes * 60 + seconds;
}

function calculateRewards(durationSeconds: number): { min: number; max: number } {
  // Normalize duration to 0.5-10 minute range for multiplier calculation
  const durationMinutes = Math.min(10, Math.max(0.5, durationSeconds / 60));
  
  // Base rewards: average around $15-$27
  const baseMin = 15.00;
  const baseMax = 27.00;
  
  // Multiplier varies based on duration (0.5 to 1.5)
  // This creates variation while keeping average in target range
  const multiplier = 0.5 + (durationMinutes / 10) * 1.0;
  
  const rewardMin = parseFloat((baseMin * multiplier).toFixed(2));
  const rewardMax = parseFloat((baseMax * multiplier).toFixed(2));
  
  return { min: rewardMin, max: rewardMax };
}

export async function searchAdvertisementVideos(
  query: string = 'advertisement commercial',
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  try {
    if (!YOUTUBE_API_KEY) {
      console.warn('[YouTube] API key is not configured. Skipping search.');
      return [];
    }

    const searchResponse = await axios.get(
      `${YOUTUBE_API_BASE}/search`,
      {
        params: {
          key: YOUTUBE_API_KEY,
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults: maxResults,
          order: 'relevance',
          videoDuration: 'short',
          videoEmbeddable: 'true',
          safeSearch: 'strict',
          regionCode: 'US',
        }
      }
    );

    const videoIds = searchResponse.data.items
      .map((item: any) => item.id.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      console.warn('[YouTube] No videos found for the query.');
      return [];
    }

    const detailsResponse = await axios.get(
      `${YOUTUBE_API_BASE}/videos`,
      {
        params: {
          key: YOUTUBE_API_KEY,
          id: videoIds.join(','),
          part: 'snippet,contentDetails',
        }
      }
    );

    const videos: YouTubeVideo[] = detailsResponse.data.items
      .map((item: any) => {
        const durationString = item.contentDetails.duration;
        const duration = parseDuration(durationString);
        const rewards = calculateRewards(duration);

        return {
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          url: `https://www.youtube.com/embed/${item.id}`,
          duration: Math.max(duration, 30),
          rewardMin: rewards.min,
          rewardMax: rewards.max,
          channelTitle: item.snippet.channelTitle,
        };
      })
      .filter((video) => video.duration >= 30 && video.duration <= 600);

    console.log(`[YouTube] Successfully fetched ${videos.length} advertisement videos`);
    return videos;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        const errorMessage = data?.error?.message || 'No additional error message';
        if (status === 403) {
            console.error(`[YouTube] Error 403: Forbidden. This may be due to an incorrect API key or exceeded daily quota. Details: ${errorMessage}`);
        } else {
            console.error(`[YouTube] API Error ${status}: ${errorMessage}`);
        }
    } else {
        console.error('[YouTube] An unexpected error occurred:', error);
    }
    return [];
  }
}

// Nova função para buscar detalhes de um único vídeo
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  try {
    if (!YOUTUBE_API_KEY) {
      console.warn('[YouTube] API key is not configured. Cannot fetch video details.');
      return null;
    }

    const response = await axios.get(
      `${YOUTUBE_API_BASE}/videos`,
      {
        params: {
          key: YOUTUBE_API_KEY,
          id: videoId,
          part: 'snippet,contentDetails',
        }
      }
    );

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const item = response.data.items[0];
    const durationString = item.contentDetails.duration;
    const duration = parseDuration(durationString);
    const rewards = calculateRewards(duration);

    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      url: `https://www.youtube.com/embed/${item.id}`,
      duration: Math.max(duration, 30),
      rewardMin: rewards.min,
      rewardMax: rewards.max,
      channelTitle: item.snippet.channelTitle,
    };
  } catch (error) {
    console.error(`[YouTube] Error fetching details for video ${videoId}:`, error);
    return null;
  }
}

const videoCache: { videos: YouTubeVideo[]; timestamp: number } = {
  videos: [],
  timestamp: 0,
};

const CACHE_DURATION = 3600000; // 1 hour

export async function getAdvertisementVideos(useCache: boolean = true): Promise<YouTubeVideo[]> {
  const now = Date.now();

  if (useCache && videoCache.videos.length > 0 && now - videoCache.timestamp < CACHE_DURATION) {
    console.log('[YouTube] Using cached videos');
    return videoCache.videos;
  }

  const videos = await searchAdvertisementVideos();

  if (videos.length > 0) {
    videoCache.videos = videos;
    videoCache.timestamp = now;
  }

  return videos;
}

export function clearVideoCache(): void {
  videoCache.videos = [];
  videoCache.timestamp = 0;
  console.log('[YouTube] Cache cleared');
}

export function getCacheInfo(): { size: number; age: number; duration: number } {
  const now = Date.now();
  return {
    size: videoCache.videos.length,
    age: now - videoCache.timestamp,
    duration: CACHE_DURATION,
  };
}
