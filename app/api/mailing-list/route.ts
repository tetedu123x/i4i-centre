import { NextRequest, NextResponse } from "next/server";
import { createMailingListToken, normalizeEmail, sendConfirmationEmail } from "../../../lib/mailing-list";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown; website?: unknown };
    if (body.website) return NextResponse.json({ message: "Check your inbox to confirm your email." });
    const email = normalizeEmail(body.email);
    if (!email) return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });

    const token = createMailingListToken(email, "confirm");
    const confirmUrl = new URL(`/api/mailing-list/confirm?token=${encodeURIComponent(token)}`, request.nextUrl.origin).toString();
    const sent = await sendConfirmationEmail(email, confirmUrl);

    return NextResponse.json({
      message: sent ? "Check your inbox to confirm your email." : "Local preview ready.",
      ...(!sent && process.env.NODE_ENV !== "production" ? { previewUrl: confirmUrl } : {}),
    });
  } catch {
    return NextResponse.json({ message: "We couldn’t start your subscription. Please try again." }, { status: 500 });
  }
}
