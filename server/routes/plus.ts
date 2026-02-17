import { RequestHandler } from "express";
import { PlusCheckoutResponse, PlusStatusResponse } from "@shared/api";
import { ensurePlusSchema, executeQuery, executeSingleQuery } from "../db-postgres";

function getEmailFromToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token.replace("Bearer ", ""), "base64").toString().trim();
    return decoded || null;
  } catch {
    return null;
  }
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function getPlusState(user: any) {
  const now = Date.now();
  const activeUntil = user?.plus_active_until ? new Date(user.plus_active_until) : null;
  const activeUntilMs = activeUntil?.getTime() || 0;
  const active = activeUntilMs > now;
  const rawMultiplier = parseFloat(user?.plus_multiplier);
  const multiplier = Number.isFinite(rawMultiplier) && rawMultiplier > 1 ? rawMultiplier : 2;
  return {
    active,
    multiplier,
    activeUntil: active ? activeUntil?.toISOString() || null : null,
  };
}

async function getUserByEmail(email: string) {
  return await executeSingleQuery(
    `SELECT id, email, name, plus_new_user_eligible, plus_active_until, plus_activated_at, plus_multiplier
     FROM users WHERE email = $1`,
    [email.toLowerCase().trim()],
  );
}

export const handleGetPlusStatus: RequestHandler = async (req, res) => {
  try {
    await ensurePlusSchema();

    const email = getEmailFromToken(req.headers.authorization);
    if (!email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const plus = getPlusState(user);
    const eligible = !!user.plus_new_user_eligible && !user.plus_activated_at;

    const response: PlusStatusResponse = {
      eligible,
      active: plus.active,
      multiplier: plus.multiplier,
      activeUntil: plus.activeUntil,
      activatedAt: user.plus_activated_at || null,
      checkoutConfigured: !!process.env.PLUS_CHECKOUT_URL,
    };

    res.json(response);
  } catch (error) {
    console.error("Get plus status error:", error);
    res.status(500).json({ error: "Failed to fetch plus status" });
  }
};

export const handleCreatePlusCheckout: RequestHandler = async (req, res) => {
  try {
    await ensurePlusSchema();

    const email = getEmailFromToken(req.headers.authorization);
    if (!email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const eligible = !!user.plus_new_user_eligible && !user.plus_activated_at;
    if (!eligible) {
      res.status(400).json({ error: "Plus is only available once for new users" });
      return;
    }

    const configuredUrl = process.env.PLUS_CHECKOUT_URL;
    if (!configuredUrl) {
      res.status(400).json({ error: "Plus checkout is not configured yet" });
      return;
    }

    let checkoutUrl = configuredUrl;
    try {
      const url = new URL(configuredUrl);
      url.searchParams.set("email", user.email);
      url.searchParams.set("name", user.name);
      url.searchParams.set("userId", user.id);
      checkoutUrl = url.toString();
    } catch {
      const sep = configuredUrl.includes("?") ? "&" : "?";
      checkoutUrl =
        `${configuredUrl}${sep}email=${encodeURIComponent(user.email)}` +
        `&name=${encodeURIComponent(user.name)}` +
        `&userId=${encodeURIComponent(user.id)}`;
    }

    const response: PlusCheckoutResponse = { checkoutUrl };
    res.json(response);
  } catch (error) {
    console.error("Create plus checkout error:", error);
    res.status(500).json({ error: "Failed to create plus checkout" });
  }
};

// Webhook endpoint for payment provider callback.
// Configure PLUS_WEBHOOK_SECRET and call this route after payment confirmation.
export const handleActivatePlusWebhook: RequestHandler = async (req, res) => {
  try {
    await ensurePlusSchema();

    const configuredSecret = process.env.PLUS_WEBHOOK_SECRET;
    if (!configuredSecret) {
      res.status(503).json({ error: "Plus webhook secret is not configured" });
      return;
    }

    const providedSecret = req.headers["x-plus-webhook-secret"];
    if (typeof providedSecret !== "string" || providedSecret !== configuredSecret) {
      res.status(401).json({ error: "Invalid webhook secret" });
      return;
    }

    const bodyEmail = typeof req.body?.email === "string" ? req.body.email : "";
    const email = bodyEmail.toLowerCase().trim();
    if (!email) {
      res.status(400).json({ error: "Missing email" });
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const eligible = !!user.plus_new_user_eligible && !user.plus_activated_at;
    if (!eligible) {
      res.status(400).json({ error: "User is not eligible for Plus activation" });
      return;
    }

    const defaultDays = parseInt(process.env.PLUS_DEFAULT_DAYS || "30", 10);
    const defaultMultiplier = parseFloat(process.env.PLUS_DEFAULT_MULTIPLIER || "2");
    const plusDays = clamp(Number(req.body?.days ?? defaultDays), 1, 365);
    const plusMultiplier = clamp(
      Number(req.body?.multiplier ?? defaultMultiplier),
      1.01,
      10,
    );

    const activeUntil = new Date(Date.now() + plusDays * 24 * 60 * 60 * 1000);

    await executeQuery(
      `UPDATE users
       SET plus_active_until = $1,
           plus_activated_at = NOW(),
           plus_multiplier = $2,
           plus_new_user_eligible = FALSE
       WHERE id = $3`,
      [activeUntil.toISOString(), plusMultiplier, user.id],
    );

    res.json({
      success: true,
      email: user.email,
      activeUntil: activeUntil.toISOString(),
      multiplier: plusMultiplier,
      days: plusDays,
    });
  } catch (error) {
    console.error("Activate plus webhook error:", error);
    res.status(500).json({ error: "Failed to activate plus plan" });
  }
};
