import { RequestHandler } from "express";
import { getAdvertisementVideos, getVideoDetails } from '../services/youtube-service';
import { executeQuery, executeSingleQuery } from "../db-postgres";
import { getUserByEmail, addVote, addTransaction, generateId, updateUserProfile } from "../user-db";
import { roundToTwoDecimals } from "../constants";
import { VoteResponse } from "@shared/api";

function getEmailFromToken(token: string | undefined): string | null {
  if (!token) {
    console.warn("[Videos] No authorization token provided");
    return null;
  }
  try {
    let tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;
    const email = Buffer.from(tokenValue, "base64").toString("utf-8").trim();
    if (!email) {
      console.warn("[Videos] Email is empty after decoding");
      return null;
    }
    return email;
  } catch (err) {
    console.error("[Videos] Error decoding token:", err);
    return null;
  }
}

/**
 * Calcula a recompensa baseada no dia consecutivo do usuário.
 * Dia 1: média ~$7.00 (range $6.00-$8.00)
 * Dia 50: média ~$0.50 (range $0.30-$0.70)
 * 
 * A progressão é linear decrescente para que em 50 dias,
 * com 10 vídeos/dia, o usuário acumule aproximadamente $3,287
 * (chegando a ~$3,500 com saldo inicial de $213)
 */
function calculateDecreasingReward(votingDaysCount: number): { min: number; max: number; average: number } {
  // Limitar entre dia 1 e dia 50
  const day = Math.max(1, Math.min(50, votingDaysCount));
  
  // Recompensa média no dia 1: $7.00
  // Recompensa média no dia 50: $0.50
  // Progressão linear decrescente
  const startAverage = 7.00;
  const endAverage = 0.50;
  
  // Calcular média para o dia atual (interpolação linear)
  const progress = (day - 1) / 49; // 0 no dia 1, 1 no dia 50
  const currentAverage = startAverage - (progress * (startAverage - endAverage));
  
  // Variação de ±15% em torno da média
  const variation = 0.15;
  const min = roundToTwoDecimals(currentAverage * (1 - variation));
  const max = roundToTwoDecimals(currentAverage * (1 + variation));
  
  return { 
    min, 
    max, 
    average: roundToTwoDecimals(currentAverage) 
  };
}

async function resetDailyCountersIfNeeded(user: any) {
  const now = new Date();
  const lastReset = user.last_daily_reset ? new Date(user.last_daily_reset) : new Date(0);
  const hoursSinceLastReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastReset >= 24) {
    let newVotingDaysCount: number;
    let newVotingStreak: number;
    
    // Se passaram mais de 48 horas, a sequência foi quebrada - resetar para 1
    if (hoursSinceLastReset >= 48) {
      newVotingDaysCount = 1;
      newVotingStreak = 1;
      console.log(`[resetDailyCountersIfNeeded] Sequence broken for user ${user.email} (${Math.floor(hoursSinceLastReset)} hours since last vote). Resetting to day 1.`);
    } else {
      // Dia consecutivo (entre 24 e 48 horas) - incrementar
      newVotingDaysCount = (user.voting_days_count || 0) + 1;
      newVotingStreak = (user.voting_streak || 0) + 1;
      console.log(`[resetDailyCountersIfNeeded] Consecutive day for user ${user.email}. Voting days: ${newVotingDaysCount}, Streak: ${newVotingStreak}`);
    }
    
    await executeQuery(
      "UPDATE users SET daily_votes_left = 10, daily_videos_watched = 0, last_daily_reset = NOW(), voting_days_count = $1, voting_streak = $2 WHERE id = $3",
      [newVotingDaysCount, newVotingStreak, user.id]
    );
    
    return await executeSingleQuery("SELECT * FROM users WHERE id = $1", [user.id]);
  }
  return user;
}

