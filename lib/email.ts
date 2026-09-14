import "server-only";
import { Resend } from "resend";

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "zeghiche@gmail.com";
const FROM = process.env.NEWSLETTER_FROM || "Cardusia <noreply@cardusia.com>";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendSignupNotification(params: {
  email: string;
  total: number;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<boolean> {
  const { email, total, ip, userAgent } = params;
  const date = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
  const subject = `Nouvelle inscription newsletter Cardusia : ${email}`;
  const text = [
    `Nouvelle inscription à la newsletter Cardusia`,
    ``,
    `Email : ${email}`,
    `Date : ${date}`,
    `Total inscrits : ${total}`,
    ip ? `IP : ${ip}` : null,
    userAgent ? `Navigateur : ${userAgent}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px;border-radius:16px;max-width:560px;margin:0 auto">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#a3a3a3">Cardusia · Newsletter</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700">Nouvelle inscription</h1>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      <tr><td style="padding:8px 0;color:#8a8a8a;width:140px">Email</td><td style="padding:8px 0"><strong>${escapeHtml(email)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#8a8a8a">Date</td><td style="padding:8px 0">${escapeHtml(date)}</td></tr>
      <tr><td style="padding:8px 0;color:#8a8a8a">Total inscrits</td><td style="padding:8px 0">${total}</td></tr>
      ${ip ? `<tr><td style="padding:8px 0;color:#8a8a8a">IP</td><td style="padding:8px 0">${escapeHtml(ip)}</td></tr>` : ""}
      ${userAgent ? `<tr><td style="padding:8px 0;color:#8a8a8a">Navigateur</td><td style="padding:8px 0;font-size:12px;color:#c4c4c4">${escapeHtml(userAgent)}</td></tr>` : ""}
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#6b6b6b">Suivi complet des inscriptions dans le backoffice /admin.</p>
  </div>`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email:dev] RESEND_API_KEY absente — email non envoyé.\nTo: ${NOTIFY_EMAIL}\nSubject: ${subject}\n${text}`);
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [NOTIFY_EMAIL],
      subject,
      text,
      html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}
