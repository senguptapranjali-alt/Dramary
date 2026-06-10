"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/useAuth";
import DiscoverCard from "@/components/DiscoverCard";
import DiscoverModal from "@/components/DiscoverModal";
import { supabase } from "@/app/lib/supabase";

type TrendingItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  overview?: string;
  first_air_date?: string;
  release_date?: string;
};

export default function DiscoverPage() {

  const [trending, setTrending] = useState<TrendingItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<TrendingItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<TrendingItem | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { user } = useAuth();
    const [genreSections, setGenreSections] = useState<
      Record<string, TrendingItem[]>
    >({});
    const [recommended, setRecommended] = useState<TrendingItem[]>([]);

  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const genres = [
    { name: "Romance", id: 10749 },
    { name: "Comedy", id: 35 },
    { name: "Thriller", id: 53 },
    { name: "Action", id: 28 },
    { name: "Mystery", id: 9648 },
    { name: "Sci-Fi", id: 878 },
    { name: "Drama", id: 18 },
    { name: "Fantasy", id: 14 },
    { name: "Animation", id: 16 },
  ];
  const storageKey =
  `dramary_recent_searches_${user?.id}`;

  function saveRecentSearch(search: string) {

    if (!search.trim()) return;

    if (recentSearches.includes(search)) return;

    const updated = [
      search,
      ...recentSearches,
    ].slice(0, 6);

    setRecentSearches(updated);

    if (!user) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify(updated)
    );
  }

  useEffect(() => {

    async function fetchTrending() {

      try {

        const [tvRes, movieRes] = await Promise.all([

          fetch(
            `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}`
          ),

          fetch(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`
          ),

        ]);

        const tvData = await tvRes.json();
        const movieData = await movieRes.json();

        const combined = [
          ...(tvData.results || []),
          ...(movieData.results || []),
        ];

        setTrending(combined);

      } catch (err) {

        console.error("Failed to fetch trending:", err);

      }
    }

    async function fetchGenres() {

      try {

        const sectionData: Record<string, TrendingItem[]> = {};

        for (const genre of genres) {

          const [movieRes, tvRes] = await Promise.all([

            fetch(
              `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genre.id}`
            ),

            fetch(
              `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genre.id}`
            ),

          ]);

          const movieData = await movieRes.json();
          const tvData = await tvRes.json();

          sectionData[genre.name] = [

            ...(movieData.results || []),

            ...(tvData.results || []),

          ];

        }

        setGenreSections(sectionData);

      } catch (err) {

        console.error("Genre fetch failed:", err);

      }
    }

    fetchTrending();
    fetchGenres();

  }, []);

  useEffect(() => {

    async function fetchRecommendations() {

      if (!user) return;

      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user.id);

      if (error || !data) {
        console.error(error);
        return;
      }

      let baseEntry = null;

      // PRIORITY 1 → favourites
      const favourites =
        data.filter((e) => e.starred);

      if (favourites.length > 0) {

        baseEntry = favourites[0];

      } else {

        // PRIORITY 2 → highest rated
        const sorted = [...data].sort(
          (a, b) =>
            Number(b.rating) - Number(a.rating)
        );

        baseEntry = sorted[0];

      }

      // FALLBACK → generic trending
      if (!baseEntry?.tmdb_id || !baseEntry?.media_type) {

        setRecommended(
          trending.slice(0, 10)
        );

        return;

      }

      try {

        const recRes = await fetch(
          `https://api.themoviedb.org/3/${baseEntry.media_type}/${baseEntry.tmdb_id}/recommendations?api_key=${API_KEY}`
        );

        const recData = await recRes.json();

        setRecommended(
          recData.results || []
        );

      } catch (err) {

        console.error(err);

      }

    }

    fetchRecommendations();

  }, [user, trending]);

    useEffect(() => {

    async function searchTitles() {

        if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
        }

        setIsSearching(true);

        try {

        const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${searchQuery}`
        );

        const data = await res.json();

        setSearchResults(data.results || []);
        setIsSearching(false);

        } catch (err) {

        console.error("Search failed:", err);
        setIsSearching(false);

        }
    }

    const timeout = setTimeout(searchTitles, 400);

    return () => clearTimeout(timeout);

    }, [searchQuery]);

    useEffect(() => {

      if (!user) return;

      const stored = localStorage.getItem(storageKey);

      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }

    }, [user, storageKey]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-950 text-white px-8 py-12">

      {/* BACK BUTTON */}
      <Link href="/journal">
        <button className="absolute top-6 left-6 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-sm hover:bg-zinc-800 transition">
          ← Back to Journal Hub
        </button>
      </Link>

      {/* HERO */}
      <div className="text-center mt-10">

        <h1 className="text-6xl font-bold">
          Discover Worlds Beyond Reality
        </h1>

        <p className="text-zinc-400 mt-4 text-lg">
          Find your next favorite story.
        </p>

      </div>

      <div className="max-w-2xl mx-auto mt-12">

        <input
            type="text"
            placeholder="Search dramas, movies, actors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {

              if (e.key === "Enter") {
                saveRecentSearch(searchQuery);
              }

            }}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-4 text-lg outline-none focus:border-pink-500 transition"
        />

      </div>

      {recentSearches.length > 0 && searchQuery.trim() === "" && (

        <div className="max-w-2xl mx-auto mt-4">

          <p className="text-sm text-zinc-500 mb-3">
            Recent Searches
          </p>

          <div className="flex flex-wrap gap-3">

          {recentSearches.map((search) => (

            <div
              key={search}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition"
            >

              <button
                onClick={() => setSearchQuery(search)}
              >
                {search}
              </button>

              <button
                onClick={() => {

                  const updated =
                    recentSearches.filter(
                      (s) => s !== search
                    );

                  setRecentSearches(updated);

                  if (!user) return;
                  localStorage.setItem(
                    storageKey,
                    JSON.stringify(updated)
                  );

                }}
                className="hidden group-hover:block text-xs text-zinc-500 hover:text-red-400 transition"
              >
                ✕
              </button>

            </div>

          ))}

          </div>

        </div>

      )}

      {searchQuery.trim() !== "" && (

        <section className="mt-16">

          <h2 className="text-3xl font-bold mb-6">
            🔎 Search Results
          </h2>

          {isSearching ? (

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
              Searching...
            </div>

          ) : searchResults.length === 0 ? (

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
              Sorry, no match found.
            </div>

          ) : (

            <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide">

              {searchResults.map((item) => (

                <DiscoverCard
                  key={item.id}
                  item={item}
                  onClick={() => {

                    setSelectedItem(item);

                    saveRecentSearch(
                      item.title || item.name || ""
                    );

                  }}
                />

              ))}

            </div>

          )}

        </section>

      )}

      {/* MADE FOR YOU */}
      <section className="mt-20">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-3xl font-bold">
            ✨ Made For You
          </h2>

        </div>

        <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">

          {recommended.map((item) => (

            <DiscoverCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />

          ))}

        </div>

      </section>

      {/* TRENDING */}
      <section className="mt-20">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-3xl font-bold">
            🔥 Trending Now
          </h2>

        </div>

        <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">

          {trending.map((item) => (

            <DiscoverCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />

          ))}

        </div>

      </section>

      {Object.entries(genreSections).map(([genreName, items]) => (

        <section key={genreName} className="mt-20">

          <h2 className="text-3xl font-bold mb-6">
            {genreName}
          </h2>

          <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">

            {items.map((item) => (

              <DiscoverCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />

            ))}

          </div>

        </section>

      ))}

      {/* MODAL */}
      <DiscoverModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

    </main>
  );
}