import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  try {

    const API_KEY = process.env.TMDB_API_KEY;

    const tmdbId =
      req.nextUrl.searchParams.get("tmdbId");

    const mediaType =
      req.nextUrl.searchParams.get("mediaType");

    const res = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/recommendations?api_key=${API_KEY}`
    );

    const data = await res.json();

    return NextResponse.json(data);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Recommendations failed" },
      { status: 500 }
    );

  }
}