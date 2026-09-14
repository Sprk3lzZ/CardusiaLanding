import { NextResponse } from "next/server";
import { insertSubscriber, markNotified, getStats } from "@/lib/db";
import { sendSignupNotification } from "@/lib/email";
import { normalizeEmail } from "@/lib/validation";
import { allowRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function POST(req: Request) {
  let body: { email?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  // Honeypot : un bot remplit ce champ caché, on répond OK sans rien faire.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true, status: "created" });
  }

  const ip = clientIp(req);
  if (!allowRequest(ip ?? "anonymous")) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives, réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ ok: false, error: "Adresse email invalide." }, { status: 422 });
  }

  const userAgent = req.headers.get("user-agent");

  try {
    const result = insertSubscriber(email, { ip, userAgent });

    if (result.status === "created") {
      const { total } = getStats();
      const sent = await sendSignupNotification({ email, total, ip, userAgent });
      if (sent) markNotified(result.id);
    }

    return NextResponse.json({ ok: true, status: result.status });
  } catch (err) {
    console.error("[subscribe] échec de l'inscription :", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur lors de l'enregistrement. Réessayez plus tard." },
      { status: 500 },
    );
  }
}
