import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-black via-zinc-900 to-black text-white">

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <Hero />

    </main>
  );
}