"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="card w-full max-w-sm p-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Cardusia</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Backoffice</h1>
      <p className="mt-1 text-sm text-muted">Suivi des inscriptions à la newsletter.</p>

      <label htmlFor="password" className="mt-6 block text-xs font-medium text-fg-2">
        Mot de passe
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink px-4 text-sm outline-none transition focus:border-white/40 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]"
      />
      {state.error ? (
        <p role="alert" className="mt-3 text-sm text-white/80">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary mt-5 h-11 w-full rounded-xl font-display text-sm font-medium text-black disabled:opacity-70"
      >
        <span className="relative z-10">{pending ? "Connexion…" : "Se connecter"}</span>
      </button>
    </form>
  );
}
