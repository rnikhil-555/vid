import { NextRequest, NextResponse } from 'next/server';
import { fetchSearchResults } from "@/utils/drama";

export const revalidate = 900;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';

  if (!query) {
    return NextResponse.json(
      { error: "Missing required query parameter" },
      { status: 400 }
    );
  }

  // console.log(`Search query: ${query}, page: ${page}`);

  try {
    const { dramas, pagination } = await fetchSearchResults(
      query,
      parseInt(page, 10)
    );

    return NextResponse.json({
      success: true,
      query,
      page: parseInt(page, 10),
      data: dramas,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching or parsing the website:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data." },
      { status: 500 }
    );
  }
}