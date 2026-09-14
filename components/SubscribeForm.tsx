"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useId, useState } from "react";

type Status = "idle" | "loading" | "success" | "exists" | "error";

const BURST = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const dist = 70 + (i % 3) * 30;
  return {
    dx: `${Math.cos(angle) * dist}px`,
    dy: `${Math.sin(angle) * dist}px`,
    c: ["#ffffff", "#d4d4d4", "#ffffff", "#a3a3a3"][i % 4],
    delay: `${(i % 6) * 25}ms`,
  };
});

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const inputId = useId();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honeypot }),
      });
      const data = (await res.json()) as { ok: boolean; status?: string; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Une erreur est survenue, réessayez.");
        return;
      }
      setStatus(data.status === "exists" ? "exists" : "success");
    } catch {
      setStatus("error");
      setMessage("Impossible de contacter le serveur. Réessayez dans un instant.");
    }
  }

  const done = status === "success" || status === "exists";

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <AnimatePresence mode="wait" initial={false}>
        {!done ? (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-full"
          >
            <label htmlFor={inputId} className="sr-only">
              Votre adresse email
            </label>

            <div className="glow-ring">
              <div className="flex flex-col gap-2 rounded-full bg-[rgba(10,10,10,0.9)] p-1.5 backdrop-blur-xl sm:flex-row sm:items-center">
                <input
                  id={inputId}
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  aria-invalid={status === "error" || undefined}
                  aria-describedby={message ? `${inputId}-msg` : undefined}
                  className="h-12 flex-1 rounded-full bg-transparent px-5 text-[15px] text-fg placeholder:text-white/35 outline-none sm:h-13"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary h-12 shrink-0 rounded-full px-7 font-display text-[15px] font-medium tracking-[-0.01em] text-black disabled:cursor-wait disabled:opacity-80 sm:h-13"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {status === "loading" ? (
                      <>
                        <Spinner />
                        Envoi…
                      </>
                    ) : (
                      <>
                        Rejoindre
                        <ArrowIcon />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Honeypot anti-bot : invisible pour les humains */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Site web
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="mt-4 min-h-6 text-center text-sm">
              <AnimatePresence mode="wait">
                {message ? (
                  <motion.p
                    key="err"
                    id={`${inputId}-msg`}
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-white/80"
                  >
                    {message}
                  </motion.p>
                ) : (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white/35"
                  >
                    Pas de spam. Une seule newsletter, quand ça compte.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            role="status"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[rgba(10,10,10,0.75)] px-8 py-8 text-center backdrop-blur-xl"
          >
            <span className="pointer-events-none absolute inset-0">
              {BURST.map((b, i) => (
                <span
                  key={i}
                  className="burst"
                  style={
                    {
                      "--dx": b.dx,
                      "--dy": b.dy,
                      "--c": b.c,
                      animationDelay: b.delay,
                    } as React.CSSProperties
                  }
                />
              ))}
            </span>

            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 16 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.35)]"
            >
              <CheckIcon />
            </motion.span>

            <div>
              <p className="font-display text-xl font-semibold text-fg">
                {status === "exists" ? "Vous êtes déjà inscrit·e" : "Bienvenue à bord"}
              </p>
              <p className="mt-1.5 text-sm text-fg-3">
                {status === "exists"
                  ? "Cette adresse fait déjà partie de la liste. À très vite."
                  : "Vous serez parmi les premiers informés du lancement de Cardusia."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEmail("");
                setStatus("idle");
              }}
              className="text-xs text-white/40 underline-offset-4 transition hover:text-white hover:underline"
            >
              Inscrire une autre adresse
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-7 w-7 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}
