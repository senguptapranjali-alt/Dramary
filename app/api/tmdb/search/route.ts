import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  try {

    const API_KEY = process.env.TMDB_API_KEY;

    const query =
      req.nextUrl.searchParams.get("query");

    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`
    );

    const data = await res.json();

    return NextResponse.json(data);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );

  }
}