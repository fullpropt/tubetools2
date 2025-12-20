import { executeQuery, executeSingleQuery } from "./db-postgres";
import { v4 as uuidv4 } from "uuid";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  balance: number;
  createdAt: string;
  firstEarnAt: string | null;
  votingStreak: number;
  lastVotedAt: string | null;
  lastVoteDateReset: string | null;
  votingDaysCount: number;
}

export interface Vote {
  id: string;
  userId: string;
  videoId: string;
  voteType: "like" | "dislike";
  rewardAmount: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "completed" | "pending";
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  status: "pending" | "completed" | "rejected" | "cancelled";
  requestedAt: string;
  completedAt?: string;
  bankDetails?: {
    holderName: string;
    routingNumber: string;
    accountNumber: string;
    bankName: string;
  };
}

export interface UserData {
  profile: UserProfile;
  votes: Vote[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  dailyVoteCount: { count: number; date: string };
}

export async function loadUserData(email: string): Promise<UserData | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("[loadUserData] Attempting to load user:", normalizedEmail);

    const user = await executeSingleQuery(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail],
    );

    if (!user) {
      console.log("[loadUserData] No user found with email:", normalizedEmail);
      return null;
    }

    console.log("[loadUserData] User found:", user.email, "ID:", user.id);

    const votes = await executeQuery(
      `SELECT id, video_id as "videoId", vote_type as "voteType", reward_amount as "rewardAmount", created_at as "createdAt"
       FROM votes WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id],
    );

    const transactions = await executeQuery(
      `SELECT id, type, amount, description, status, created_at as "createdAt"
       FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id],
    );

    const withdrawals = await executeQuery(
      `SELECT id, amount, status, requested_at as "requestedAt", processed_at as "completedAt", bank_details as "bankDetails"
       FROM withdrawals WHERE user_id = $1 ORDER BY requested_at DESC`,
      [user.id],
    );

    // Process bank_details - PostgreSQL JSONB já retorna como objeto
    const processedWithdrawals = withdrawals.rows.map((w: any) => {
      // JSONB no PostgreSQL já é retornado como objeto, não precisa de parse
      if (w.bankDetails && typeof w.bankDetails === 'string') {
        try {
          w.bankDetails = JSON.parse(w.bankDetails);
        } catch (e) {
          console.error('Failed to parse bank_details:', e);
          w.bankDetails = null;
        }
      }
      return w;
    });

    const today = new Date().toISOString().split("T")[0];
    const votesToday = votes.rows.filter((v: any) => {
      const createdAtStr =
        typeof v.createdAt === "string"
          ? v.createdAt
          : new Date(v.createdAt).toISOString();
      return createdAtStr.split("T")[0] === today;
    }).length;

    const profile: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: parseFloat(user.balance),
      createdAt: user.created_at,
      firstEarnAt: user.first_earn_at,
      votingStreak: user.voting_streak || 0,
      lastVotedAt: user.last_voted_at,
      lastVoteDateReset: user.last_vote_date_reset,
      votingDaysCount: user.voting_days_count || 0,
    };

    return {
      profile,
      votes: votes.rows,
      transactions: transactions.rows,
      withdrawals: processedWithdrawals,
      dailyVoteCount: { count: votesToday, date: today },
    };
  } catch (err) {
    console.error(`Could not load user data for ${email}:`, err);
    return null;
  }
}

export async function saveUserData(
  email: string,
  userData: UserData,
): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    await executeQuery(
      `UPDATE users 
       SET name = $1, balance = $2, voting_streak = $3, voting_days_count = $4, 
           last_voted_at = $5, last_vote_date_reset = $6, first_earn_at = $7, updated_at = NOW()
       WHERE email = $8`,
      [
        userData.profile.name,
        userData.profile.balance,
        userData.profile.votingStreak,
        userData.profile.votingDaysCount,
        userData.profile.lastVotedAt,
        userData.profile.lastVoteDateReset,
        userData.profile.firstEarnAt,
        normalizedEmail,
      ],
    );
    
    console.log(`[saveUserData] Updated balance for ${normalizedEmail}: ${userData.profile.balance}`);

    return true;
  } catch (err) {
    console.error(`Could not save user data for ${email}:`, err);
    return false;
  }
}

export async function createUser(
  id: string,
  name: string,
  email: string,
  initialBalance: number = 213.19,
): Promise<UserData> {
  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date().toISOString();

  try {
    await executeQuery(
      `INSERT INTO users (id, email, name, balance, created_at, voting_streak, voting_days_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, normalizedEmail, name.trim(), initialBalance, now, 0, 0],
    );

    const profile: UserProfile = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      balance: initialBalance,
      createdAt: now,
      firstEarnAt: null,
      votingStreak: 0,
      lastVotedAt: null,
      lastVoteDateReset: null,
      votingDaysCount: 0,
    };

    return {
      profile,
      votes: [],
      transactions: [],
      withdrawals: [],
      dailyVoteCount: {
        count: 0,
        date: new Date().toISOString().split("T")[0],
      },
    };
  } catch (err) {
    console.error("Could not create user:", err);
    throw err;
  }
}

export async function getUserByEmail(email: string): Promise<UserData | null> {
  return loadUserData(email);
}

export async function updateUserProfile(
  email: string,
  profile: UserProfile,
): Promise<UserData | null> {
  const userData = await loadUserData(email);
  if (!userData) {
    return null;
  }

  userData.profile = profile;
  const saved = await saveUserData(email, userData);
  return saved ? userData : null;
}

export async function addVote(
  email: string,
  vote: Vote,
): Promise<UserData | null> {
  try {
    const userData = await loadUserData(email);
    if (!userData) {
      return null;
    }

    await executeQuery(
      `INSERT INTO votes (id, user_id, video_id, vote_type, reward_amount, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        vote.id,
        userData.profile.id,
        vote.videoId,
        vote.voteType,
        vote.rewardAmount,
        vote.createdAt,
      ],
    );

    userData.profile.lastVotedAt = vote.createdAt;
    await saveUserData(email, userData);

    return await loadUserData(email);
  } catch (err) {
    console.error("Could not add vote:", err);
    return null;
  }
}

