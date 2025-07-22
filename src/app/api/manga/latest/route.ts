import { MangafireScraper } from '@/utils/mangascraper';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;

  try {
    const scraper = new MangafireScraper();
    const data = await scraper.getLatestUpdates(page);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching latest manga:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest manga' },
      { status: 500 }
    );
  }
}
