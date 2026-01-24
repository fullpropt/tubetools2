import { RequestHandler } from "express";
import { SignupRequest, LoginRequest, AuthResponse, ChangePasswordRequest, DeleteAccountRequest } from "@shared/api";
import { createUser, getUserByEmail, getUserByEmailWithPassword, generateId } from "../user-db";
import { hashPassword, comparePassword, validatePasswordStrength } from "../password-utils";
import { SYSTEM_STARTING_BALANCE } from "../constants";

// ===== WEBHOOK PARA NOVO CADASTRO =====
async function notifyNewSignup(email: string, name: string) {
  try {
    // Endpoint tRPC para webhook de novo cadastro
    const webhookUrl = "https://leads-email-dashboard-production.up.railway.app/api/trpc/webhooks.newSignup?batch=1";
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "0": {
          json: {
            name: name,
            email: email,
          }
        }
      }),
    });
    
    if (response.ok) {
      const responseData = await response.json();
      console.log(`[Webhook] Novo cadastro notificado com sucesso: ${email}`);
      console.log(`[Webhook] Resposta:`, JSON.stringify(responseData));
    } else {
      const errorText = await response.text();
      console.error(`[Webhook] Falha ao notificar novo cadastro: ${response.status}`);
      console.error(`[Webhook] Erro:`, errorText);
    }
  } catch (error) {
    console.error("[Webhook] Erro ao notificar novo cadastro:", error);
    // Não interrompe o fluxo de cadastro se o webhook falhar
  }
}

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    console.log("Signup request received with body:", JSON.stringify(req.body));

    const { name, email, password } = req.body as SignupRequest;

    // Validate input
    if (!name || typeof name !== "string" || !name.trim()) {
      console.warn("Invalid name in signup:", { name });
      res.status(400).json({ error: "Valid name is required" });
      return;
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      console.warn("Invalid email in signup:", { email });
      res.status(400).json({ error: "Valid email is required" });
      return;
    }

    if (!password || typeof password !== "string") {
      console.warn("Invalid password in signup");
      res.status(400).json({ error: "Valid password is required" });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({ 
        error: "Password does not meet requirements",
        details: passwordValidation.errors 
      });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await getUserByEmail(trimmedEmail);
    if (existingUser) {
      console.warn(`Email already registered: ${trimmedEmail}`);
      res
        .status(400)
        .json({ error: "Email already registered. Please use login instead." });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const userId = generateId();
    console.log(`Creating user: ${userId} with email: ${trimmedEmail}`);
    const userData = await createUser(
      userId,
      name.trim(),
      trimmedEmail,
      SYSTEM_STARTING_BALANCE,
      passwordHash,
    );

    console.log(`User created successfully: ${userId} (${trimmedEmail})`);

    // ===== NOTIFICAR SISTEMA DE EMAIL MARKETING =====
    // Envia webhook para o leads-email-dashboard
    await notifyNewSignup(trimmedEmail, name.trim());

    const token = Buffer.from(`${trimmedEmail}`).toString("base64");

    const response: AuthResponse = {
      user: userData.profile,
      token,
    };

    console.log("Sending signup response for user:", userId);
    res.json(response);
  } catch (error) {
    console.error("Signup error details:", error);
    console.error("Error stack:", (error as Error).stack);
    res.status(500).json({ error: "Signup failed - please try again" });
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || typeof email !== "string" || !email.trim()) {
      console.warn("Invalid email in login");
      res.status(400).json({ error: "Valid email is required" });
      return;
    }

    if (!password || typeof password !== "string") {
      console.warn("Invalid password in login");
      res.status(400).json({ error: "Valid password is required" });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log("Login attempt with email:", trimmedEmail);

    const userWithPassword = await getUserByEmailWithPassword(trimmedEmail);

    if (!userWithPassword) {
      console.warn(`User not found: ${trimmedEmail}`);
      res.status(404).json({ error: "User not found. Please sign up first." });
      return;
    }

    const { user: userData, passwordHash } = userWithPassword;

    // Verify password
    if (!passwordHash) {
      console.warn(`User ${trimmedEmail} has no password set`);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const passwordMatch = await comparePassword(password, passwordHash);
    if (!passwordMatch) {
      console.warn(`Invalid password for user: ${trimmedEmail}`);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = Buffer.from(`${trimmedEmail}`).toString("base64");

    const response: AuthResponse = {
      user: userData.profile,
      token,
    };

    console.log("Login successful for user:", trimmedEmail);
    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed - please try again" });
  }
};

export const handleChangePassword: RequestHandler = async (req, res) => {
  try {
    console.log("[handleChangePassword] Starting password change request");
    
    const token = req.headers.authorization;
    console.log("[handleChangePassword] Token present:", !!token);
    
    const email = token ? Buffer.from(token.replace("Bearer ", ""), "base64").toString() : null;
    console.log("[handleChangePassword] Email extracted:", email);

    if (!email) {
      console.warn("[handleChangePassword] No email found in token");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { currentPassword, newPassword } = req.body as ChangePasswordRequest;

    if (!currentPassword || typeof currentPassword !== "string") {
      console.warn("[handleChangePassword] Current password missing or invalid");
      res.status(400).json({ error: "Current password is required" });
      return;
    }

    if (!newPassword || typeof newPassword !== "string") {
      console.warn("[handleChangePassword] New password missing or invalid");
      res.status(400).json({ error: "New password is required" });
      return;
    }

    // Validate new password strength
    console.log("[handleChangePassword] Validating new password strength");
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      console.warn("[handleChangePassword] Password validation failed:", passwordValidation.errors);
      res.status(400).json({ 
        error: "New password does not meet requirements",
        details: passwordValidation.errors 
      });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log("[handleChangePassword] Fetching user by email:", trimmedEmail);
    
    const userWithPassword = await getUserByEmailWithPassword(trimmedEmail);

    if (!userWithPassword) {
      console.warn("[handleChangePassword] User not found:", trimmedEmail);
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { user: userData, passwordHash } = userWithPassword;
    console.log("[handleChangePassword] User found, password hash present:", !!passwordHash);

    // Verify current password
    if (!passwordHash) {
      console.warn("[handleChangePassword] User has no password hash set");
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    console.log("[handleChangePassword] Comparing passwords");
    const passwordMatch = await comparePassword(currentPassword, passwordHash);
    if (!passwordMatch) {
      console.warn("[handleChangePassword] Password comparison failed");
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    console.log("[handleChangePassword] Current password verified, hashing new password");
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    console.log("[handleChangePassword] New password hashed successfully");

    // Update password in database
    console.log("[handleChangePassword] Updating password in database");
    const { executeQuery } = await import("../db-postgres");
    const result = await executeQuery(
      "UPDATE users SET password_hash = $1 WHERE email = $2",
      [newPasswordHash, trimmedEmail]
    );
    console.log("[handleChangePassword] Database update result:", result);

    console.log(`[handleChangePassword] Password changed successfully for user: ${trimmedEmail}`);
    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("[handleChangePassword] Unexpected error:", error);
    console.error("[handleChangePassword] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("[handleChangePassword] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[handleChangePassword] Error stack:", error instanceof Error ? error.stack : "N/A");
    
    // Make sure we always return JSON
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to change password", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
};


// ===== INTERFACE PARA UPDATE NAME =====
interface UpdateNameRequest {
  name: string;
}

// ===== EXCLUSÃO DE CONTA =====
export const handleDeleteAccount: RequestHandler = async (req, res) => {
  try {
    console.log("[handleDeleteAccount] Starting account deletion request");
    
    const token = req.headers.authorization;
    console.log("[handleDeleteAccount] Token present:", !!token);
    
    const email = token ? Buffer.from(token.replace("Bearer ", ""), "base64").toString() : null;
    console.log("[handleDeleteAccount] Email extracted:", email);

    if (!email) {
      console.warn("[handleDeleteAccount] No email found in token");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { password, confirmation } = req.body as DeleteAccountRequest;

    // Validate confirmation text
    if (!confirmation || confirmation !== "DELETE") {
      console.warn("[handleDeleteAccount] Invalid confirmation text");
      res.status(400).json({ error: "Please type DELETE to confirm account deletion" });
      return;
    }

    if (!password || typeof password !== "string") {
      console.warn("[handleDeleteAccount] Password missing or invalid");
      res.status(400).json({ error: "Password is required" });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log("[handleDeleteAccount] Fetching user by email:", trimmedEmail);
    
    const userWithPassword = await getUserByEmailWithPassword(trimmedEmail);

    if (!userWithPassword) {
      console.warn("[handleDeleteAccount] User not found:", trimmedEmail);
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { user: userData, passwordHash } = userWithPassword;
    console.log("[handleDeleteAccount] User found, password hash present:", !!passwordHash);

    // Verify password
    if (!passwordHash) {
      console.warn("[handleDeleteAccount] User has no password hash set");
      res.status(401).json({ error: "Password is incorrect" });
      return;
    }

    console.log("[handleDeleteAccount] Comparing passwords");
    const passwordMatch = await comparePassword(password, passwordHash);
    if (!passwordMatch) {
      console.warn("[handleDeleteAccount] Password comparison failed");
      res.status(401).json({ error: "Password is incorrect" });
      return;
    }

    console.log("[handleDeleteAccount] Password verified, proceeding with account deletion");
    
    // Delete user data from database
    // Order matters due to foreign key constraints
    const { executeQuery } = await import("../db-postgres");
    
    // 1. Delete votes
    console.log("[handleDeleteAccount] Deleting votes...");
    await executeQuery("DELETE FROM votes WHERE user_id = $1", [userData.profile.id]);
    
    // 2. Delete transactions
    console.log("[handleDeleteAccount] Deleting transactions...");
    await executeQuery("DELETE FROM transactions WHERE user_id = $1", [userData.profile.id]);
    
    // 3. Delete withdrawals
    console.log("[handleDeleteAccount] Deleting withdrawals...");
    await executeQuery("DELETE FROM withdrawals WHERE user_id = $1", [userData.profile.id]);
    
    // 4. Delete user
    console.log("[handleDeleteAccount] Deleting user...");
    await executeQuery("DELETE FROM users WHERE id = $1", [userData.profile.id]);

    console.log(`[handleDeleteAccount] Account deleted successfully for user: ${trimmedEmail}`);
    res.status(200).json({ 
      success: true, 
      message: "Your account has been permanently deleted" 
    });
  } catch (error) {
    console.error("[handleDeleteAccount] Unexpected error:", error);
    console.error("[handleDeleteAccount] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("[handleDeleteAccount] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[handleDeleteAccount] Error stack:", error instanceof Error ? error.stack : "N/A");
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to delete account", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
};

export const handleUpdateName: RequestHandler = async (req, res) => {
  try {
    console.log("[handleUpdateName] Starting name update request");
    
    const token = req.headers.authorization;
    console.log("[handleUpdateName] Token present:", !!token);
    
    const email = token ? Buffer.from(token.replace("Bearer ", ""), "base64").toString() : null;
    console.log("[handleUpdateName] Email extracted:", email);

    if (!email) {
      console.warn("[handleUpdateName] No email found in token");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name } = req.body as UpdateNameRequest;

    // Validate name
    if (!name || typeof name !== "string") {
      console.warn("[handleUpdateName] Name missing or invalid");
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      console.warn("[handleUpdateName] Name too short");
      res.status(400).json({ error: "Name must be at least 2 characters" });
      return;
    }

    if (trimmedName.length > 50) {
      console.warn("[handleUpdateName] Name too long");
      res.status(400).json({ error: "Name must be less than 50 characters" });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log("[handleUpdateName] Fetching user by email:", trimmedEmail);
    
    const userData = await getUserByEmail(trimmedEmail);

    if (!userData) {
      console.warn("[handleUpdateName] User not found:", trimmedEmail);
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Update name in database
    console.log("[handleUpdateName] Updating name in database");
    const { executeQuery } = await import("../db-postgres");
    const result = await executeQuery(
      "UPDATE users SET name = $1, updated_at = NOW() WHERE email = $2",
      [trimmedName, trimmedEmail]
    );
    console.log("[handleUpdateName] Database update result:", result);

    console.log(`[handleUpdateName] Name changed successfully for user: ${trimmedEmail}`);
    res.status(200).json({ 
      success: true, 
      message: "Name updated successfully",
      name: trimmedName
    });
  } catch (error) {
    console.error("[handleUpdateName] Unexpected error:", error);
    console.error("[handleUpdateName] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("[handleUpdateName] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[handleUpdateName] Error stack:", error instanceof Error ? error.stack : "N/A");
    
    // Make sure we always return JSON
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to update name", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
};