import { MangafireScraper } from '@/utils/mangascraper';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const scraper = new MangafireScraper();
    const url = `/${resolvedParams.id}`;
    const data = await scraper.getDetail(url);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching manga details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manga details' },
      { status: 500 }
    );
  }
}
