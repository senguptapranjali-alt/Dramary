"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/useAuth";
import { getMoodTags } from "@/app/lib/getMoodTags";
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
  custom_tags?: string[];
};

export default function DashboardPage() {
  const [dramaName, setDramaName] = useState("");
  const [rating, setRating] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [favoriteOST, setFavoriteOST] = useState("");
  const [favoriteCharacter, setFavoriteCharacter] = useState("");
  const [memorableScene, setMemorableScene] = useState("");
  const [whatStuckWithYou, setWhatStuckWithYou] = useState("");
  const [endingThoughts, setEndingThoughts] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [dramaMeta, setDramaMeta] = useState({
    poster: "",
    overview: "",
    cast: [] as any[],
  });
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [customTagInput, setCustomTagInput] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tmdbId, setTmdbId] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      alert("Please login first");
      router.replace("/");
    }
  }, [user, loading]);

  // Load edit entry (by ID)
  useEffect(() => {

    if (loading || !user) return;

    async function loadEditEntry() {

      const storedEditId = searchParams.get("id");

      if (!storedEditId) return;

      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("id", storedEditId)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (!data) {
        console.warn("No entry found for ID:", storedEditId);
        return;
      }

      setDramaName(data.drama_name);
      setRating(data.rating);
      setThoughts(data.thoughts);
      setFavoriteOST(data.favorite_ost);
      setFavoriteCharacter(data.favorite_character);
      setMemorableScene(data.memorable_scene);
      setWhatStuckWithYou(data.what_stuck_with_you);
      setEndingThoughts(data.ending_thoughts);
      setCustomTags(data.custom_tags || []);
      setEditId(storedEditId);
      setTmdbId(data.tmdb_id);
      setMediaType(data.media_type || "");
      setDramaMeta({
        poster: data.poster || "",
        overview: data.overview || "",
        cast: data.cast || [],
      });
    }

    loadEditEntry();

  }, [user, loading]);

  useEffect(() => {

    const title = searchParams.get("title");
    const poster = searchParams.get("poster");
    const overview = searchParams.get("overview");
    const castParam = searchParams.get("cast");
    const tmdbParam = searchParams.get("tmdb_id");
    const mediaTypeParam = searchParams.get("media_type");

    if (title) {
      setDramaName(title);
    }

    if (tmdbParam) {
      setTmdbId(Number(tmdbParam));
    }

    if (mediaTypeParam) {
      setMediaType(mediaTypeParam);
    }

    if (poster || overview || castParam) {

      setDramaMeta((prev: any) => ({
        ...prev,
        poster,
        overview,
        cast: castParam
          ? JSON.parse(decodeURIComponent(castParam))
          : [],
      }));

    }

  }, []);

  async function fetchDramaMeta(title: string) {

    try {

      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(title)}`
      );

      const searchData = await searchRes.json();

      const bestMatch = searchData.results?.find(
        (item: any) =>
          item.media_type === "movie" ||
          item.media_type === "tv"
      );

      if (!bestMatch) return null;

      const mediaType = bestMatch.media_type;

      const creditsRes = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${bestMatch.id}/credits?api_key=${API_KEY}`
      );

      const creditsData = await creditsRes.json();

      return {

        tmdb_id: bestMatch.id,
        media_type: mediaType,
        poster: bestMatch.poster_path,
        overview: bestMatch.overview,

        cast: (creditsData.cast || []).slice(0, 8),

      };

    } catch (err) {

      console.error("TMDB metadata fetch failed:", err);
      return null;

    }
  }

  function addCustomTag() {

    const trimmed = customTagInput.trim().toLowerCase();

    if (!trimmed) return;

    if (customTags.includes(trimmed)) return;

    setCustomTags((prev) => [...prev, trimmed]);

    setCustomTagInput("");
  }

  function removeCustomTag(tagToRemove: string) {

    setCustomTags((prev) =>
      prev.filter((tag) => tag !== tagToRemove)
    );
  }

  async function handleSave() {
    if (
      dramaName.trim() === "" ||
      rating.trim() === "" ||
      thoughts.trim() === ""
    ) {
      alert("Please fill required fields!");
      return;
    }

    if (editId) {

    let finalTmdbId = tmdbId;
    let finalMediaType = mediaType;

    let finalPoster = dramaMeta.poster;
    let finalOverview = dramaMeta.overview;
    let finalCast = dramaMeta.cast;

    if (!finalTmdbId && dramaName.trim() !== "") {

      const fetchedMeta =
        await fetchDramaMeta(dramaName);

      if (fetchedMeta) {

        finalTmdbId = fetchedMeta.tmdb_id;
        finalMediaType = fetchedMeta.media_type;

        finalPoster = fetchedMeta.poster;
        finalOverview = fetchedMeta.overview;
        finalCast = fetchedMeta.cast;

      }

    }

      const moods = getMoodTags(thoughts);
      const { error } = await supabase
        .from("journals")
        .update({
          drama_name: dramaName,
          rating,
          thoughts,
          favorite_ost: favoriteOST,
          favorite_character: favoriteCharacter,
          memorable_scene: memorableScene,
          what_stuck_with_you: whatStuckWithYou,
          ending_thoughts: endingThoughts,
          mood_tags: moods,
          custom_tags: customTags,
          tmdb_id: finalTmdbId,
          media_type: finalMediaType,
          poster: finalPoster,
          overview: finalOverview,
          cast: finalCast,
          watch_status: "completed",
        })
        .eq("id", editId);

        if (error) {
          console.error("Supabase save error FULL:", JSON.stringify(error, null, 2));
          alert(error.message || "Failed to save entry");
          return;
        }

    } else {

      let finalTmdbId = tmdbId;
      let finalMediaType = mediaType;

      let finalPoster = dramaMeta.poster;
      let finalOverview = dramaMeta.overview;
      let finalCast = dramaMeta.cast;

      if (!finalTmdbId && dramaName.trim() !== "") {

        const fetchedMeta =
          await fetchDramaMeta(dramaName);

        if (fetchedMeta) {

          finalTmdbId = fetchedMeta.tmdb_id;
          finalMediaType = fetchedMeta.media_type;

          finalPoster = fetchedMeta.poster;
          finalOverview = fetchedMeta.overview;
          finalCast = fetchedMeta.cast;

        }

      }

      const moods = getMoodTags(thoughts);
      const { error } = await supabase
        .from("journals")
        .upsert(
          [
            {
              drama_name: dramaName,
              rating,
              thoughts,
              favorite_ost: favoriteOST,
              favorite_character: favoriteCharacter,
              memorable_scene: memorableScene,
              what_stuck_with_you: whatStuckWithYou,
              ending_thoughts: endingThoughts,
              date: new Date().toLocaleDateString(),
              starred: false,
              poster: finalPoster,
              overview: finalOverview,
              cast: finalCast,
              user_id: user.id,
              mood_tags: moods,
              custom_tags: customTags,
              tmdb_id: finalTmdbId,
              media_type: finalMediaType,
              watch_status: "completed",
            },
          ],
          {
            onConflict: "user_id,tmdb_id",
          }
        );

        if (error) {
          console.error("Supabase save error FULL:", JSON.stringify(error, null, 2));
          alert(error.message || "Failed to save entry");
          return;
        }
    }

    setEditId(null);

    setDramaName("");
    setRating("");
    setThoughts("");
    setFavoriteOST("");
    setFavoriteCharacter("");
    setMemorableScene("");
    setWhatStuckWithYou("");
    setEndingThoughts("");
    setCustomTags([]);
    setCustomTagInput("");

    router.push("/journals");
  }

  async function fetchDramaInfo(title: string) {
    if (!title) return;

    try {
      const [tvRes, movieRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(title)}`),
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}`)
      ]);

      const tvData = await tvRes.json();
      const movieData = await movieRes.json();

      const combined = [...(tvData.results || []), ...(movieData.results || [])];

      const firstResult = combined[0];

      if (!firstResult) return;

      const isMovie = !!firstResult.title;

      const detailsRes = await fetch(
        isMovie
          ? `https://api.themoviedb.org/3/movie/${firstResult.id}?api_key=${API_KEY}&append_to_response=credits`
          : `https://api.themoviedb.org/3/tv/${firstResult.id}?api_key=${API_KEY}&append_to_response=credits`
      );

      const details = await detailsRes.json();

      setDramaMeta({
        poster: firstResult.poster_path || "",
        overview: firstResult.overview || "",
        cast: details.credits?.cast?.slice(0, 5) || [],
      });

    } catch (err) {
      console.error("Error fetching drama:", err);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-8 py-12 relative">

      <Link href="/journal">
        <button className="absolute top-6 left-6 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-sm hover:bg-zinc-800 transition">
          ← Back to Journal Hub
        </button>
      </Link>

      <h1 className="text-5xl font-bold text-center">
        Dramary Dashboard
      </h1>

      <p className="text-zinc-400 text-center mt-4 text-lg">
        Document the stories that stayed with you.
      </p>

      <div className="mt-12 bg-zinc-900 p-10 rounded-3xl w-[90%] mx-auto">

        <h2 className="text-3xl font-bold mb-6">
          {editId ? "Edit Journal Entry" : "Add Journal Entry"}
        </h2>

        <div className="flex flex-col gap-5">

        <input
          type="text"
          value={dramaName}
          placeholder="Drama Name"
          onChange={(e) => {
            const value = e.target.value;
            setDramaName(value);

            // small delay to avoid too many API calls
            setTimeout(() => {
              fetchDramaInfo(value);
            }, 500);
          }}
          className="bg-zinc-800 p-4 rounded-xl outline-none w-full"
        />

          <input
            type="text"
            placeholder="Rating /10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="bg-zinc-800 p-4 rounded-xl w-full"
          />

          <textarea
            placeholder="What did you feel about this drama?"
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            className="bg-zinc-800 p-4 rounded-xl h-40 w-full"
          />

          <input
            type="text"
            placeholder="Favorite OST"
            value={favoriteOST}
            onChange={(e) => setFavoriteOST(e.target.value)}
            className="bg-zinc-800 p-4 rounded-xl w-full"
          />

          <input
            type="text"
            placeholder="Favorite Character"
            value={favoriteCharacter}
            onChange={(e) => setFavoriteCharacter(e.target.value)}
            className="bg-zinc-800 p-4 rounded-xl w-full"
          />

          <input
            type="text"
            placeholder="Most Memorable Scene"
            value={memorableScene}
            onChange={(e) => setMemorableScene(e.target.value)}
            className="bg-zinc-800 p-4 rounded-xl w-full"
          />

          <textarea
            placeholder="What stayed with you the most?"
            value={whatStuckWithYou}
            onChange={(e) => setWhatStuckWithYou(e.target.value)}
            className="bg-zinc-800 p-4 rounded-xl h-24 w-full"
          />

          <textarea
            placeholder="Ending Thoughts"
            value={endingThoughts}
            onChange={(e) => setEndingThoughts(e.target.value)}
            className="bg-zinc-800 p-4 rounded-xl h-24 w-full"
          />

          <div className="bg-zinc-800 p-4 rounded-xl">

            <p className="text-sm text-zinc-400 mb-3">
              Custom Tags
            </p>

            <div className="flex gap-2">

              <input
                type="text"
                placeholder="Add custom tag..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                className="flex-1 bg-zinc-900 p-3 rounded-xl"
              />

              <button
                onClick={addCustomTag}
                className="bg-zinc-500 px-4 rounded-xl hover:bg-pink-400 transition"
              >
                Add
              </button>

            </div>

            <div className="flex flex-wrap gap-2 mt-4">

              {customTags.map((tag) => (

                <div
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-sm"
                >

                  <span>{tag}</span>

                  <button
                    onClick={() => removeCustomTag(tag)}
                    className="text-xs hover:text-red-400"
                  >
                    ✕
                  </button>

                </div>

              ))}

            </div>

          </div>

          {dramaMeta.poster && (
            <div className="mt-6 p-4 bg-zinc-800 rounded-2xl">
              
              <h3 className="text-xl font-bold mb-3">
                Live Drama Preview
              </h3>

              <div className="flex gap-4">
                
                {/* Poster */}
                <img
                  src={`https://image.tmdb.org/t/p/w300${dramaMeta.poster}`}
                  className="w-32 rounded-xl"
                />

                {/* Info */}
                <div>
                  <p className="text-sm text-zinc-300">
                    {dramaMeta.overview || "No description available."}
                  </p>

                  <div className="mt-2 text-xs text-zinc-400">
                    Cast: {dramaMeta.cast?.map((c: any) => c.name).join(", ")}
                  </div>
                </div>

              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            className="bg-white text-black py-4 rounded-xl font-semibold hover:scale-105 active:scale-95 transition"
          >
            {editId ? "Update Entry" : "Save Entry"}
          </button>

        </div>

      </div>

    </main>
  );
}