"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function JournalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const username = user?.email?.split("@")[0] || "";

  const formattedUsername = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : "User";

  // ✅ ALL HOOKS FIRST
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // ✅ THEN CONDITIONAL RETURNS
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Loading your world...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-950 text-white flex flex-col items-center justify-start pt-20 px-4 sm:px-6 md:px-10 relative">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-center">
        Welcome {formattedUsername}!
      </h1>

      <p className="text-gray-400 text-base sm:text-lg md:text-xl mb-10 text-center">
        What would you like to do today?
      </p>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pb-24">
        <Link href="/dashboard">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-700 hover:border-blue-400 hover:scale-[1.02] active:scale-95 transition duration-300 rounded-3xl min-h-[180px] sm:h-64 flex items-center justify-center text-center px-4 text-2xl sm:text-3xl font-semibold cursor-pointer shadow-2xl">
            ✍ Add to Your Journal
          </div>
        </Link>

        <Link href="/journals">
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-slate-700 hover:border-emerald-400 hover:scale-[1.02] active:scale-95 transition duration-300 rounded-3xl min-h-[180px] sm:h-64 flex items-center justify-center text-center px-4 text-2xl sm:text-3xl font-semibold cursor-pointer shadow-2xl">
            📚 View Your Journal
          </div>
        </Link>

        <Link href="/discovery">
          <div className="bg-gradient-to-br from-slate-900 via-pink-950 to-slate-900 border border-slate-700 hover:border-pink-400 hover:scale-[1.02] active:scale-95 transition duration-300 rounded-3xl min-h-[180px] sm:h-64 flex items-center justify-center text-center px-4 text-2xl sm:text-3xl font-semibold cursor-pointer shadow-2xl">
            🔍 Discover
          </div>
        </Link>

        <Link href="/profile">
          <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border border-slate-700 hover:border-purple-400 hover:scale-[1.02] active:scale-95 transition duration-300 rounded-3xl min-h-[180px] sm:h-64 flex items-center justify-center text-center px-4 text-2xl sm:text-3xl font-semibold cursor-pointer shadow-2xl">
            👤 Visit Your Profile
          </div>
        </Link>
      </div>

      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8">
        <Link href="/">
          <div className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 transition rounded-xl px-6 py-3 text-sm text-zinc-300 shadow-lg cursor-pointer">
            ← Back to Home
          </div>
        </Link>
      </div>
    </main>
  );
}