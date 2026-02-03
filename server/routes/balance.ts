import { RequestHandler } from "express";
import { getUserByEmail, getPendingWithdrawal, checkAndResetBalanceIfInactive } from "../user-db";
// Saque mínimo de $3500 - não há mais exigência de dias consecutivos
const MINIMUM_WITHDRAWAL_AMOUNT = 3500.00;
import { BalanceInfo } from "@shared/api";

function getEmailFromToken(token: string | undefined): string | null {
  if (!token) {
    console.warn("[Balance] No authorization token provided");
    return null;
  }

  try {
    console.log("[Balance] Raw token:", token.substring(0, 50) + "...");

    // Remove "Bearer " prefix if present
    let tokenValue = token;
    if (token.startsWith("Bearer ")) {
      tokenValue = token.slice(7);
    }

    console.log("[Balance] Token value:", tokenValue.substring(0, 30) + "...");

    // Decode from base64
    const email = Buffer.from(tokenValue, "base64").toString("utf-8").trim();

    if (!email || email.length === 0) {
      console.warn("[Balance] Email is empty after decoding");
      return null;
    }

    console.log("[Balance] Extracted email from token:", email);
    return email;
  } catch (err) {
    console.error("[Balance] Error decoding token:", err);
    return null;
  }
}

export const handleGetBalance: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const email = getEmailFromToken(token);

    if (!email) {
      console.warn("No valid token in authorization header");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // ===== CORREÇÃO: Verificar e resetar saldo se usuário estiver inativo =====
    const wasReset = await checkAndResetBalanceIfInactive(email);
    if (wasReset) {
      console.log(`[Balance] Balance was reset for inactive user: ${email}`);
    }
    // ===== FIM DA CORREÇÃO =====

    const userData = await getUserByEmail(email);

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userData.profile;
    
    // Elegibilidade baseada apenas no saldo mínimo de $3500
    const withdrawalEligible = user.balance >= MINIMUM_WITHDRAWAL_AMOUNT;
    const amountUntilWithdrawal = Math.max(0, MINIMUM_WITHDRAWAL_AMOUNT - user.balance);

    // Get pending withdrawal if any
    const pendingWithdrawal = await getPendingWithdrawal(email);

    const response: BalanceInfo = {
      user,
      daysUntilWithdrawal: 0, // Deprecated - mantido para compatibilidade
      amountUntilWithdrawal,
      withdrawalEligible,
      pendingWithdrawal: pendingWithdrawal || null,
    };

    res.json(response);
  } catch (error) {
    console.error("Balance error:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
};

export const handleGetTransactions: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const email = getEmailFromToken(token);

    if (!email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userData = await getUserByEmail(email);

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const transactions = userData.transactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    res.json(transactions);
  } catch (error) {
    console.error("Transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};
