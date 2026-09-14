import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getStats, listSubscribers } from "@/lib/db";
import LoginForm from "./LoginForm";
import { logout, removeSubscriber } from "./actions";

export const metadata: Metadata = {
  title: "Backoffice — Cardusia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-void px-5">
        <LoginForm />
      </main>
    );
  }

  const stats = getStats();
  const subscribers = listSubscribers();
  const max = Math.max(1, ...stats.perDay.map((d) => d.count));
  const notifiedCount = subscribers.filter((s) => s.notified).length;

  return (
    <main className="min-h-dvh bg-void px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Cardusia</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Inscriptions newsletter</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/export"
              className="rounded-xl border border-white/15 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
            >
              Exporter CSV
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-fg-3 transition hover:bg-white/5 hover:text-fg"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Total inscrits" value={stats.total} accent />
          <Stat label="Aujourd'hui" value={stats.today} />
          <Stat label="7 derniers jours" value={stats.last7} />
          <Stat label="Notifs envoyées" value={notifiedCount} />
        </section>

        <section className="card mt-4 p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-fg-2">Inscriptions par jour</h2>
            <span className="text-xs text-muted">14 derniers jours</span>
          </div>
          <div className="mt-4 flex h-28 items-end gap-1.5">
            {stats.perDay.map((d) => (
              <div key={d.day} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-neutral-400 to-white transition-opacity group-hover:opacity-100"
                  style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.count ? 0.95 : 0.12 }}
                  title={`${d.day} : ${d.count}`}
                />
                <span className="mt-1.5 text-[10px] tabular-nums text-muted">
                  {d.day.slice(8, 10)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">IP</th>
                  <th className="px-5 py-3 font-medium">Notif</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted">
                      Aucune inscription pour le moment.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((s, i) => (
                    <tr key={s.id} className="transition hover:bg-white/[0.03]">
                      <td className="px-5 py-3 tabular-nums text-muted">{subscribers.length - i}</td>
                      <td className="px-5 py-3 font-medium text-fg">{s.email}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-fg-2">{formatDate(s.created_at)}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted">{s.ip ?? "—"}</td>
                      <td className="px-5 py-3">
                        {s.notified ? (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-fg">envoyée</span>
                        ) : (
                          <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-xs text-muted">non</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <form action={removeSubscriber}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            className="text-xs text-muted transition hover:text-white"
                            aria-label={`Supprimer ${s.email}`}
                          >
                            Supprimer
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums ${
          accent ? "text-white" : "text-fg-2"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
