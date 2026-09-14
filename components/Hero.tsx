"use client";

import { motion } from "framer-motion";
import SubscribeForm from "./SubscribeForm";

const ease = [0.2, 0.8, 0.2, 1] as const;

export default function Hero() {
  const title = "Cardusia";
  return (
    <section className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 pb-24 pt-16 text-center sm:px-8 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="mb-9 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3 backdrop-blur"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        Bientôt disponible
      </motion.div>

      <h1 className="title-glow font-display text-[clamp(3rem,13vw,8.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
        {/* Le dégradé (background-clip: text) est sur un span sans animation :
            un filter/transform sur ce span (Chrome) ou sur ses enfants (Safari)
            rend le texte invisible. */}
        <motion.span
          className="inline-block"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease }}
        >
          <span className="title-sheen inline-block whitespace-nowrap">{title}</span>
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease }}
        className="mt-6 max-w-2xl text-balance text-[clamp(1.2rem,2.6vw,1.65rem)] sm:mt-7 font-normal leading-snug tracking-[-0.01em] text-fg-2"
      >
        L&rsquo;IA éthique et responsable.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.85, ease }}
        className="mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-muted sm:mt-4"
      >
        Laissez votre email pour être informé du lancement.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0, ease }}
        className="mt-8 w-full sm:mt-10"
      >
        <SubscribeForm />
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-0 right-0 text-center text-[11px] uppercase tracking-[0.2em] text-white/25"
      >
        © {new Date().getFullYear()} Cardusia
      </motion.footer>
    </section>
  );
}
