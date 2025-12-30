import { RequestHandler } from "express";
import { roundToTwoDecimals } from "../constants";
import { executeQuery } from "../db-postgres";
import {
  getUserByEmail,
  addWithdrawal,
  addTransaction,
  generateId,
  updateWithdrawal,
  updateUserProfile,
} from "../user-db";

function getEmailFromToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(
      token.replace("Bearer ", ""),
      "base64",
    ).toString();
    return decoded;
  } catch {
    return null;
  }
}

export const handleCreateWithdrawal: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const email = getEmailFromToken(token);

    if (!email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { amount } = req.body;

    if (!amount) {
      res.status(400).json({ error: "Amount is required" });
      return;
    }

    const userData = await getUserByEmail(email);

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userData.profile;

    // REGRA DE NEGÓCIO: Exigir 20 dias consecutivos de votação
    const REQUIRED_STREAK = 20;
    if (user.votingStreak < REQUIRED_STREAK) {
      res.status(400).json({
        error: `Você precisa de ${REQUIRED_STREAK} dias consecutivos de votação para sacar. Atual: ${user.votingStreak} dias.`,
      });
      return;
    }

    // Check if user has a pending withdrawal
    // Only "pending" status should block new withdrawals
    // Cancelled, completed, and rejected withdrawals should not block
    const pendingWithdrawal = userData.withdrawals.find(
      (w) => w.status === "pending"
    );

    if (pendingWithdrawal) {
      res.status(400).json({ error: "You already have a pending withdrawal" });
      return;
    }

    // Validate amount
    const withdrawAmount = roundToTwoDecimals(parseFloat(amount));
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      res.status(400).json({ error: "Invalid withdrawal amount" });
      return;
    }

    // REGRA DE NEGÓCIO: Saque mínimo de $150
    const MINIMUM_WITHDRAWAL_AMOUNT = 150.00;
    if (withdrawAmount < MINIMUM_WITHDRAWAL_AMOUNT) {
      res.status(400).json({ error: `O valor mínimo para saque é de $${MINIMUM_WITHDRAWAL_AMOUNT.toFixed(2)}` });
      return;
    }

    if (withdrawAmount > user.balance) {
      res.status(400).json({ error: "Insufficient balance" });
      return;
    }

    // Create withdrawal request
    const withdrawalId = generateId();
    const now = new Date().toISOString();

    const withdrawal = {
      id: withdrawalId,
      amount: withdrawAmount,
      status: "pending" as const,
      requestedAt: now,
    };

    await addWithdrawal(email, withdrawal);

    // Retorna apenas o ID do saque para o frontend continuar o fluxo
    res.json({ withdrawalId: withdrawalId });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ error: "Failed to process withdrawal request" });
  }
};

export const handleGetWithdrawals: RequestHandler = async (req, res) => {
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

    const withdrawals = userData.withdrawals.sort(
      (a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    );

    res.json(withdrawals);
  } catch (error) {
    console.error("Withdrawals error:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
};

export const handleAddBankDetails: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const email = getEmailFromToken(token);

    if (!email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { withdrawalId, holderName, routingNumber, accountNumber, bankName } =
      req.body;

    if (
      !withdrawalId ||
      !holderName ||
      !routingNumber ||
      !accountNumber ||
      !bankName
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const userData = await getUserByEmail(email);

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const withdrawal = userData.withdrawals.find((w) => w.id === withdrawalId);

    if (!withdrawal || withdrawal.status !== "pending") {
      res.status(400).json({ error: "Invalid or non-pending withdrawal ID" });
      return;
    }

    // Update withdrawal with bank details
    withdrawal.bankDetails = {
      holderName,
      routingNumber,
      accountNumber,
      bankName,
    };

    // Save updated withdrawal (this function needs to be implemented in user-db.ts)
    await updateWithdrawal(email, withdrawal);

    res.json({ success: true, withdrawalId });
  } catch (error) {
    console.error("Add bank details error:", error);
    res.status(500).json({ error: "Failed to add bank details" });
  }
};

export const handleCancelWithdrawal: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const email = getEmailFromToken(token);

    if (!email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { withdrawalId } = req.body;

    if (!withdrawalId) {
      res.status(400).json({ error: "Missing withdrawal ID" });
      return;
    }

    const userData = await getUserByEmail(email);

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const withdrawal = userData.withdrawals.find((w) => w.id === withdrawalId);

    if (!withdrawal || withdrawal.status !== "pending") {
      res.status(400).json({ error: "Invalid or non-pending withdrawal ID" });
      return;
    }

    // Update withdrawal status to cancelled
    withdrawal.status = "cancelled";
    withdrawal.completedAt = new Date().toISOString();

    // Save updated withdrawal (this function needs to be implemented in user-db.ts)
    await updateWithdrawal(email, withdrawal);

    res.json({ success: true, withdrawalId });
  } catch (error) {
    console.error("Cancel withdrawal error:", error);
    res.status(500).json({ error: "Failed to cancel withdrawal" });
  }
};

export const handleSimulateFeePayment: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const email = getEmailFromToken(token);

    if (!email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { withdrawalId } = req.body;

    if (!withdrawalId) {
      res.status(400).json({ error: "Missing withdrawal ID" });
      return;
    }

    const userData = await getUserByEmail(email);

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const withdrawal = userData.withdrawals.find((w) => w.id === withdrawalId);

    if (!withdrawal || (withdrawal.status !== "pending" && withdrawal.status !== "completed")) {
      res.status(400).json({ error: "Invalid withdrawal ID" });
      return;
    }

    // 1. Verificar saldo atual
    const user = userData.profile;
    const amountToWithdraw = withdrawal.amount;
    console.log(`[handleSimulateFeePayment] Saldo antes: ${user.balance}, Valor do saque: ${amountToWithdraw}`);

    // 2. Descontar o saldo diretamente no banco de dados
    const newBalance = roundToTwoDecimals(Math.max(0, user.balance - amountToWithdraw));
    
    await executeQuery(
      "UPDATE users SET balance = $1 WHERE id = $2",
      [newBalance, user.id]
    );
    
    console.log(`[handleSimulateFeePayment] Saldo após desconto: ${newBalance}`);

    // 3. Criar transação de débito (saque)
    const transactionId = generateId();
    const transaction = {
      id: transactionId,
      type: "debit" as const,
      amount: amountToWithdraw,
      description: `Withdrawal processed (Fee Paid)`,
      status: "completed" as const,
      createdAt: new Date().toISOString(),
    };

    await addTransaction(email, transaction);

    // 4. Atualizar status do saque para completed
    withdrawal.status = "completed";
    withdrawal.completedAt = new Date().toISOString();

    await updateWithdrawal(email, withdrawal);

    // 5. REGRA DE NEGÓCIO: Resetar o votingStreak após o saque
    // Isso força o usuário a iniciar um novo ciclo de 20 dias para o próximo saque
    const updatedUserData = await getUserByEmail(email);
    if (updatedUserData) {
      updatedUserData.profile.votingStreak = 0;
      updatedUserData.profile.votingDaysCount = 0;
      await updateUserProfile(email, updatedUserData.profile);
      console.log(`[handleSimulateFeePayment] Voting streak reset to 0 for user ${email}`);
    }

    res.json({ success: true, withdrawalId });
  } catch (error) {
    console.error("Simulate fee payment error:", error);
    res.status(500).json({ error: "Failed to simulate fee payment" });
  }
};
