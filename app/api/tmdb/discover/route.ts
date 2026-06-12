import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  try {

    const API_KEY = process.env.TMDB_API_KEY;

    const genre = req.nextUrl.searchParams.get("genre");
    const type = req.nextUrl.searchParams.get("type");

    const res = await fetch(
      `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&with_genres=${genre}`
    );

    const data = await res.json();

    return NextResponse.json(data);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Discover failed" },
      { status: 500 }
    );

  }
}