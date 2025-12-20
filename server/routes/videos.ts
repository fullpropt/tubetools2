import { RequestHandler } from "express";
import { getAdvertisementVideos, getVideoDetails } from '../services/youtube-service';
import { executeQuery, executeSingleQuery } from "../db-postgres";
import { getUserByEmail, addVote, addTransaction, generateId, updateUserProfile } from "../user-db";
import { roundToTwoDecimals } from "../constants";
import { VoteResponse } from "@shared/api";

// ... (handleGetVideos e outras funções permanecem as mesmas)

async function resetDailyCountersIfNeeded(user: any) {
  const now = new Date();
  const lastReset = user.last_daily_reset ? new Date(user.last_daily_reset) : new Date(0);
  const hoursSinceLastReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastReset >= 24) {
    await executeQuery(
      "UPDATE users SET daily_votes_left = 10, daily_videos_watched = 0, last_daily_reset = NOW() WHERE id = $1",
      [user.id]
    );
    console.log(`[resetDailyCountersIfNeeded] Daily counters reset for user ${user.email}`);
    // Recarregar dados do usuário após o reset
    return await executeSingleQuery("SELECT * FROM users WHERE id = $1", [user.id]);
  }
  return user;
}

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

    const videoQuery = await executeQuery('SELECT * FROM videos WHERE id = $1', [id]);
    let rewardMin = 2.0, rewardMax = 8.0, videoTitle = "YouTube Video";

    if (videoQuery.rows.length > 0) {
      const video = videoQuery.rows[0];
      rewardMin = parseFloat(video.reward_min);
      rewardMax = parseFloat(video.reward_max);
      videoTitle = video.title;
    } else {
      const youtubeVideo = await getVideoDetails(id);
      if (youtubeVideo) {
        rewardMin = youtubeVideo.rewardMin;
        rewardMax = youtubeVideo.rewardMax;
        videoTitle = youtubeVideo.title;
      }
    }

    const reward = roundToTwoDecimals(Math.random() * (rewardMax - rewardMin) + rewardMin);
    const newBalance = roundToTwoDecimals(parseFloat(user.balance) + reward);

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
    await addVote(email, vote); // A função addVote agora só insere o voto

    const transaction = {
      id: generateId(),
      type: "credit" as const,
      amount: reward,
      description: `Video vote reward - ${videoTitle}`,
      status: "completed" as const,
      createdAt: new Date().toISOString(),
    };
    await addTransaction(email, transaction); // addTransaction agora só insere a transação

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
