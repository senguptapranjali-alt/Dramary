"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/app/lib/useAuth";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
    const [selectedJournal, setSelectedJournal] = useState<any | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profile, setProfile] = useState<any | null>(null);
    const [uploading, setUploading] = useState(false);

  const { user } = useAuth();

  const actualJournals = journals.filter(
    (j) =>
        j.thoughts ||
        j.rating ||
        j.favorite_ost ||
        j.favorite_character ||
        j.memorable_scene ||
        j.what_stuck_with_you ||
        j.ending_thoughts
    );

    const totalJournals = actualJournals.length;

    const totalFavorites = actualJournals.filter(
    (j) => j.starred
    ).length;

    const averageRating =
    actualJournals.length > 0
        ? (
            actualJournals.reduce(
            (acc, j) => acc + Number(j.rating || 0),
            0
            ) / actualJournals.length
        ).toFixed(1)
        : "0";

    const firstJournalDate =
    journals.length > 0
        ? new Date(
            Math.min(
            ...actualJournals.map((j) =>
                new Date(j.created_at).getTime()
            )
            )
        ).toLocaleDateString()
        : "No journals yet";

    const watching = journals.filter(
    (j) => j.watch_status === "watching"
    );

    const completed = journals.filter(
    (j) => j.watch_status === "completed"
    );

    const planned = journals.filter(
    (j) => j.watch_status === "planned"
    );

    const priorityQueue = journals.filter(
    (j) => j.priority_watch
    );

    const journaledEntries = actualJournals;

    const moodCounts: Record<string, number> = {};

    journaledEntries.forEach((j) => {

    (j.mood_tags || []).forEach((mood: string) => {

        moodCounts[mood] =
        (moodCounts[mood] || 0) + 1;

    });

    });

    const topMood =
    Object.entries(moodCounts).sort(
        (a, b) => b[1] - a[1]
    )[0]?.[0] || "None";

    const customTagCounts: Record<string, number> = {};

    journaledEntries.forEach((j) => {

    (j.custom_tags || []).forEach((tag: string) => {

        customTagCounts[tag] =
        (customTagCounts[tag] || 0) + 1;

    });

    });

    const topCustomTag =
    Object.entries(customTagCounts).sort(
        (a, b) => b[1] - a[1]
    )[0]?.[0] || "None";

    const highestRatedDrama =
    [...journaledEntries].sort(
        (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    )[0];

    const favoriteDramas = journaledEntries.filter(
    (j) => j.starred
    );

    const watchStats = {
    planned: planned.length,
    watching: watching.length,
    completed: completed.length,
    };

    const moodChartData = Object.entries(moodCounts).map(
    ([mood, count]) => ({
        mood,
        count,
    })
    );

    const watchChartData = [
    {
        name: "Planned",
        value: watchStats.planned,
    },
    {
        name: "Watching",
        value: watchStats.watching,
    },
    {
        name: "Completed",
        value: watchStats.completed,
    },
    ];

    const COLORS = [
    "#ec4899", // pink
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#3b82f6", // blue
    "#14b8a6", // teal
    "#e879f9", // fuchsia
    "#84cc16", // lime
    "#f97316", // orange
    "#a855f7", // violet
    ];

    let viewerPersonality = "";

    const hasMood = topMood && topMood !== "None";

    if (!hasMood) {
    viewerPersonality =
        "Your viewing personality is still forming. Add more journals with mood tags to unlock your cinematic identity.";
    } else if (
    topMood === "romantic" ||
    topMood === "fluttery"
    ) {

    viewerPersonality =
        "You are deeply drawn toward love stories that create emotional tension, longing, and unforgettable chemistry. You enjoy narratives filled with soft emotional moments, emotional vulnerability, and relationships that slowly bloom over time. Your viewing taste leans toward stories that make your heart race and leave emotional butterflies long after the drama ends.";

    } else if (
    topMood === "comforting"
    ) {

    viewerPersonality =
        "You seek emotionally safe and comforting stories that feel warm, healing, and deeply human. You enjoy quiet emotional moments, found-family dynamics, emotional reassurance, and narratives that feel like a comforting escape from reality. Dramas for you are not just entertainment — they are emotional refuge.";

    } else if (
    topMood === "heartbreaking" ||
    topMood === "sad"
    ) {

    viewerPersonality =
        "You emotionally connect most with painful, tragic, and emotionally devastating narratives. You are not afraid of emotional intensity and often appreciate stories that leave lasting emotional scars. Bittersweet endings, emotional sacrifice, grief, and aching emotional realism strongly resonate with your viewing personality.";

    } else if (
    topMood === "emotional"
    ) {

    viewerPersonality =
        "You are highly emotionally invested in storytelling and deeply connect with character-driven narratives. You value emotional authenticity, meaningful relationships, and scenes that leave a strong emotional impact. Stories that explore vulnerability, growth, and human emotions stay with you long after watching.";

    } else if (
    topMood === "happy"
    ) {

    viewerPersonality =
        "You naturally gravitate toward uplifting and emotionally satisfying stories. You enjoy positive emotional energy, lovable characters, hopeful endings, and narratives that leave you smiling. Your viewing taste reflects optimism and emotional warmth.";

    } else if (
    topMood === "inspiring"
    ) {

    viewerPersonality =
        "You admire stories centered around personal growth, resilience, ambition, and emotional perseverance. You are inspired by characters who overcome emotional struggles and continue moving forward despite difficulties. Your viewing personality values emotional strength and meaningful life journeys.";

    } else if (
    topMood === "nostalgic"
    ) {

    viewerPersonality =
        "You are emotionally attached to stories that evoke memories, longing, youthfulness, and emotional reflection. You enjoy emotionally atmospheric narratives that feel timeless and sentimental. Quiet emotional moments and reflective storytelling strongly resonate with your cinematic taste.";

    } else if (
    topMood === "dark" ||
    topMood === "thrilling"
    ) {

    viewerPersonality =
        "You are drawn toward intense, suspenseful, and psychologically gripping stories. You enjoy emotional tension, unpredictable narratives, morally complex characters, and darker storytelling themes. Your viewing style reflects curiosity toward emotionally high-stakes worlds and psychological depth.";

    } else if (
    topMood === "funny"
    ) {

    viewerPersonality =
        "You enjoy emotionally lighthearted stories filled with humor, lovable chaos, and entertaining character dynamics. Comedy and emotional comfort are central to your viewing personality, and you value dramas that create joy, laughter, and emotional relaxation.";

    } else if (
    topMood === "surprised"
    ) {

    viewerPersonality =
        "You enjoy unpredictable storytelling, shocking twists, emotional reveals, and narratives that constantly keep you emotionally engaged. You appreciate stories that challenge expectations and create strong emotional reactions through unexpected developments.";

    } else if (
    topMood === "angry"
    ) {

    viewerPersonality =
        "You emotionally engage strongly with stories involving injustice, betrayal, revenge, emotional conflict, and morally intense situations. You appreciate emotionally charged narratives that create powerful reactions and confront difficult human emotions directly.";

    } else if (
    topMood === "confused"
    ) {

    viewerPersonality =
        "You are fascinated by layered storytelling, emotional ambiguity, psychological complexity, and narratives that require deeper interpretation. You enjoy stories that leave lingering questions and encourage emotional and intellectual reflection.";

    } else {

    viewerPersonality =
        "You explore an emotionally diverse range of stories and enjoy experiencing many different cinematic emotions. Your viewing personality reflects curiosity, emotional openness, and appreciation for varied storytelling styles.";
    }

    let ratingInsight = "";

    const hasRatings = actualJournals.length > 0;

    if (!hasRatings) {
    ratingInsight =
        "Not enough ratings yet. Rate a few dramas to understand your emotional scoring style.";

    } else if (Number(averageRating) >= 8.5) {

    ratingInsight =
        "You tend to emotionally connect with most stories you finish and rate generously.";

    } else if (Number(averageRating) >= 7) {

    ratingInsight =
        "You balance emotional enjoyment with critical evaluation while rating dramas.";

    } else {

    ratingInsight =
        "You are highly selective and difficult to emotionally impress.";

    }

    const customInsight =
    topCustomTag !== "None"
        ? `Your viewing identity is strongly shaped around "${topCustomTag}" themes.`
        : "You have not explored enough custom storytelling themes yet.";

    let watchHabitInsight = "";

    const hasWatchData =
  watchStats.planned + watchStats.watching + watchStats.completed > 0;

    if (!hasWatchData) {
    watchHabitInsight =
        "Your watch habits will appear once you start building your drama journey.";

    } else if (watchStats.watching > watchStats.completed) {

    watchHabitInsight =
        "You love exploring new stories and frequently juggle multiple dramas at once.";

    } else if (watchStats.completed > watchStats.planned) {

    watchHabitInsight =
        "You are a consistent finisher who enjoys completing emotional journeys fully.";

    } else {

    watchHabitInsight =
        "Your watchlist keeps expanding faster than your completed dramas.";
    }

    const favoriteInsight =
    favoriteDramas.length > 0

        ? `Your strongest emotional connections seem to be with ${favoriteDramas
            .map((d) => d.drama_name)
            .join(", ")}. These stories likely left a lasting emotional impact on your cinematic journey.`

        : "You have not marked any emotional favorites yet.";

    const highestRatedInsight = highestRatedDrama
    ? `Your highest rated title is "${highestRatedDrama.drama_name}" with a rating of ${highestRatedDrama.rating}/10.`
    : "No highly rated drama yet.";


    useEffect(() => {
    async function fetchJournals() {
        if (!user) {
        setLoading(false);
        return;
        }

        setLoading(true);

        const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user.id);

        if (error) {
        console.error("Error fetching journals:", error);
        } else {
        setJournals(data || []);
        }

        setLoading(false);
    }

    async function fetchProfile() {

        if (!user) return;

        const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

        if (error) {
        console.error(error);
        return;
        }

        setProfile(data);
    }

    fetchJournals();
    fetchProfile();

    }, [user?.id]);

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading profile...
      </div>
    );
  }

    async function updateWatchStatus(
    id: string,
    status: string
    ) {
    const { error } = await supabase
        .from("journals")
        .update({
        watch_status: status,
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        return;
    }

    setJournals((prev) =>
        prev.map((j) =>
        j.id === id
            ? { ...j, watch_status: status }
            : j
        )
    );

    setSelectedJournal((prev: any) =>
        prev
        ? { ...prev, watch_status: status }
        : prev
    );
    }

    async function togglePriority(id: string) {

    const journal = journals.find((j) => j.id === id);

    if (!journal) return;

    const { error } = await supabase
        .from("journals")
        .update({
        priority_watch: !journal.priority_watch,
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        return;
    }

    setJournals((prev) =>
        prev.map((j) =>
        j.id === id
            ? {
                ...j,
                priority_watch: !j.priority_watch,
            }
            : j
        )
    );

    setSelectedJournal((prev: any) =>
        prev
        ? {
            ...prev,
            priority_watch: !prev.priority_watch,
            }
        : prev
    );
    }

    async function removeFromWatchlist(id: string) {

    const ok = confirm(
        "Remove this from your watchlist?"
    );

    if (!ok) return;

    const { error } = await supabase
        .from("journals")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        return;
    }

    setJournals((prev) =>
        prev.filter((j) => j.id !== id)
    );

    setSelectedJournal(null);
    }

    const username = user?.email?.split("@")[0] || "";

    const formattedUsername =
    username.charAt(0).toUpperCase() +
    username.slice(1);

    async function handleDeleteAccount() {
    if (!user) return;

    const confirmDelete = window.confirm(
        "⚠️ Delete your Dramary account?\n\nThis will permanently remove:\n- All journals\n- Profile data\n\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
        // 1. Delete journals first
        const { error: journalError } = await supabase
        .from("journals")
        .delete()
        .eq("user_id", user.id);

        if (journalError) {
        console.error("Journal delete error:", journalError);
        alert("Failed to delete journals.");
        return;
        }

        // 2. Delete profile
        const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", user.id);

        if (profileError) {
        console.error("Profile delete error:", profileError);
        alert("Failed to delete profile.");
        return;
        }

        // 3. Logout
        await supabase.auth.signOut();

        // 4. Redirect home
        window.location.href = "/";

    } catch (err) {
        console.error("Delete account error:", err);
        alert("Something went wrong while deleting your account.");
    }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white pt-24 p-6 md:p-10">

        <div className="mb-10">
        <Link href="/journal">
            <button className="absolute top-6 left-6 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-sm hover:bg-zinc-800 transition">
                ← Back to Journal Hub
            </button>
        </Link>
        </div>

        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-black p-8 mb-10 shadow-2xl">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-300 mb-2">
                Dramary Profile
            </p>

            <h1 className="text-4xl md:text-5xl font-black mb-3">
                {formattedUsername}
            </h1>

            <p className="text-gray-300 max-w-xl">
                Your emotional cinematic universe —
                every drama, every feeling, every memory.
            </p>
            </div>

            <button
            onClick={() => setShowProfileModal(true)}
            className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-700 flex items-center justify-center text-3xl font-bold shadow-lg hover:scale-105 transition"
            >

            {profile?.profile_image_url ? (

                <img
                src={profile.profile_image_url}
                className="w-full h-full object-cover object-center"
                />

            ) : (

                <span>
                {user?.email?.charAt(0).toUpperCase()}
                </span>

            )}

            </button>

        </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

        {/* TOTAL JOURNALS */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/20 p-6 shadow-lg transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]">

            <p className="text-sm uppercase tracking-wider text-blue-300 mb-2">
            Total Journals
            </p>

            <h2 className="text-4xl font-black">
            {totalJournals}
            </h2>

        </div>

        {/* FAVORITES */}
        <div className="rounded-2xl bg-gradient-to-br from-pink-900/40 to-black border border-pink-500/20 p-6 shadow-lg transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(236,72,153,0.35)]">

            <p className="text-sm uppercase tracking-wider text-pink-300 mb-2">
            Favorites
            </p>

            <h2 className="text-4xl font-black">
            {totalFavorites}
            </h2>

        </div>

        {/* AVERAGE RATING */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20 p-6 shadow-lg transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]">

            <p className="text-sm uppercase tracking-wider text-purple-300 mb-2">
            Average Rating
            </p>

            <h2 className="text-4xl font-black">
            {averageRating}
            </h2>

        </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">

        {/* MOOD DISTRIBUTION */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-xl">

            <h2 className="text-2xl font-bold mb-6">
            Emotional Spectrum
            </h2>

            <div className="h-[320px]">

            {moodChartData.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-zinc-500 text-sm">
                No emotional data yet — start journaling to unlock insights ✨
            </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={moodChartData}
                    dataKey="count"
                    nameKey="mood"
                    outerRadius={110}
                >
                    {moodChartData.map((_, index) => (
                    <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                    />
                    ))}
                </Pie>
                <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            )}

            </div>

            <div className="mt-6 flex flex-wrap gap-3">

            {moodChartData.map((item, index) => (

                <div
                key={item.mood}
                className="flex items-center gap-2 bg-zinc-800/70 px-3 py-2 rounded-xl border border-white/5"
                >

                <div
                    className="w-3 h-3 rounded-full"
                    style={{
                    backgroundColor:
                        COLORS[index % COLORS.length],
                    }}
                />

                <p className="text-sm text-zinc-300">
                    {item.mood}: {item.count}
                </p>

                </div>

            ))}

            </div>

        </div>

        {/* WATCH STATUS */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-xl">

            <h2 className="text-2xl font-bold mb-6">
            Watching Journey
            </h2>

            <div className="h-[320px]">

            {watchChartData.every((d) => d.value === 0) ? (
            <div className="h-[320px] flex items-center justify-center text-zinc-500 text-sm">
                No watch activity yet — start tracking dramas 🎬
            </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={watchChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {watchChartData.map((_, index) => (
                    <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                    />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            )}

            </div>

        </div>

        </div>

        <div className="mb-14">

        <div className="flex items-center gap-3 mb-6">

            <h2 className="text-3xl font-black">
            ✨ AI Insights
            </h2>

            <div className="h-[1px] flex-1 bg-gradient-to-r from-pink-500/40 to-transparent" />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PERSONALITY */}
            <div className="bg-gradient-to-br from-pink-900/30 to-zinc-900 border border-pink-500/20 rounded-3xl p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(236,72,153,0.22)]">

            <p className="text-sm uppercase tracking-wider text-pink-300 mb-3">
                Viewer Personality
            </p>

            <p className="text-zinc-200 leading-relaxed">
                {viewerPersonality}
            </p>

            </div>

            {/* RATING */}
            <div className="bg-gradient-to-br from-purple-900/30 to-zinc-900 border border-purple-500/20 rounded-3xl p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(168,85,247,0.22)]">

            <p className="text-sm uppercase tracking-wider text-purple-300 mb-3">
                Rating Behavior
            </p>

            <p className="text-zinc-200 leading-relaxed">
                {ratingInsight}
            </p>

            </div>

            {/* CUSTOM TAG */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-zinc-900 border border-cyan-500/20 rounded-3xl p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(34,211,238,0.22)]">

            <p className="text-sm uppercase tracking-wider text-cyan-300 mb-3">
                Storytelling Identity
            </p>

            <p className="text-zinc-200 leading-relaxed">
                {customInsight}
            </p>

            </div>

            {/* WATCH HABITS */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-zinc-900 border border-emerald-500/20 rounded-3xl p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(16,185,129,0.22)]">

            <p className="text-sm uppercase tracking-wider text-emerald-300 mb-3">
                Watching Habits
            </p>

            <p className="text-zinc-200 leading-relaxed">
                {watchHabitInsight}
            </p>

            </div>

            {/* FAVORITE */}
            <div className="bg-gradient-to-br from-orange-900/30 to-zinc-900 border border-orange-500/20 rounded-3xl p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(249,115,22,0.22)]">

            <p className="text-sm uppercase tracking-wider text-orange-300 mb-3">
                Emotional Favorite
            </p>

            <p className="text-zinc-200 leading-relaxed">
                {favoriteInsight}
            </p>

            </div>

            {/* HIGHEST RATED */}
            <div className="bg-gradient-to-br from-blue-900/30 to-zinc-900 border border-blue-500/20 rounded-3xl p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(59,130,246,0.22)]">

            <p className="text-sm uppercase tracking-wider text-blue-300 mb-3">
                Highest Rated Journey
            </p>

            <p className="text-zinc-200 leading-relaxed">
                {highestRatedInsight}
            </p>

            </div>

        </div>

        </div>

        {/* JOURNAL LIST */}
        <div>
        <h2 className="text-2xl font-bold mb-5">
            📝 Your Journals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {journals
                .filter(
                    (j) =>
                    j.thoughts ||
                    j.rating ||
                    j.favorite_ost ||
                    j.favorite_character
                )
                .map((j) => (
            <div
                key={j.id}
                onClick={() => setSelectedJournal(j)}
                className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.28)]"
            >

                {j.poster && (
                    <img
                    src={
                        j.poster?.startsWith("http")
                        ? j.poster
                        : `https://image.tmdb.org/t/p/w500${j.poster}`
                    }
                    alt={j.drama_name}
                    className="w-full h-72 object-cover"
                    />
                )}

                <div className="p-5">

                <h3 className="text-xl font-bold mb-2">
                    {j.drama_name}
                </h3>

                <p className="text-sm text-gray-400 mb-3">
                    Rating: {j.rating ? `${j.rating}/10` : "Not rated yet"}
                </p>

                <div className="flex flex-wrap gap-2">
                    {j.mood_tags?.map((mood: string) => (
                    <span
                        key={mood}
                        className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-200 text-xs"
                    >
                        {mood}
                    </span>
                    ))}
                </div>

                </div>
            </div>
            ))}

        </div>
        </div>

        <div className="space-y-12 mt-14">

        {/* PRIORITY QUEUE */}
        {priorityQueue.length > 0 && (
            <section>

            <div className="flex items-center gap-3 mb-5">
                <h2 className="text-3xl font-black">
                🌟 Priority Queue
                </h2>

                <div className="h-[1px] flex-1 bg-gradient-to-r from-pink-500/40 to-transparent" />
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">

                {priorityQueue.map((j) => (

                <div
                    key={j.id}
                    onClick={() => setSelectedJournal(j)}
                    className="min-w-[220px] w-[220px] bg-zinc-900 rounded-2xl overflow-hidden border border-pink-500/20 transition-all duration-500 hover:scale-[1.03] hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.25)] cursor-pointer"
                >

                    {j.poster && (
                    <img
                        src={
                        j.poster?.startsWith("http")
                            ? j.poster
                            : `https://image.tmdb.org/t/p/w500${j.poster}`
                        }
                        className="w-full h-[320px] min-h-[320px] object-cover"
                    />
                    )}

                    <div className="p-4">

                    <h3 className="font-bold text-lg line-clamp-1">
                        {j.drama_name}
                    </h3>

                    <p className="text-sm text-zinc-400 mt-2">
                        ⭐ {j.rating || "—"}
                    </p>

                    </div>

                </div>

                ))}

            </div>

            </section>
        )}

        {/* PLANNED */}
        {planned.length > 0 && (
        <section>

            <div className="flex items-center gap-3 mb-5">
            <h2 className="text-3xl font-black">
                📌 Planned
            </h2>

            <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/40 to-transparent" />
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">

            {planned.map((j) => (

                <div
                key={j.id}
                onClick={() => setSelectedJournal(j)}
                className="min-w-[220px] w-[220px] bg-zinc-900 rounded-2xl overflow-hidden border border-purple-500/20 transition-all duration-500 hover:scale-[1.03] hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] cursor-pointer"
                >

                {j.poster && (
                    <img
                    src={
                        j.poster?.startsWith("http")
                        ? j.poster
                        : `https://image.tmdb.org/t/p/w500${j.poster}`
                    }
                    className="w-full h-[320px] min-h-[320px] object-cover"
                    />
                )}

                <div className="p-4">

                    <h3 className="font-bold text-lg line-clamp-1">
                    {j.drama_name}
                    </h3>

                </div>

                </div>

            ))}

            </div>

        </section>
        )}

        {/* WATCHING */}
        {watching.length > 0 && (
            <section>

            <div className="flex items-center gap-3 mb-5">
                <h2 className="text-3xl font-black">
                🎬 Watching
                </h2>

                <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">

                {watching.map((j) => (

                <div
                    key={j.id}
                    onClick={() => setSelectedJournal(j)}
                    className="min-w-[220px] w-[220px] bg-zinc-900 rounded-2xl overflow-hidden border border-cyan-500/20 transition-all duration-500 hover:scale-[1.03] hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] cursor-pointer"
                >

                    {j.poster && (
                    <img
                        src={
                        j.poster?.startsWith("http")
                            ? j.poster
                            : `https://image.tmdb.org/t/p/w500${j.poster}`
                        }
                        className="w-full h-[320px] min-h-[320px] object-cover"
                    />
                    )}

                    <div className="p-4">
                    <h3 className="font-bold text-lg line-clamp-1">
                        {j.drama_name}
                    </h3>
                    </div>

                </div>

                ))}

            </div>

            </section>
        )}

        {/* COMPLETED */}
        {completed.length > 0 && (
            <section>

            <div className="flex items-center gap-3 mb-5">
                <h2 className="text-3xl font-black">
                ✅ Completed
                </h2>

                <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">

                {completed.map((j) => (

                <div
                    key={j.id}
                    onClick={() => setSelectedJournal(j)}
                    className="min-w-[220px] w-[220px] bg-zinc-900 rounded-2xl overflow-hidden border border-emerald-500/20 transition-all duration-500 hover:scale-[1.03] hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] cursor-pointer"
                >

                    {j.poster && (
                    <img
                        src={
                        j.poster?.startsWith("http")
                            ? j.poster
                            : `https://image.tmdb.org/t/p/w500${j.poster}`
                        }
                        className="w-full h-[320px] min-h-[320px] object-cover"
                    />
                    )}

                    <div className="p-4">
                    <h3 className="font-bold text-lg line-clamp-1">
                        {j.drama_name}
                    </h3>
                    </div>

                </div>

                ))}

            </div>

            </section>
        )}

        </div>

        {/* PROFILE MODAL */}
        {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-purple-950/40 to-black p-8 rounded-[2rem] w-[90%] max-w-md border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.12)] backdrop-blur-xl">

        {/* CINEMATIC LIGHT */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_35%)]" />

        {/* CLOSE BUTTON */}
        <button
        onClick={() => setShowProfileModal(false)}
        className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white cursor-pointer"
        >
        <span className="text-lg leading-none">✕</span>
        </button>

        <div className="relative z-10">

        {/* AVATAR */}
        <div className="flex flex-col items-center">

            <div className="relative">

            {/* GLOW */}
            <div className="absolute inset-0 rounded-full blur-2xl bg-pink-500/30 scale-110" />

            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">

                {profile?.profile_image_url ? (

                <img
                    src={profile.profile_image_url}
                    className="w-full h-full object-cover object-center"
                />

                ) : (

                <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-700 flex items-center justify-center text-5xl font-black">
                    {user?.email?.charAt(0).toUpperCase()}
                </div>

                )}

            </div>

            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight">
            {formattedUsername}
            </h2>

            <p className="text-zinc-400 text-sm mt-1">
            {user?.email}
            </p>

            <p className="text-pink-300/80 text-xs uppercase tracking-[0.3em] mt-3">
            Dramary Identity
            </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mt-8">

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
                Journals
            </p>

            <h3 className="text-2xl font-black mt-2">
                {totalJournals}
            </h3>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
                Favorites
            </p>

            <h3 className="text-2xl font-black mt-2">
                {totalFavorites}
            </h3>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
                Avg Rating
            </p>

            <h3 className="text-2xl font-black mt-2">
                {averageRating}
            </h3>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
                First Journal
            </p>

            <h3 className="text-sm font-bold mt-2">
                {firstJournalDate}
            </h3>
            </div>

        </div>

        {/* UPLOAD BUTTON */}
        <div className="mt-8 flex justify-center">

        <label
            className="inline-block px-5 py-3 rounded-2xl bg-pink-500/20 border border-pink-500/30 text-pink-200 text-sm cursor-pointer transition hover:bg-pink-500 hover:text-white hover:scale-[1.03] shadow-lg"
        >

            Change Profile Picture

            <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {

                const file = e.target.files?.[0];

                if (!file || !user) return;

                setUploading(true);

                const fileExt = file.name.split(".").pop();

                const filePath =
                `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } =
                await supabase.storage
                    .from("Avatars")
                    .upload(filePath, file);

                if (uploadError) {
                console.error(uploadError);
                setUploading(false);
                return;
                }

                const { data } = supabase.storage
                .from("Avatars")
                .getPublicUrl(filePath);

                const publicUrl = data.publicUrl;

                const { error: updateError } =
                await supabase
                    .from("profiles")
                    .update({
                    profile_image_url: publicUrl,
                    })
                    .eq("user_id", user.id);

                if (updateError) {
                console.error(updateError);
                setUploading(false);
                return;
                }

                setProfile((prev: any) => ({
                ...prev,
                profile_image_url: publicUrl,
                }));

                setUploading(false);

            }}
            />

        </label>

        </div>

        <div className="mt-6 flex justify-center">
        <button
            onClick={handleDeleteAccount}
            className="px-5 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm hover:bg-red-500 hover:text-white transition hover:scale-[1.03]"
        >
            Delete Account
        </button>
        </div>

        {/* LOADING */}
        {uploading && (
        <div className="mt-4 text-center text-sm text-zinc-400 animate-pulse">
            Uploading cinematic identity...
        </div>
        )}

        </div>

        </div>

        </div>
        )}

        {/*JOURNAL MODAL*/}
        {selectedJournal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

            <div className="bg-zinc-900 p-6 rounded-2xl w-[90%] max-w-4xl relative shadow-2xl">

            {/* CLOSE BUTTON */}
            <button
                onClick={() => setSelectedJournal(null)}
                className="absolute top-3 right-3 text-white text-xl hover:scale-110 transition"
            >
                ✕
            </button>

            <div className="flex gap-6">

                {/* POSTER */}
                {selectedJournal.poster && (
                <img
                    src={
                    selectedJournal.poster?.startsWith("http")
                        ? selectedJournal.poster
                        : `https://image.tmdb.org/t/p/w300${selectedJournal.poster}`
                    }
                    className="w-44 h-64 object-cover rounded-xl"
                />
                )}

                {/* DETAILS */}
                <div className="flex-1">

                <h2 className="text-3xl font-bold">
                    {selectedJournal.drama_name}
                </h2>

                <p className="text-sm text-zinc-400 mt-2">
                    {selectedJournal.rating
                        ? `Rating: ${selectedJournal.rating}/10`
                        : "Not rated yet"}
                    {" • "}
                    {selectedJournal.date || "No date"}
                </p>

                <p className="mt-4 text-zinc-300">
                    {selectedJournal.thoughts || "No thoughts added."}
                </p>

                {selectedJournal.overview && (
                    <p className="mt-3 text-zinc-500 text-sm">
                    {selectedJournal.overview}
                    </p>
                )}

                <p className="text-xs text-zinc-500 mt-3">
                    Cast:{" "}
                    {Array.isArray(selectedJournal.cast)
                    ? selectedJournal.cast.map((c: any) => c.name).join(", ")
                    : "—"}
                </p>

                {/* WATCH STATUS */}
                <div className="flex flex-wrap gap-3 mt-5">

                <button
                    onClick={() =>
                    updateWatchStatus(selectedJournal.id, "planned")
                    }
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                    selectedJournal.watch_status === "planned"
                        ? "bg-purple-500 text-white"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                >
                    📌 Planned
                </button>

                <button
                    onClick={() =>
                    updateWatchStatus(selectedJournal.id, "watching")
                    }
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                    selectedJournal.watch_status === "watching"
                        ? "bg-cyan-500 text-white"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                >
                    🎬 Watching
                </button>

                <button
                    onClick={() =>
                    updateWatchStatus(selectedJournal.id, "completed")
                    }
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                    selectedJournal.watch_status === "completed"
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                >
                    ✅ Completed
                </button>

                </div>

                {/* PRIORITY BUTTON */}
                <div className="flex flex-wrap gap-3 mt-5">

                {selectedJournal.watch_status !== "completed" && (
                    <button
                    onClick={() => togglePriority(selectedJournal.id)}
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                        selectedJournal.priority_watch
                        ? "bg-pink-500 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                    >
                    {selectedJournal.priority_watch
                        ? "⭐ Priority"
                        : "☆ Priority"}
                    </button>
                )}

                {!selectedJournal.rating && (
                    <Link
                    href={`/dashboard?title=${encodeURIComponent(
                        selectedJournal.drama_name || ""
                    )}&poster=${selectedJournal.poster}&overview=${encodeURIComponent(
                        selectedJournal.overview || ""
                    )}&cast=${encodeURIComponent(
                        JSON.stringify(selectedJournal.cast || [])
                    )}`}
                    >
                    <button className="px-4 py-2 rounded-xl text-sm bg-blue-500 hover:bg-blue-600 transition">
                        ✍ Add Journal
                    </button>
                    </Link>
                )}

                <button
                    onClick={() =>
                    removeFromWatchlist(selectedJournal.id)
                    }
                    className="px-4 py-2 rounded-xl text-sm bg-red-500 hover:bg-red-600 transition text-white"
                >
                    Remove
                </button>

                </div>

                <div className="mt-5 text-sm space-y-2 text-zinc-300">

                    <p>
                    🎵 OST: {selectedJournal.favorite_ost || "—"}
                    </p>

                    <p>
                    🎭 Character: {selectedJournal.favorite_character || "—"}
                    </p>

                    <p>
                    🎬 Scene: {selectedJournal.memorable_scene || "—"}
                    </p>

                    <p>
                    💭 Stayed With You:{" "}
                    {selectedJournal.what_stuck_with_you || "—"}
                    </p>

                    <p>
                    🧠 Ending Thoughts:{" "}
                    {selectedJournal.ending_thoughts || "—"}
                    </p>

                </div>

                </div>
            </div>

            </div>
        </div>
        )}

    </div>
    );
}