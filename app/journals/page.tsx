"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/useAuth";
import Link from "next/link";

type Entry = {
  id: string;
  dramaName: string;
  rating: string;
  thoughts: string;
  favoriteOST: string;
  favoriteCharacter: string;
  memorableScene: string;
  whatStuckWithYou: string;
  endingThoughts: string;
  date: string;
  starred: boolean;
  poster?: string;
  overview?: string;
  cast?: any[];
  mood_tags?: string[];
  custom_tags?: string[];
};

export default function JournalsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [allMoodsSelected, setAllMoodsSelected] = useState(true);
  const [allCustomSelected, setAllCustomSelected] = useState(true);

  function toggleMood(mood: string) {
    setAllMoodsSelected(false);

    setSelectedMoods((prev) =>
      prev.includes(mood)
        ? prev.filter((m) => m !== mood)
        : [...prev, mood]
    );
  }

  function toggleCustomTag(tag: string) {
    setAllCustomSelected(false);

    setSelectedCustomTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }

  useEffect(() => {
    if (!user) return;   // 🔐 WAIT until user exists

    async function fetchEntries() {
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      const formattedEntries = data.map((e: any) => ({
        id: e.id,
        dramaName: e.drama_name,
        rating: e.rating,
        thoughts: e.thoughts,
        favoriteOST: e.favorite_ost,
        favoriteCharacter: e.favorite_character,
        memorableScene: e.memorable_scene,
        whatStuckWithYou: e.what_stuck_with_you,
        endingThoughts: e.ending_thoughts,
        date: e.date,
        starred: e.starred,
        poster: e.poster,
        overview: e.overview,
        cast: Array.isArray(e.cast) ? e.cast : [],
        mood_tags: e.mood_tags,
        custom_tags: e.custom_tags || [],
      }));

      setEntries(formattedEntries);
    }

    fetchEntries();
  }, [user]); // 🔥 IMPORTANT dependency

  // ✅ RESET INDEX WHEN SEARCH CHANGES (IMPORTANT FIX)
  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [searchQuery]);

  async function handleStar(id: string) {

    const entry = entries.find((e) => e.id === id);

    if (!entry) return;

    const { error } = await supabase
      .from("journals")
      .update({
        starred: !entry.starred,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to update favourite");
      return;
    }

    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, starred: !e.starred }
          : e
      )
    );
  }

  useEffect(() => {
    if (!loading && !user) {
      alert("Please login first");
      router.replace("/");
    }
  }, [user, loading]);

  async function handleDelete(id: string) {

    const ok = confirm("Delete this review?");
    if (!ok) return;

    const { error } = await supabase
      .from("journals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete");
      return;
    }

    setEntries((prev) =>
      prev.filter((e) => e.id !== id)
    );
  }

  function handleEdit(id: string) {
    router.push(`/dashboard?id=${id}`);
  }

  async function removeMoodTag(entryId: string, moodToRemove: string) {

    const entry = entries.find((e) => e.id === entryId);

    if (!entry) return;

    const updatedTags =
      (entry.mood_tags ?? []).filter(
        (tag) => tag !== moodToRemove
      );

    const { error } = await supabase
      .from("journals")
      .update({
        mood_tags: updatedTags,
      })
      .eq("id", entryId);

    if (error) {
      console.error(error);
      alert("Failed to remove tag");
      return;
    }

    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, mood_tags: updatedTags }
          : e
      )
    );
  }

  async function removeCustomTag(entryId: string, tagToRemove: string) {

    const entry = entries.find((e) => e.id === entryId);

    if (!entry) return;

    const updatedTags =
      (entry.custom_tags ?? []).filter(
        (tag) => tag !== tagToRemove
      );

    const { error } = await supabase
      .from("journals")
      .update({
        custom_tags: updatedTags,
      })
      .eq("id", entryId);

    if (error) {
      console.error(error);
      alert("Failed to remove custom tag");
      return;
    }

    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, custom_tags: updatedTags }
          : e
      )
    );
  }

  const actualJournalEntries = entries.filter(
    (e) =>
      e.thoughts ||
      e.rating ||
      e.favoriteOST ||
      e.favoriteCharacter ||
      e.memorableScene ||
      e.whatStuckWithYou ||
      e.endingThoughts
  );

  const starredEntries = actualJournalEntries.filter(
    (e) => e.starred
  );

  const normalEntries = actualJournalEntries.filter(
    (e) => !e.starred
  );

  const filterBySearch = (list: Entry[]) =>
    list.filter((e) => {
      const search = searchQuery.toLowerCase();

      const matchesSearch =
        e.dramaName.toLowerCase().includes(search) ||
        (e.mood_tags ?? []).some((tag) =>
          tag.toLowerCase().includes(search)
        ) ||
        (e.custom_tags ?? []).some((tag) =>
          tag.toLowerCase().includes(search)
        );

      const moods = e.mood_tags ?? [];
      const customs = e.custom_tags ?? [];

      const moodOk =
        allMoodsSelected ||
        selectedMoods.some((m) => moods.includes(m));

      const customOk =
        allCustomSelected ||
        selectedCustomTags.some((t) => customs.includes(t));

      const hasAnyFilter =
        (!allMoodsSelected || !allCustomSelected) ||
        selectedMoods.length > 0 ||
        selectedCustomTags.length > 0;

      if (!hasAnyFilter) return matchesSearch;

      return matchesSearch && moodOk && customOk;
    });

  const filteredStarred = filterBySearch(starredEntries);
  const filteredNormal = filterBySearch(normalEntries);

  const allMoods = Array.from(
    new Set(
      entries.flatMap((e) => e.mood_tags ?? [])
    )
  );

  const suggestions =
    searchQuery.trim() === ""
      ? []
      : entries
          .map((e) => e.dramaName)
          .filter((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5);

  function selectSuggestion(title: string) {
    setSearchQuery(title);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  }

  function renderEntryCard(entry: Entry) {
    return (
      <div
        onClick={() =>
          setSelectedEntry({
            ...entry,
            cast: Array.isArray(entry.cast) ? entry.cast : [],
          })
        }
        className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl cursor-pointer transition duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-pink-500/20 hover:border-pink-500/40"
      >
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStar(entry.id);
            }}
            className="text-3xl"
          >
            <span className={entry.starred ? "text-pink-500" : "text-zinc-500"}>
              {entry.starred ? "♥" : "♡"}
            </span>
          </button>
        </div>

        <h2 className="text-3xl font-bold">{entry.dramaName}</h2>

        {entry.poster && (
          <img
            src={`https://image.tmdb.org/t/p/w300${entry.poster}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPoster(entry.poster || null);
            }}
            className="rounded-xl mt-4 w-full max-w-xs cursor-pointer transition duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20"
          />
        )}

        <p className="text-sm text-zinc-400 mt-2">{entry.overview}</p>

        <p className="text-xs text-zinc-500 mt-2">
          Cast:{" "}
          {Array.isArray(entry.cast)
            ? entry.cast.map((c: any) => c.name).join(", ")
            : "—"}
        </p>

        <div className="flex justify-between mt-2 text-sm text-zinc-400">
          <p>Rating: {entry.rating}/10</p>
          <p>{entry.date}</p>
        </div>

        <p className="mt-4 text-zinc-300">{entry.thoughts}</p>

        {(entry.mood_tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">

            {(entry.mood_tags ?? []).map((mood: string) => (

              <div
                key={mood}
                className="group flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30"
              >

                <span>{mood}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMoodTag(entry.id, mood);
                  }}
                  className="hidden group-hover:block text-[10px] hover:text-red-400 transition"
                >
                  ✕
                </button>

              </div>

            ))}

          </div>
        )}

        {(entry.custom_tags ?? []).length > 0 && (

          <div className="flex flex-wrap gap-2 mt-3">

            {(entry.custom_tags ?? []).map((tag: string) => (

              <div
                key={tag}
                className="group flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >

                <span>#{tag}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomTag(entry.id, tag);
                  }}
                  className="hidden group-hover:block text-[10px] hover:text-red-400 transition"
                >
                  ✕
                </button>

              </div>

            ))}

          </div>

        )}

        <div className="mt-4 text-sm space-y-1 text-zinc-300">
          <p>🎵 OST: {entry.favoriteOST || "—"}</p>
          <p>🎭 Character: {entry.favoriteCharacter || "—"}</p>
          <p>🎬 Scene: {entry.memorableScene || "—"}</p>
          <p>💭 Stayed With You: {entry.whatStuckWithYou || "—"}</p>
          <p>🧠 Ending Thoughts: {entry.endingThoughts || "—"}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(entry.id);
            }}
            className="bg-red-500 px-4 py-2 rounded-xl"
          >
            Delete
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(entry.id);
            }}
            className="bg-blue-500 px-4 py-2 rounded-xl"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  const allCustomTags = Array.from(
    new Set(
      entries.flatMap((e) => e.custom_tags ?? [])
    )
  );


  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Loading your journals...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-950 text-white px-8 py-12 relative">

      <Link href="/journal">
        <button className="absolute top-6 left-6 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-sm hover:bg-zinc-800 transition">
          ← Back to Journal Hub
        </button>
      </Link>

      <h1 className="text-5xl font-bold text-center">
        Your Journals
      </h1>

      <div className="w-[90%] mx-auto mt-8">

        <input
          type="text"
          placeholder="Search your dramas..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (!suggestions.length) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveSuggestionIndex((p) =>
                p < suggestions.length - 1 ? p + 1 : 0
              );
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveSuggestionIndex((p) =>
                p > 0 ? p - 1 : suggestions.length - 1
              );
            }

            if (e.key === "Enter" && activeSuggestionIndex >= 0) {
              e.preventDefault();
              selectSuggestion(suggestions[activeSuggestionIndex]);
            }
          }}
          className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
        />

        {showSuggestions && searchQuery.trim() !== "" && suggestions.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-700 mt-2 rounded-xl overflow-hidden">
            {suggestions.map((title, idx) => (
              <div
                key={title}
                onClick={() => selectSuggestion(title)}
                className={`px-4 py-2 cursor-pointer ${
                  idx === activeSuggestionIndex
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800"
                }`}
              >
                {title}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-[90%] mx-auto mt-5 flex flex-wrap gap-3">

      <button
        onClick={() => {
          setSelectedMoods([]);
          setAllMoodsSelected(true);
        }}
        className={`px-4 py-2 rounded-full border transition ${
          allMoodsSelected
            ? "bg-pink-500 text-white border-pink-500"
            : "bg-zinc-900 border-zinc-700 text-zinc-300"
        }`}
      >
        All
      </button>

        {allMoods.map((mood) => (
          <button
            key={mood}
            onClick={() => toggleMood(mood)}
            className={`px-4 py-2 rounded-full border transition ${
              selectedMoods.includes(mood)
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-zinc-900 border-zinc-700 text-zinc-300"
            }`}
          >
            {mood}
          </button>
        ))}

      </div>

      {allCustomTags.length > 0 && (

        <div className="w-[90%] mx-auto mt-4 flex flex-wrap gap-2">

        <button
          onClick={() => {
            setSelectedCustomTags([]);
            setAllCustomSelected(true);
          }}
          className={`px-3 py-1 rounded-full text-sm border transition ${
            allCustomSelected
              ? "bg-white text-black"
              : "bg-zinc-900 border-zinc-700 text-zinc-300"
          }`}
        >
          All Tags
        </button>

          {allCustomTags.map((tag) => (

            <button
              key={tag}
              onClick={() => toggleCustomTag(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                selectedCustomTags.includes(tag)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              #{tag}
            </button>

          ))}

        </div>

      )}

      <div className="w-[90%] mx-auto mt-12">

        {starredEntries.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-6">🩷 Favourites</h2>
            <div className="space-y-6">
              {filteredStarred.map((e) => (
                <div key={e.id}>{renderEntryCard(e)}</div>
              ))}
            </div>
          </>
        )}

        <h2 className="text-3xl font-bold mt-10 mb-6">
          All Journals
        </h2>

        <div className="space-y-6">
          {filteredNormal.length === 0 ? (
            <p className="text-zinc-500 text-center mt-10">
              No journals found. Start writing your first emotional memory ✨
            </p>
          ) : (
            filteredNormal.map((e) => (
              <div key={e.id}>{renderEntryCard(e)}</div>
            ))
          )}
        </div>

      </div>

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          
          <div className="bg-zinc-900 p-6 rounded-2xl w-[90%] max-w-4xl relative shadow-2xl">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-3 right-3 text-white text-xl hover:scale-110 transition"
            >
              ✕
            </button>

            <div className="flex gap-6">

              {/* LEFT - POSTER */}
              {selectedEntry.poster && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${selectedEntry.poster}`}
                  className="w-44 h-64 object-cover rounded-xl"
                />
              )}

              {/* RIGHT - DETAILS */}
              <div className="flex-1">

                {/* TITLE */}
                <h2 className="text-3xl font-bold">
                  {selectedEntry.dramaName}
                </h2>

                {/* META */}
                <p className="text-sm text-zinc-400 mt-2">
                  Rating: {selectedEntry.rating}/10 • {selectedEntry.date}
                </p>

                {/* THOUGHTS */}
                <p className="mt-4 text-zinc-300">
                  {selectedEntry.thoughts || "No thoughts added."}
                </p>

                {/* OVERVIEW */}
                {selectedEntry.overview && (
                  <p className="mt-3 text-zinc-500 text-sm">
                    {selectedEntry.overview}
                  </p>
                )}

                {/* CAST */}
                <p className="text-xs text-zinc-500 mt-3">
                  Cast:{" "}
                  {Array.isArray(selectedEntry.cast) && selectedEntry.cast.length > 0
                    ? selectedEntry.cast.map((c: any) => c.name).join(", ")
                    : "—"}
                </p>

                {/* EXTRA DETAILS */}
                <div className="mt-5 text-sm space-y-2 text-zinc-300">

                  <p>🎵 OST: {selectedEntry.favoriteOST || "—"}</p>
                  <p>🎭 Character: {selectedEntry.favoriteCharacter || "—"}</p>
                  <p>🎬 Scene: {selectedEntry.memorableScene || "—"}</p>
                  <p>💭 Stayed With You: {selectedEntry.whatStuckWithYou || "—"}</p>
                  <p>🧠 Ending Thoughts: {selectedEntry.endingThoughts || "—"}</p>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {selectedPoster && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedPoster(null)}
        >
          <img
            src={`https://image.tmdb.org/t/p/w500${selectedPoster}`}
            className="max-h-[90vh] rounded-xl shadow-2xl"
          />
        </div>
      )}

    </main>
  );
}