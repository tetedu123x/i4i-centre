import { NextRequest, NextResponse } from "next/server";
import { unsubscribeSubscriber, verifyMailingListToken } from "../../../../lib/mailing-list";

export const runtime = "nodejs";

function page(token: string, state: "prompt" | "complete" | "invalid" = "prompt") {
  const title = state === "complete" ? "Unsubscribed." : state === "invalid" ? "Link unavailable." : "Leave the list?";
  const message = state === "complete" ? "You won’t receive future I4I Centre launch emails." : state === "invalid" ? "This unsubscribe link is not valid." : "Confirm that you no longer want launch updates from I4I Centre.";
  const action = state === "prompt" ? `<form method="post"><input type="hidden" name="token" value="${token.replaceAll('"', '&quot;')}"><button type="submit">UNSUBSCRIBE</button></form>` : "";
  return new NextResponse(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Unsubscribe — I4I Centre</title><style>body{margin:0;min-height:100svh;display:grid;place-items:center;background:#fbfaf6;color:#1e2528;font:18px/1.5 Georgia,"Times New Roman",serif}.card{width:min(560px,calc(100% - 48px));text-align:center}h1{font-size:clamp(48px,8vw,76px);font-weight:400;line-height:1;margin:0 0 24px}button{border:0;background:#176b5b;color:white;padding:15px 22px;font:700 15px Georgia,"Times New Roman",serif;letter-spacing:.06em;cursor:pointer}a{color:#176b5b;text-underline-offset:4px}</style><main class="card"><h1>${title}</h1><p>${message}</p>${action}<p><a href="/">Return to I4I Centre</a></p></main></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  if (!verifyMailingListToken(token, "unsubscribe")) return page("", "invalid");
  return page(token);
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const token = typeof data.get("token") === "string" ? String(data.get("token")) : "";
  const payload = verifyMailingListToken(token, "unsubscribe");
  if (!payload) return page("", "invalid");
  try {
    await unsubscribeSubscriber(payload.email);
    return page("", "complete");
  } catch {
    return new NextResponse("Unable to unsubscribe. Please try again.", { status: 500 });
  }
}
