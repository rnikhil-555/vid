import { MangafireScraper } from '@/utils/mangascraper';
import axios from 'axios';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id, chapterId } = await params;
    const url = `https://mangafire.to/ajax/read/chapter/${chapterId}`;
    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching manga details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manga details' },
      { status: 500 }
    );
  }
}
