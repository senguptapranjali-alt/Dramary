import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  try {

    const API_KEY = process.env.TMDB_API_KEY;

    const id =
      req.nextUrl.searchParams.get("id");

    const mediaType =
      req.nextUrl.searchParams.get("mediaType");

    if (!id || !mediaType) {

      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );

    }

    const [videoRes, creditsRes] =
      await Promise.all([

        fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${API_KEY}`
        ),

        fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${API_KEY}`
        ),

      ]);

    const videoData =
      await videoRes.json();

    const creditsData =
      await creditsRes.json();

    const trailer =
      videoData.results?.find(
        (v: any) =>
          v.site === "YouTube" &&
          v.type === "Trailer"
      );

    return NextResponse.json({

      trailerKey:
        trailer?.key || null,

      cast:
        (creditsData.cast || []).slice(0, 8),

    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Modal fetch failed" },
      { status: 500 }
    );

  }
}