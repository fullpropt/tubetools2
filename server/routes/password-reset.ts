import { RequestHandler } from "express";
import { 
  ForgotPasswordRequest, 
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse 
} from "@shared/api";
import { 
  getUserByEmail, 
  setPasswordResetToken, 
  getUserByResetToken,
  clearPasswordResetToken,
  updatePasswordByEmail
} from "../user-db";
import { generateResetToken, hashPassword, validatePasswordStrength } from "../password-utils";

/**
 * Envia email de recuperação de senha via Mail MKT API
 */
async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  try {
    const mailMktUrl = process.env.MAIL_MKT_URL || 'https://leads-email-dashboard-production.up.railway.app';
    const apiUrl = `${mailMktUrl}/api/trpc/passwordReset.sendResetEmail`;

    console.log(`[sendPasswordResetEmail] Sending request to Mail MKT: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        resetToken: resetToken,
        appName: 'TubeTools'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[sendPasswordResetEmail] Mail MKT API error: ${response.status}`);
      console.error(`[sendPasswordResetEmail] Response: ${errorText}`);
      return false;
    }

    const result = await response.json();
    console.log(`[sendPasswordResetEmail] Mail MKT response:`, result);

    return result.result?.data?.success === true;
  } catch (error) {
    console.error('[sendPasswordResetEmail] Error calling Mail MKT API:', error);
    return false;
  }
}

/**
 * Handle forgot password request
 * Generates a reset token and stores it in the database
 * In production, this would send an email with the reset link
 */
export const handleForgotPassword: RequestHandler = async (req, res) => {
  try {
    console.log("[handleForgotPassword] Request received");
    
    const { email } = req.body as ForgotPasswordRequest;

    if (!email || typeof email !== "string" || !email.trim()) {
      console.warn("[handleForgotPassword] Invalid email");
      res.status(400).json({ error: "Valid email is required" });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log("[handleForgotPassword] Processing for email:", trimmedEmail);

    // Check if user exists
    const user = await getUserByEmail(trimmedEmail);
    
    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log("[handleForgotPassword] User not found, but returning success for security");
      const response: ForgotPasswordResponse = {
        success: true,
        message: "If an account with that email exists, a password reset link has been generated."
      };
      res.json(response);
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save token to database
    const tokenSaved = await setPasswordResetToken(trimmedEmail, resetToken, expiresAt);

    if (!tokenSaved) {
      console.error("[handleForgotPassword] Failed to save reset token");
      res.status(500).json({ error: "Failed to process password reset request" });
      return;
    }

    console.log(`[handleForgotPassword] Reset token generated for ${trimmedEmail}`);

    // Enviar email via Mail MKT API
    const emailSent = await sendPasswordResetEmail(trimmedEmail, resetToken);

    if (!emailSent) {
      console.warn(`[handleForgotPassword] Failed to send email to ${trimmedEmail}`);
      // Mesmo assim retornamos sucesso por segurança (não revelar se email existe)
    }

    const response: ForgotPasswordResponse = {
      success: true,
      message: "If an account with that email exists, a password reset link has been sent to your email.",
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined // Apenas em desenvolvimento
    };

    res.json(response);
  } catch (error) {
    console.error("[handleForgotPassword] Unexpected error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};

/**
 * Handle reset password request
 * Validates the token and updates the password
 */
export const handleResetPassword: RequestHandler = async (req, res) => {
  try {
    console.log("[handleResetPassword] Request received");
    
    const { token, newPassword } = req.body as ResetPasswordRequest;

    if (!token || typeof token !== "string") {
      console.warn("[handleResetPassword] Invalid token");
      res.status(400).json({ error: "Valid reset token is required" });
      return;
    }

    if (!newPassword || typeof newPassword !== "string") {
      console.warn("[handleResetPassword] Invalid password");
      res.status(400).json({ error: "Valid new password is required" });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      console.warn("[handleResetPassword] Password validation failed");
      res.status(400).json({ 
        error: "New password does not meet requirements",
        details: passwordValidation.errors 
      });
      return;
    }

    // Get user by reset token
    const userInfo = await getUserByResetToken(token);

    if (!userInfo) {
      console.warn("[handleResetPassword] Invalid or expired token");
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    console.log(`[handleResetPassword] Valid token for user: ${userInfo.email}`);

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    const passwordUpdated = await updatePasswordByEmail(userInfo.email, newPasswordHash);

    if (!passwordUpdated) {
      console.error("[handleResetPassword] Failed to update password");
      res.status(500).json({ error: "Failed to reset password" });
      return;
    }

    // Clear reset token
    await clearPasswordResetToken(userInfo.email);

    console.log(`[handleResetPassword] Password reset successful for ${userInfo.email}`);

    const response: ResetPasswordResponse = {
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password."
    };

    res.json(response);
  } catch (error) {
    console.error("[handleResetPassword] Unexpected error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
