import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSignup, handleLogin, handleChangePassword, handleUpdateName, handleDeleteAccount } from "./routes/auth";
import { handleForgotPassword, handleResetPassword } from "./routes/password-reset";
import {
  handleGetVideos,
  handleGetVideo,
  handleVote,
  handleGetDailyVotes,
} from "./routes/videos";
import { handleGetBalance, handleGetTransactions } from "./routes/balance";
import {
  handleCreateWithdrawal,
  handleGetWithdrawals,
  handleCancelWithdrawal,
  handleSimulateFeePayment,
  handleAddBankDetails,
} from "./routes/withdrawals";
import { seedVideos } from "./db-postgres";

// Initialize database on startup
seedVideos().catch((err) => {
  console.error("Failed to seed videos:", err);
});

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Disable compression to avoid stream reading issues
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // Example API routes
  app.get(["/ping", "/api/ping"], (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get(["/demo", "/api/demo"], handleDemo);

  // Auth routes
  app.post(["/auth/signup", "/api/auth/signup"], handleSignup);
  app.post(["/auth/login", "/api/auth/login"], handleLogin);
  app.post(["/auth/change-password", "/api/auth/change-password"], handleChangePassword);
  app.post(["/auth/update-name", "/api/auth/update-name"], handleUpdateName);
  app.post(["/auth/forgot-password", "/api/auth/forgot-password"], handleForgotPassword);
  app.post(["/auth/delete-account", "/api/auth/delete-account"], handleDeleteAccount);
  app.post(["/auth/reset-password", "/api/auth/reset-password"], handleResetPassword);

  // Video routes
  app.get(["/videos", "/api/videos"], handleGetVideos);
  app.get(["/videos/:id", "/api/videos/:id"], handleGetVideo);
  app.post(["/videos/:id/vote", "/api/videos/:id/vote"], handleVote);
  app.get(["/daily-votes", "/api/daily-votes"], handleGetDailyVotes);

  // Balance and transaction routes
  app.get(["/balance", "/api/balance"], handleGetBalance);
  app.get(["/transactions", "/api/transactions"], handleGetTransactions);

  // Withdrawal routes
  app.post(["/withdrawals", "/api/withdrawals"], handleCreateWithdrawal);
  app.get(["/withdrawals", "/api/withdrawals"], handleGetWithdrawals);
  app.post(["/withdrawals/bank-details", "/api/withdrawals/bank-details"], handleAddBankDetails);
  app.post(["/withdrawals/cancel", "/api/withdrawals/cancel"], handleCancelWithdrawal);
  app.post(["/withdrawals/simulate-fee-payment", "/api/withdrawals/simulate-fee-payment"], handleSimulateFeePayment);

  return app;
}
