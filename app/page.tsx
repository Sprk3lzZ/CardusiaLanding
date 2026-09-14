import Particles from "@/components/Particles";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-void">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="halo" />
        <div className="grid-overlay" />
        <div className="noise" />
        <div className="vignette" />
      </div>
      <Particles />
      <Hero />
    </main>
  );
}
