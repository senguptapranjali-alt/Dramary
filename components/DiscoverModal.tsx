import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/useAuth";

type TrendingItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
};

type Props = {
  item: TrendingItem | null;
  onClose: () => void;
};

export default function DiscoverModal({
  item,
  onClose,
}: Props) {

    const [trailerKey, setTrailerKey] = useState("");
    const [cast, setCast] = useState<any[]>([]);
    const { user } = useAuth();

    const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;

    const [isAdding, setIsAdding] = useState(false);
    const [isAlreadyAdded, setIsAlreadyAdded] = useState(false);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {

      if (!item) return;
      setTrailerKey("");

    async function fetchTrailer() {

      try {

        const mediaType =
          item?.title ? "movie" : "tv";

        const res = await fetch(

          `/api/tmdb/modal?id=${item?.id}&mediaType=${mediaType}`

        );

        const data = await res.json();

        if (data.trailerKey) {

          setTrailerKey(
            data.trailerKey
          );

        }

        setCast(data.cast || []);

      } catch (err) {

        console.error(
          "Trailer fetch failed:",
          err
        );

      }
    }

      fetchTrailer();

    }, [item]);

    useEffect(() => {
      if (!user || !item) return;

      async function checkExisting() {
        const { data, error } = await supabase
          .from("journals")
          .select("id")
          .eq("user_id", user.id)
          .eq("tmdb_id", item?.id)
          .maybeSingle();

        if (error) {
          console.error(error);
          return;
        }

        setIsAlreadyAdded(!!data);
      }

      checkExisting();
    }, [user, item?.id]);

    async function handleAddToWatchlist() {
      if (!user || !item) return;

      setIsAdding(true);
      setFeedback("");

      try {
        const { error } = await supabase.from("journals").insert({
          user_id: user.id,
          drama_name: item.title || item.name,
          tmdb_id: item.id,
          poster: item.poster_path,
          overview: item.overview,
          cast,
          watch_status: "planned",
          priority_watch: false,
          media_type: item.media_type || (item.title ? "movie" : "tv"),
        });

        if (error) {
          console.log("INSERT ERROR:", error);

          // 🔥 DUPLICATE HANDLING (from unique constraint)
          if (error.code === "23505") {
            setIsAlreadyAdded(true);
            setFeedback("Already in your watchlist");
            return;
          }

          setFeedback("Failed to add. Try again.");
          return;
        }

        // ✅ SUCCESS STATE
        setIsAlreadyAdded(true);
        setFeedback("Added to watchlist!");
      } catch (err) {
        console.error("Unexpected error:", err);
        setFeedback("Something went wrong");
      } finally {
        setIsAdding(false);

        // optional: auto-clear message
        setTimeout(() => setFeedback(""), 2000);
      }
    }

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto px-4 py-6">

      <div className="bg-zinc-900 rounded-3xl overflow-hidden max-w-5xl w-full relative border border-zinc-800 shadow-2xl mx-auto my-auto max-h-[95vh] overflow-y-auto">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/60 px-3 py-1 rounded-full hover:bg-black transition"
        >
          ✕
        </button>

        {/* BACKDROP */}
        {item.backdrop_path && (

          <div className="relative h-64 w-full">

            <img
              src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>

          </div>

        )}

        {/* CONTENT */}
        <div className="p-4 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8">

          {/* POSTER */}
          {item.poster_path && (

            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              className="w-40 sm:w-56 rounded-2xl shadow-xl mx-auto md:mx-0"
            />

          )}

          {/* DETAILS */}
          <div className="flex-1">

            <h2 className="text-2xl sm:text-4xl font-bold text-center md:text-left">
              {item.title || item.name}
            </h2>

            <div className="flex gap-6 mt-4 text-zinc-400 text-sm justify-center md:justify-start">

              <p>
                ⭐ {item.vote_average?.toFixed(1)}
              </p>

              <p>
                {(item.release_date ||
                  item.first_air_date ||
                  "").slice(0,4)}
              </p>

            </div>

            {/* OVERVIEW */}
            <p className="mt-6 text-zinc-300 leading-relaxed">
              {item.overview || "No description available."}
            </p>

            {/* CAST */}
            <p className="mt-5 text-sm text-zinc-400">
              Cast:{" "}
              {cast.length > 0
                ? cast.map((c) => c.name).join(", ")
                : "—"}
            </p>

            {/* BUTTONS */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">

            <button
              onClick={handleAddToWatchlist}
              disabled={isAdding || isAlreadyAdded}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2
                ${
                  isAlreadyAdded
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-pink-500 hover:bg-pink-600"
                }
                ${isAdding ? "opacity-70 cursor-wait" : ""}
              `}
            >
              {isAdding
                ? "Adding..."
                : isAlreadyAdded
                ? "✔ Already Added"
                : "+ Add to Watchlist"}
            </button>

                <Link
                href={`/dashboard?title=${encodeURIComponent(item.title || item.name || "")}&poster=${item.poster_path}&overview=${encodeURIComponent(item.overview || "")}&tmdb_id=${item.id}&media_type=${item.media_type || (item.title ? "movie" : "tv")}&cast=${encodeURIComponent(JSON.stringify(cast))}`}
                >
                <button className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl font-semibold transition">
                    Add Journal
                </button>
                </Link>

                {trailerKey && (

                  <button
                    onClick={() => {

                      window.open(
                        `https://www.youtube.com/watch?v=${trailerKey}`,
                        "_blank"
                      );

                    }}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl font-semibold transition"
                  >
                    ▶ Watch Trailer
                  </button>

                )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}