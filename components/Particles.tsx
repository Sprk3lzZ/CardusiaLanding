"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  depth: number;
  hue: number;
  phase: number;
  twinkle: number;
};

const PALETTE = [0];

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let last = performance.now();
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

    const count = () => {
      const area = width * height;
      const base = Math.round(area / 9000);
      return Math.max(60, Math.min(220, base));
    };

    const spawn = (): Particle => {
      const depth = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12 * (0.4 + depth),
        vy: -(0.04 + Math.random() * 0.1) * (0.4 + depth),
        r: 0.6 + depth * 1.9,
        depth,
        hue: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.6 + Math.random() * 1.6,
      };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = count();
      if (particles.length > target) particles = particles.slice(0, target);
      while (particles.length < target) particles.push(spawn());
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    const LINK_DIST = 110;
    const MOUSE_RADIUS = 160;

    const frame = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;

      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const t = now * 0.001;

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.x += Math.sin(t * 0.4 + p.phase) * 0.05 * dt;

          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const force = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * 0.35 * (0.3 + p.depth);
              p.x += (dx / d) * force * dt;
              p.y += (dy / d) * force * dt;
            }
          }

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        const tw = 0.55 + 0.45 * Math.sin(t * p.twinkle + p.phase);
        const alpha = (0.2 + p.depth * 0.6) * tw;
        const light = 82 + p.depth * 18;

        ctx.beginPath();
        ctx.fillStyle = `hsla(0, 0%, ${light}%, ${alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (p.depth > 0.7) {
          ctx.beginPath();
          ctx.fillStyle = `hsla(0, 0%, 100%, ${alpha * 0.1})`;
          ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Constellation links, only near the pointer to keep it subtle and cheap.
      if (mouse.active) {
        ctx.lineWidth = 0.6;
        const n = particles.length;
        for (let i = 0; i < n; i++) {
          const a = particles[i];
          const mdx = a.x - mouse.x;
          const mdy = a.y - mouse.y;
          if (mdx * mdx + mdy * mdy > (MOUSE_RADIUS * 1.6) ** 2) continue;
          for (let j = i + 1; j < n; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < LINK_DIST * LINK_DIST) {
              const s = 1 - Math.sqrt(d2) / LINK_DIST;
              ctx.strokeStyle = `hsla(0, 0%, 100%, ${s * 0.18})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  );
}
