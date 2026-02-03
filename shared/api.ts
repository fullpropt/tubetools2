/**
 * Shared code between client and server
 * Useful to share types between client and server
 */

// Auth
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserData;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string; // For development/testing without email
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Delete Account
export interface DeleteAccountRequest {
  password: string;
  confirmation: string; // User must type "DELETE" to confirm
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

// User
export interface UserData {
  id: string;
  name: string;
  email: string;
  balance: number;
  createdAt: string;
  firstEarnAt: string | null;
  votingStreak?: number;
  lastVotedAt?: string;
  lastVoteDateReset?: string;
  votingDaysCount?: number;
}

// Videos
export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  rewardMin: number;
  rewardMax: number;
  createdAt: string;
  duration?: number;
}

export interface Vote {
  id: string;
  userId: string;
  videoId: string;
  voteType: "like" | "dislike";
  rewardAmount: number;
  createdAt: string;
}

// Transactions
export interface Transaction {
  id: string;
  userId: string;
  type: "credit" | "debit" | "withdrawal" | "withdrawal_reversal";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

// Bank Details for Withdrawals
export interface BankDetails {
  holderName: string;
  routingNumber: string;
  accountNumber: string;
  bankName: string;
}

// Withdrawals - CORRIGIDO COM TODOS OS CAMPOS NECESSÁRIOS
export interface Withdrawal {
  id: string;
  userId?: string;
  amount: number;
  method?: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  requestedAt: string;
  processedAt?: string | null;
  completedAt?: string;
  bankDetails?: BankDetails;
}

// Balance info
export interface BalanceInfo {
  user: UserData;
  daysUntilWithdrawal: number; // Deprecated - mantido para compatibilidade
  amountUntilWithdrawal?: number; // Valor restante para atingir $3500
  withdrawalEligible: boolean;
  pendingWithdrawal: Withdrawal | null;
}

// Voting response
export interface VoteResponse {
  vote: Vote;
  newBalance: number;
  dailyVotesRemaining?: number;
  rewardAmount?: number;
  votingStreak?: number;
  totalVideosWatched?: number;
  votingDaysCount?: number;
}
