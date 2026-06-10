type TrendingItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
};

type Props = {
  item: TrendingItem;
  onClick: () => void;
};

export default function DiscoverCard({
  item,
  onClick,
}: Props) {

  return (
    <div
      onClick={onClick}
      className="min-w-[220px] w-[220px] snap-start bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-pink-500/40 transition duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/10 cursor-pointer"
    >

      {/* POSTER */}
      <img
        src={
          item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : "/placeholder-poster.png"
        }
        alt={item.title || item.name || "poster"}
        className="w-full h-[320px] min-h-[320px] object-cover bg-zinc-800"
      />

      {/* INFO */}
      <div className="p-4">

        <h3 className="font-bold text-lg line-clamp-1">
          {item.title || item.name}
        </h3>

        <div className="flex justify-between mt-3 text-sm text-zinc-400">

          <p>
            ⭐ {item.vote_average?.toFixed(1)}
          </p>

          <p>
            {(item.release_date || item.first_air_date || "").slice(0,4)}
          </p>

        </div>

      </div>

    </div>
  );
}