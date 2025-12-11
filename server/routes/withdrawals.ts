import { RequestHandler } from "express";
import { WITHDRAWAL_COOLDOWN_DAYS, roundToTwoDecimals } from "../constants";
import {
  getUserByEmail,
  updateUserProfile,
  addWithdrawal,
  addTransaction,
  generateId,
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

    if (!amount || !method) {
      res.status(400).json({ error: "Amount and method are required" });
      return;
    }

    const userData = await getUserByEmail(email);

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userData.profile;

    // Check withdrawal eligibility
    if (!user.firstEarnAt) {
      res.status(400).json({ error: "You have not earned any money yet" });
      return;
    }

    const firstEarnDate = new Date(user.firstEarnAt);
    const daysPassed = Math.floor(
      (Date.now() - firstEarnDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysPassed < WITHDRAWAL_COOLDOWN_DAYS) {
      const daysRemaining = WITHDRAWAL_COOLDOWN_DAYS - daysPassed;
      res.status(400).json({
        error: `You can withdraw in ${daysRemaining} day(s)`,
      });
      return;
    }

    // Check if user has a pending withdrawal
    const pendingWithdrawal = userData.withdrawals.find(
      (w) => w.status === "pending" || w.status === "cancelled",
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

    // Reverte o saldo (o débito não foi feito ainda, mas o status é 'pending' no user-db)
    // Como o débito só é feito no final, não precisamos reverter o saldo aqui.
    // A transação de débito só será criada após o pagamento da taxa.

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

    if (!withdrawal || withdrawal.status !== "pending") {
      res.status(400).json({ error: "Invalid or non-pending withdrawal ID" });
      return;
    }

    // 1. Zerar o saldo do usuário
    const user = userData.profile;
    const amountToWithdraw = withdrawal.amount;

    // 2. Criar transação de débito (saque)
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

    // 3. Atualizar status do saque para completed
    withdrawal.status = "completed";
    withdrawal.completedAt = new Date().toISOString();

    await updateWithdrawal(email, withdrawal);

    // 4. Zerar o saldo do usuário (a transação já fez o débito, mas o saldo deve ser 0)
    // O addTransaction já atualiza o saldo, mas vamos garantir que o saldo final seja 0
    // O addTransaction já faz o Math.max(0, balance - amount), então o saldo deve estar correto.
    // Se o saque for do saldo total, o saldo final será 0.

    res.json({ success: true, withdrawalId });
  } catch (error) {
    console.error("Simulate fee payment error:", error);
    res.status(500).json({ error: "Failed to simulate fee payment" });
  }
};