export async function addTransaction(
  email: string,
  transaction: Transaction,
): Promise<UserData | null> {
  try {
    const userData = await loadUserData(email);
    if (!userData) {
      return null;
    }

    await executeQuery(
      `INSERT INTO transactions (id, user_id, type, amount, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        transaction.id,
        userData.profile.id,
        transaction.type,
        transaction.amount,
        transaction.description,
        transaction.status,
        transaction.createdAt,
      ],
    );

    // NOTE: Balance is updated separately in the vote handler (videos.ts).
    // This function only records the transaction without modifying the balance.
    // This prevents double-crediting or double-debiting of the balance.
    console.log(`[addTransaction] ${transaction.type === "credit" ? "Credit" : "Debit"}: ${transaction.amount}, Transaction recorded`);

    return await loadUserData(email);
  } catch (err) {
    console.error("Could not add transaction:", err);
    return null;
  }
}

export async function addWithdrawal(
  email: string,
  withdrawal: Withdrawal,
): Promise<UserData | null> {
  try {
    const userData = await loadUserData(email);
    if (!userData) {
      return null;
    }

    await executeQuery(
      `INSERT INTO withdrawals (id, user_id, amount, requested_at, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        withdrawal.id,
        userData.profile.id,
        withdrawal.amount,
        withdrawal.requestedAt,
        withdrawal.status,
      ],
    );

    return await loadUserData(email);
  } catch (err) {
    console.error("Could not add withdrawal:", err);
    return null;
  }
}

export async function updateWithdrawal(
  email: string,
  withdrawal: Withdrawal,
): Promise<UserData | null> {
  try {
    const userData = await loadUserData(email);
    if (!userData) {
      return null;
    }

    // PostgreSQL JSONB aceita objeto diretamente, não precisa de stringify
    await executeQuery(
      `UPDATE withdrawals 
       SET amount = $1, status = $2, processed_at = $3, bank_details = $4
       WHERE id = $5 AND user_id = $6`,
      [
        withdrawal.amount,
        withdrawal.status,
        withdrawal.completedAt,
        withdrawal.bankDetails ? JSON.stringify(withdrawal.bankDetails) : null,
        withdrawal.id,
        userData.profile.id,
      ],
    );

    return await loadUserData(email);
  } catch (err) {
    console.error("Could not update withdrawal:", err);
    return null;
  }
}

export async function getDailyVoteCount(email: string): Promise<number> {
  const userData = await loadUserData(email);
  if (!userData) {
    return 0;
  }

  return userData.dailyVoteCount.count;
}

export async function getPendingWithdrawal(
  email: string,
): Promise<Withdrawal | null> {
  const userData = await loadUserData(email);
  if (!userData) {
    return null;
  }

  return userData.withdrawals.find((w) => w.status === "pending") || null;
}


export async function checkAndResetBalanceIfInactive(
  email: string,
): Promise<boolean> {
  try {
    const userData = await loadUserData(email);
    if (!userData) {
      return false;
    }

    const user = userData.profile;
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    
    // Get yesterday's date
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Check if user has votes today
    const votesToday = userData.votes.filter((v: any) => {
      const voteDate =
        typeof v.createdAt === "string"
          ? v.createdAt.split("T")[0]
          : new Date(v.createdAt).toISOString().split("T")[0];
      return voteDate === today;
    }).length;

    // If user has votes today, no need to reset
    if (votesToday > 0) {
      console.log(`[checkAndResetBalanceIfInactive] User ${email} has ${votesToday} votes today, balance preserved`);
      return false;
    }

    // Check if user has votes yesterday
    const votesYesterday = userData.votes.filter((v: any) => {
      const voteDate =
        typeof v.createdAt === "string"
          ? v.createdAt.split("T")[0]
          : new Date(v.createdAt).toISOString().split("T")[0];
      return voteDate === yesterdayStr;
    }).length;

    // If user has no votes today and no votes yesterday, reset balance
    if (votesYesterday === 0 && user.balance > 0) {
      console.log(`[checkAndResetBalanceIfInactive] User ${email} has no votes yesterday, resetting balance from ${user.balance} to 0`);
      
      // Reset balance to 0
      user.balance = 0;
      
      // Reset voting streak
      user.votingStreak = 0;
      
      // Save the updated profile
      await saveUserData(email, userData);
      
      // Add a debit transaction for the reset
      const transactionId = generateId();
      const transaction = {
        id: transactionId,
        type: "debit" as const,
        amount: userData.profile.balance,
        description: "Balance reset due to inactivity (no vote in 24 hours)",
        status: "completed" as const,
        createdAt: now.toISOString(),
      };
      
      await executeQuery(
        `INSERT INTO transactions (id, user_id, type, amount, description, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          transaction.id,
          userData.profile.id,
          transaction.type,
          transaction.amount,
          transaction.description,
          transaction.status,
          transaction.createdAt,
        ],
      );
      
      return true; // Balance was reset
    }

    return false; // No reset needed
  } catch (err) {
    console.error("Error checking and resetting balance:", err);
    return false;
  }
}

export async function getVotedVideoIds(email: string): Promise<string[]> {
  const userData = await loadUserData(email);
  if (!userData) {
    return [];
  }

  return userData.votes.map((v) => v.videoId);
}

export function generateId(): string {
  return uuidv4();
}
