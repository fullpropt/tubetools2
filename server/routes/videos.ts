# Corrigido: server/routes/videos.ts
import { RequestHandler } from "express";
import { getAdvertisementVideos } from '../services/youtube-service';
import { executeQuery } from "../db-postgres";
import { getUserByEmail, addVote, addTransaction, getDailyVoteCount, generateId } from "../user-db";
import { roundToTwoDecimals } from "../constants";
import { VoteResponse } from "@shared/api";

// ######### FUNÇÃO UNIFICADA E CORRIGIDA #########
export const handleGetVideos: RequestHandler = async (req, res) => {
  try {
    // 1. Tenta buscar vídeos da API do YouTube
    let videos = await getAdvertisementVideos();

    // 2. Se a API do YouTube não retornar vídeos, usa o banco de dados como fallback
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

// ######### RESTANTE DO CÓDIGO ORIGINAL #########

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

export const handleGetDailyVotes: RequestHandler = async (req, res) => {
  try {
    const email = getEmailFromToken(req.headers.authorization);
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const userData = await getUserByEmail(email);
    if (!userData) return res.status(401).json({ error: "User not found" });

    const dailyVotes = await getDailyVoteCount(email);
    res.json({
      remaining: Math.max(0, 10 - dailyVotes),
      voted: dailyVotes,
      totalVotes: userData.votes.length,
    });
  } catch (error) {
    console.error("Daily votes error:", error);
    res.status(500).json({ error: "Failed to fetch daily votes" });
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

export const handleVote: RequestHandler = async (req, res) => {
  try {
    const email = getEmailFromToken(req.headers.authorization);
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { voteType } = req.body;

    if (!voteType || !["like", "dislike"].includes(voteType)) {
      return res.status(400).json({ error: "Invalid vote type" });
    }

    const videoQuery = await executeQuery('SELECT * FROM videos WHERE id = $1', [id]);
    if (videoQuery.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    const video = videoQuery.rows[0];

    let userData = await getUserByEmail(email);
    if (!userData) return res.status(404).json({ error: "User not found" });

    const dailyVotes = await getDailyVoteCount(email);
    if (dailyVotes >= 10) {
      return res.status(400).json({ error: "You've reached your daily vote limit (10 votes)" });
    }

    const rewardMin = parseFloat(video.reward_min);
    const rewardMax = parseFloat(video.reward_max);
    const reward = roundToTwoDecimals(Math.random() * (rewardMax - rewardMin) + rewardMin);

    const vote = {
      id: generateId(),
      userId: userData.profile.id,
      videoId: video.id,
      voteType: voteType as "like" | "dislike",
      rewardAmount: reward,
      createdAt: new Date().toISOString(),
    };
    await addVote(email, vote);

    const newBalance = roundToTwoDecimals(userData.profile.balance + reward);
    userData.profile.balance = newBalance;
    userData.profile.lastVotedAt = new Date().toISOString();
    await updateUserProfile(email, userData.profile);

    const transaction = {
      id: generateId(),
      type: "credit" as const,
      amount: reward,
      description: `Video vote reward - ${video.title}`,
      status: "completed" as const,
      createdAt: new Date().toISOString(),
    };
    await addTransaction(email, transaction);

    const response: VoteResponse = {
      vote,
      newBalance,
      dailyVotesRemaining: 10 - (dailyVotes + 1),
      rewardAmount: reward,
      votingStreak: userData.profile.votingStreak || 0,
      votingDaysCount: userData.profile.votingDaysCount || 0,
    };

    res.json(response);
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ error: "Failed to process vote" });
  }
};
