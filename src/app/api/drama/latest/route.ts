import { fetchDramas } from '@/utils/drama';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 900;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';

  try {
    const { dramas, pagination } = await fetchDramas(
      `https://dramacool.sh/category/latest-asian-drama-releases/page/${page}/`
    );

    return NextResponse.json({
      success: true,
      data: dramas,
      pagination
    });

  } catch (error) {
    console.error("Error fetching or parsing the website:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data." },
      { status: 500 }
    );
  }
}