import { NextResponse } from "next/server";

export async function GET() {
  try {

    const API_KEY = process.env.TMDB_API_KEY;

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

    return NextResponse.json({
      results: [
        ...(tvData.results || []),
        ...(movieData.results || []),
      ],
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch trending" },
      { status: 500 }
    );

  }
}