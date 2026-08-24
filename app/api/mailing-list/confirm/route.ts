import { NextRequest, NextResponse } from "next/server";
import { confirmSubscriber, createMailingListToken, sendWelcomeEmail, verifyMailingListToken } from "../../../../lib/mailing-list";

export const runtime = "nodejs";

function resultPage(title: string, message: string, action?: { href: string; label: string }) {
  const actionHtml = action ? `<p><a href="${action.href}">${action.label}</a></p>` : "";
  return new NextResponse(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title} — I4I Centre</title><style>body{margin:0;min-height:100svh;display:grid;place-items:center;background:#fbfaf6;color:#1e2528;font:18px/1.5 Georgia,"Times New Roman",serif}.card{width:min(560px,calc(100% - 48px));text-align:center}h1{font-size:clamp(48px,8vw,76px);font-weight:400;line-height:1;margin:0 0 24px}a{color:#176b5b;text-underline-offset:4px}</style><main class="card"><h1>${title}</h1><p>${message}</p>${actionHtml}<p><a href="/">Return to I4I Centre</a></p></main></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const payload = verifyMailingListToken(token, "confirm");
  if (!payload) return resultPage("Link expired.", "Please return to the site and request a new confirmation email.");

  try {
    await confirmSubscriber(payload.email);
    const unsubscribeToken = createMailingListToken(payload.email, "unsubscribe");
    const unsubscribeUrl = new URL(`/api/mailing-list/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`, request.nextUrl.origin).toString();
    try {
      await sendWelcomeEmail(payload.email, unsubscribeUrl);
    } catch {
      // The confirmed contact remains subscribed even if the receipt email is delayed.
    }
    return resultPage("You’re confirmed.", "We’ll let you know when I4I Centre launches.", { href: unsubscribeUrl, label: "Unsubscribe" });
  } catch {
    return resultPage("Something went wrong.", "We couldn’t confirm your email. Please try the confirmation link again.");
  }
}
