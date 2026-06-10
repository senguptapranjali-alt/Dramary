"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/useAuth";

export default function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <section className="flex flex-col items-center justify-center text-center mt-20 px-6 pb-32">

      <h2 className="text-6xl font-bold leading-tight max-w-4xl">
        Your emotional archive for every story that stayed with you.
      </h2>

      <p className="mt-6 text-zinc-400 text-lg max-w-2xl">
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
        className="mt-10 bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 active:scale-95 transition duration-200"
      >
        Start Your Journal
      </button>

    </section>
  );
}