export const handleGetVideos: RequestHandler = async (req, res) => {
  try {
    let videos = await getAdvertisementVideos();

    if (!videos || videos.length === 0) {
      console.log('[Videos] YouTube API failed or returned no videos. Falling back to database.');
      const dbVideos = await executeQuery(
        `SELECT id, title, description, url, thumbnail, 
                reward_min as "rewardMin", reward_max as "rewardMax", 
                created_at as "createdAt", duration 
         FROM videos 
         ORDER BY RANDOM()`
      );

      videos = dbVideos.rows.map((video: any) => ({
        ...video,
        rewardMin: parseFloat(video.rewardMin) || 0,
        rewardMax: parseFloat(video.rewardMax) || 0,
        duration: video.duration || 180,
      }));
    }

    console.log(`[Videos] Loaded ${videos.length} advertisement videos.`);
    res.json(videos);
  } catch (error) {
    console.error("[Videos] Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

export const handleGetVideo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const videoQuery = await executeQuery(
      'SELECT id, title, description, url, thumbnail, reward_min as "rewardMin", reward_max as "rewardMax", created_at as "createdAt", duration FROM videos WHERE id = $1',
      [id]
    );

    if (videoQuery.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    const video = videoQuery.rows[0];
    res.json({
      ...video,
      rewardMin: parseFloat(video.rewardMin) || 0,
      rewardMax: parseFloat(video.rewardMax) || 0,
      duration: video.duration || 180,
    });
  } catch (error) {
    console.error("Video error:", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
};

export const handleGetDailyVotes: RequestHandler = async (req, res) => {
  try {
    const email = getEmailFromToken(req.headers.authorization);
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    let user = await executeSingleQuery("SELECT * FROM users WHERE email = $1", [email]);
    if (!user) return res.status(401).json({ error: "User not found" });

    // Resetar contadores diários se necessário
    user = await resetDailyCountersIfNeeded(user);

    res.json({
      remaining: user.daily_votes_left || 0,
      voted: 10 - (user.daily_votes_left || 0),
      totalVotes: user.daily_videos_watched || 0,
    });
  } catch (error) {
    console.error("Daily votes error:", error);
    res.status(500).json({ error: "Failed to fetch daily votes" });
  }
};

export const handleVote: RequestHandler = async (req, res) => {
  try {
    const email = getEmailFromToken(req.headers.authorization);
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    let user = await executeSingleQuery("SELECT * FROM users WHERE email = $1", [email]);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Resetar contadores diários se necessário
    user = await resetDailyCountersIfNeeded(user);

    if (user.daily_votes_left <= 0) {
      return res.status(400).json({ error: "You've reached your daily vote limit (10 votes)" });
    }

    const { id } = req.params;
    const { voteType } = req.body;

    if (!voteType || !["like", "dislike"].includes(voteType)) {
      return res.status(400).json({ error: "Invalid vote type" });
    }

    // Buscar vídeo do banco (apenas para título e thumbnail)
    const videoQuery = await executeQuery('SELECT * FROM videos WHERE id = $1', [id]);
    let videoTitle = "YouTube Video";
    let videoThumbnail = '';
    let videoUrl = `https://www.youtube.com/watch?v=${id}`;

    if (videoQuery.rows.length > 0) {
      const video = videoQuery.rows[0];
      videoTitle = video.title;
      videoThumbnail = video.thumbnail || '';
    } else {
      console.log(`[Vote] Video ${id} not found in DB, fetching details from YouTube API...`);
      const youtubeVideo = await getVideoDetails(id);
      if (youtubeVideo) {
        videoTitle = youtubeVideo.title;
        videoThumbnail = youtubeVideo.thumbnail || '';
        
        // Inserir o vídeo do YouTube no banco
        try {
          await executeQuery(
            `INSERT INTO videos (id, title, description, url, thumbnail, reward_min, reward_max, duration, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             ON CONFLICT (id) DO NOTHING`,
            [id, videoTitle, '', videoUrl, videoThumbnail, 0, 0, 180]
          );
          console.log(`[Vote] Video ${id} inserted into database`);
        } catch (insertErr) {
          console.error(`[Vote] Failed to insert video ${id}:`, insertErr);
        }
      } else {
        console.warn(`[Vote] Could not fetch details for video ${id}. Using default title.`);
        
        // Inserir vídeo com dados padrão
        try {
          await executeQuery(
            `INSERT INTO videos (id, title, description, url, thumbnail, reward_min, reward_max, duration, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             ON CONFLICT (id) DO NOTHING`,
            [id, videoTitle, '', videoUrl, '', 0, 0, 180]
          );
          console.log(`[Vote] Video ${id} inserted with default values`);
        } catch (insertErr) {
          console.error(`[Vote] Failed to insert video ${id}:`, insertErr);
        }
      }
    }

    // NOVA LÓGICA: Calcular recompensa baseada no dia consecutivo do usuário
    const votingDaysCount = user.voting_days_count || 1;
    const rewardRange = calculateDecreasingReward(votingDaysCount);
    
    // Gerar recompensa aleatória dentro do range calculado
    const reward = roundToTwoDecimals(Math.random() * (rewardRange.max - rewardRange.min) + rewardRange.min);
    const newBalance = roundToTwoDecimals(parseFloat(user.balance) + reward);

    console.log(`[Vote] User ${email} on day ${votingDaysCount}. Reward range: $${rewardRange.min}-$${rewardRange.max}. Actual reward: $${reward}`);

    // Atualizar contadores e saldo em uma única transação
    await executeQuery(
      "UPDATE users SET balance = $1, daily_votes_left = daily_votes_left - 1, daily_videos_watched = daily_videos_watched + 1, last_voted_at = NOW() WHERE id = $2",
      [newBalance, user.id]
    );

    const vote = {
      id: generateId(),
      userId: user.id,
      videoId: id,
      voteType: voteType as "like" | "dislike",
      rewardAmount: reward,
      createdAt: new Date().toISOString(),
    };
    await addVote(email, vote);

    const transaction = {
      id: generateId(),
      type: "credit" as const,
      amount: reward,
      description: `Video vote reward - ${videoTitle}`,
      status: "completed" as const,
      createdAt: new Date().toISOString(),
    };
    await addTransaction(email, transaction);

    const updatedUser = await executeSingleQuery("SELECT * FROM users WHERE id = $1", [user.id]);

    const response: VoteResponse = {
      vote,
      newBalance,
      dailyVotesRemaining: updatedUser.daily_votes_left,
      totalVideosWatched: updatedUser.daily_videos_watched,
      rewardAmount: reward,
      votingStreak: updatedUser.voting_streak || 0,
      votingDaysCount: updatedUser.voting_days_count || 0,
    };

    res.json(response);
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ error: "Failed to process vote" });
  }
};
