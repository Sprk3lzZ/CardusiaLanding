import { isAdmin } from "@/lib/auth";
import { listSubscribers } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(v: string | number | null): string {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }
  const rows = listSubscribers();
  const header = ["id", "email", "created_at", "ip", "user_agent", "notified"];
  const lines = [
    header.join(";"),
    ...rows.map((r) =>
      [r.id, r.email, r.created_at, r.ip, r.user_agent, r.notified].map(csvCell).join(";"),
    ),
  ];
  const body = "﻿" + lines.join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cardusia-inscriptions-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
