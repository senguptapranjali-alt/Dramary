import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  try {

    const API_KEY = process.env.TMDB_API_KEY;

    const title =
      req.nextUrl.searchParams.get("title");

    if (!title) {

      return NextResponse.json(
        { error: "Missing title" },
        { status: 400 }
      );

    }

    const [tvRes, movieRes] = await Promise.all([

      fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(title)}`
      ),

      fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}`
      ),

    ]);

    const tvData = await tvRes.json();
    const movieData = await movieRes.json();

    const combined = [
      ...(tvData.results || []),
      ...(movieData.results || []),
    ];

    const firstResult = combined[0];

    if (!firstResult) {

      return NextResponse.json({
        poster: "",
        overview: "",
        cast: [],
      });

    }

    const isMovie =
      !!firstResult.title;

    const detailsRes = await fetch(

      isMovie

        ? `https://api.themoviedb.org/3/movie/${firstResult.id}?api_key=${API_KEY}&append_to_response=credits`

        : `https://api.themoviedb.org/3/tv/${firstResult.id}?api_key=${API_KEY}&append_to_response=credits`

    );

    const details =
      await detailsRes.json();

    return NextResponse.json({

    tmdb_id: firstResult.id,

    media_type:
        isMovie ? "movie" : "tv",

    poster:
        firstResult.poster_path || "",

    overview:
        firstResult.overview || "",

    cast:
        details.credits?.cast?.slice(0, 5) || [],

    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Preview failed" },
      { status: 500 }
    );

  }
}