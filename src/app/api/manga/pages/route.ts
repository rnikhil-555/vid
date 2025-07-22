import { MangafireScraper } from '@/utils/mangascraper';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL is required' },
      { status: 400 }
    );
  }

  try {
    const scraper = new MangafireScraper();
    const data = await scraper.getPageList(url);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching manga pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manga pages' },
      { status: 500 }
    );
  }
}
