import { fetchDramas } from "@/utils/drama";
import { NextResponse } from "next/server";

export const revalidate = 21600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";

  try {
    const { dramas, pagination } = await fetchDramas(
      `https://dramacool.sh/tag/most-popular-dramas/page/${page}/`
    );
    return NextResponse.json({ success: true, data: dramas, pagination }, {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error("Error fetching or parsing the website:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data." },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
