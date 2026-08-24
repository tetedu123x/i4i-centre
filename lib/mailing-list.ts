import { createHmac, timingSafeEqual } from "node:crypto";

type TokenAction = "confirm" | "unsubscribe";

type TokenPayload = {
  action: TokenAction;
  email: string;
  expires?: number;
};

declare global {
  var i4iDevSubscribers: Map<string, { confirmedAt: string; unsubscribed: boolean }> | undefined;
}

const isProduction = process.env.NODE_ENV === "production";
const devSubscribers = globalThis.i4iDevSubscribers ?? new Map();
globalThis.i4iDevSubscribers = devSubscribers;

function secret() {
  const value = process.env.NEWSLETTER_TOKEN_SECRET;
  if (value) return value;
  if (!isProduction) return "i4i-local-development-secret";
  throw new Error("NEWSLETTER_TOKEN_SECRET is not configured.");
}

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function createMailingListToken(email: string, action: TokenAction) {
  const payload: TokenPayload = { action, email };
  if (action === "confirm") payload.expires = Date.now() + 48 * 60 * 60 * 1000;
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyMailingListToken(token: string, expectedAction: TokenAction) {
  const [encoded, suppliedSignature] = token.split(".");
  if (!encoded || !suppliedSignature) return null;
  const expectedSignature = createHmac("sha256", secret()).update(encoded).digest("base64url");
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as TokenPayload;
    if (payload.action !== expectedAction || !normalizeEmail(payload.email)) return null;
    if (payload.expires && payload.expires < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function resendRequest(path: string, init: RequestInit) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (isProduction) throw new Error("RESEND_API_KEY is not configured.");
    return null;
  }
  const response = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) throw new Error(`Resend request failed (${response.status}).`);
  return response;
}

export async function sendConfirmationEmail(email: string, confirmUrl: string) {
  if (!process.env.RESEND_API_KEY && !isProduction) return false;
  const from = process.env.NEWSLETTER_FROM_EMAIL || "I4I Centre <hello@i4icentre.com>";
  await resendRequest("/emails", {
    method: "POST",
    headers: { "Idempotency-Key": `i4i-confirm-${createHmac("sha256", secret()).update(email).digest("hex").slice(0, 32)}` },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Confirm your I4I Centre launch notification",
      html: `<div style="font-family:Arial,sans-serif;color:#1e2528;line-height:1.6"><h1 style="font-family:Georgia,serif;font-weight:400">One more step.</h1><p>Confirm that you would like to be notified when I4I Centre launches.</p><p><a href="${confirmUrl}" style="display:inline-block;background:#176b5b;color:#fff;padding:14px 20px;text-decoration:none">Confirm my email</a></p><p style="font-size:13px;color:#596361">This link expires in 48 hours. If you did not request this, no action is needed.</p></div>`,
      text: `Confirm that you would like to be notified when I4I Centre launches: ${confirmUrl}\n\nThis link expires in 48 hours.`,
    }),
  });
  return true;
}

export async function confirmSubscriber(email: string) {
  if (!process.env.RESEND_API_KEY && !isProduction) {
    devSubscribers.set(email, { confirmedAt: new Date().toISOString(), unsubscribed: false });
    return;
  }

  try {
    await resendRequest("/contacts", {
      method: "POST",
      body: JSON.stringify({ email, unsubscribed: false }),
    });
  } catch {
    await resendRequest(`/contacts/${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify({ unsubscribed: false }),
    });
  }
}

export async function sendWelcomeEmail(email: string, unsubscribeUrl: string) {
  if (!process.env.RESEND_API_KEY && !isProduction) return;
  const from = process.env.NEWSLETTER_FROM_EMAIL || "I4I Centre <hello@i4icentre.com>";
  await resendRequest("/emails", {
    method: "POST",
    body: JSON.stringify({
      from,
      to: [email],
      subject: "You’re on the I4I Centre launch list",
      html: `<div style="font-family:Arial,sans-serif;color:#1e2528;line-height:1.6"><h1 style="font-family:Georgia,serif;font-weight:400">You’re confirmed.</h1><p>We’ll let you know when I4I Centre launches.</p><p style="font-size:13px;color:#596361"><a href="${unsubscribeUrl}">Unsubscribe</a> at any time.</p></div>`,
      text: `You’re confirmed. We’ll let you know when I4I Centre launches.\n\nUnsubscribe: ${unsubscribeUrl}`,
    }),
  });
}

export async function unsubscribeSubscriber(email: string) {
  if (!process.env.RESEND_API_KEY && !isProduction) {
    const current = devSubscribers.get(email);
    devSubscribers.set(email, { confirmedAt: current?.confirmedAt || new Date().toISOString(), unsubscribed: true });
    return;
  }
  await resendRequest(`/contacts/${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: JSON.stringify({ unsubscribed: true }),
  });
}
