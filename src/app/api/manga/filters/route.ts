import { MangafireScraper } from '@/utils/mangascraper';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// This endpoint returns the filter list which is static
export async function GET() {
  try {
    const scraper = new MangafireScraper();
    const data = scraper.getFilterList();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching manga filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manga filters' },
      { status: 500 }
    );
  }
}
