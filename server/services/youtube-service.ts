// server/services/youtube-service.ts - Com recompensas baseadas em duração
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

// Converter duração ISO 8601 para segundos
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 180; // Padrão: 3 minutos

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  return hours * 3600 + minutes * 60 + seconds;
}

// Calcular recompensas baseadas na duração do vídeo
// Quanto mais longo, maior a recompensa
function calculateRewards(durationSeconds: number): { min: number; max: number } {
  // Normalizar duração (30s a 600s = 0.5 a 10 minutos)
  const durationMinutes = Math.min(10, Math.max(0.5, durationSeconds / 60));

  // Fórmula: base + (duração * multiplicador)
  // Exemplos:
  // - 30s (0.5min): $2.00 - $8.00
  // - 180s (3min): $4.70 - $14.60
  // - 300s (5min): $6.40 - $17.20
  // - 600s (10min): $9.00 - $22.00

  const baseMin = 2.0;
  const baseMax = 8.0;
  const multiplier = 1.3;

  const rewardMin = parseFloat((baseMin + durationMinutes * multiplier).toFixed(2));
  const rewardMax = parseFloat((baseMax + durationMinutes * multiplier).toFixed(2));

  return { min: rewardMin, max: rewardMax };
}

export async function searchAdvertisementVideos(
  query: string = 'advertisement commercial',
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  try {
    if (!YOUTUBE_API_KEY) {
      console.warn('[YouTube] API key not configured');
      return [];
    }

    console.log(`[YouTube] Searching for "${query}" videos...`);

    // Buscar vídeos com a query
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
          videoDuration: 'short', // Vídeos curtos (< 4 minutos)
          videoEmbeddable: 'true', // Apenas vídeos embarcáveis
          safeSearch: 'strict', // Conteúdo seguro
          regionCode: 'US',
        }
      }
    );

    const videoIds = searchResponse.data.items
      .map((item: any) => item.id.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      console.warn('[YouTube] No videos found');
      return [];
    }

    console.log(`[YouTube] Found ${videoIds.length} video IDs, fetching details...`);

    // Obter detalhes dos vídeos (incluindo duração)
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

    // Mapear para o formato esperado
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
          duration: Math.max(duration, 30), // Mínimo 30 segundos
          rewardMin: rewards.min,
          rewardMax: rewards.max,
          channelTitle: item.snippet.channelTitle,
        };
      })
      .filter((video) => video.duration >= 30 && video.duration <= 600); // 30s a 10min

    console.log(`[YouTube] Successfully fetched ${videos.length} advertisement videos`);
    console.log(`[YouTube] Reward range: $${videos[0]?.rewardMin || 0} - $${videos[0]?.rewardMax || 0}`);

    return videos;
  } catch (error) {
    console.error('[YouTube] Error fetching videos:', error);
    return [];
  }
}

// Cache de vídeos
const videoCache: { videos: YouTubeVideo[]; timestamp: number } = {
  videos: [],
  timestamp: 0,
};

const CACHE_DURATION = 3600000; // 1 hora em ms

export async function getAdvertisementVideos(
  useCache: boolean = true
): Promise<YouTubeVideo[]> {
  const now = Date.now();

  if (
    useCache &&
    videoCache.videos.length > 0 &&
    now - videoCache.timestamp < CACHE_DURATION
  ) {
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

// Limpar cache manualmente
export function clearVideoCache(): void {
  videoCache.videos = [];
  videoCache.timestamp = 0;
  console.log('[YouTube] Cache cleared');
}

// Obter informações do cache
export function getCacheInfo(): { size: number; age: number; duration: number } {
  const now = Date.now();
  return {
    size: videoCache.videos.length,
    age: now - videoCache.timestamp,
    duration: CACHE_DURATION,
  };
}
