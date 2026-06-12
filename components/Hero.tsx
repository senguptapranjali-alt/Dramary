"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/useAuth";

export default function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <section className="relative flex flex-col items-center justify-center text-center pt-16 sm:pt-20 md:pt-28 px-6 pb-24 sm:pb-32 overflow-hidden">

      <h2 className="relative z-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] max-w-5xl">
        Your emotional archive for every story that stayed with you.
      </h2>

      <p className="relative z-10 mt-6 text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl">
        Journal your favorite dramas, movies, anime, and shows.
        Save memories, reviews, favorite OSTs, unforgettable scenes,
        and everything you felt.
      </p>

      <button
        onClick={() => {
          if (!user) {
            alert("Please login first");
            return;
          }
          router.push("/journal");
        }}
        className="relative z-10 mt-10 bg-white text-black px-8 sm:px-10 py-4 rounded-full font-semibold hover:scale-105 active:scale-95 transition duration-300"
      >
        Start Your Journal
      </button>

      <p className="relative z-10 mt-4 text-sm text-zinc-500">
        Build your cinematic identity.
      </p>

    </section>
  );
}