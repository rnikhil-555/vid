import { MangafireScraper } from '@/utils/mangascraper';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const page = Number(searchParams.get('page')) || 1;
  const language = searchParams.get('language') || 'en';


  const filters: any = {};


  const type = searchParams.get('type[]');
  if (type) {
    filters.types = [type];
  }


  const genres = searchParams.getAll('genre[]');
  if (genres.length > 0) {
    filters.genres = {
      include: genres,
      exclude: []
    };
  }


  const status = searchParams.get('status[]');
  if (status) {
    filters.status = [status];
  }


  const length = searchParams.get('minchap');
  if (length) {
    filters.minChapters = length;
  }


  const sort = searchParams.get('sort');
  if (sort) {
    filters.sort = sort;
  }


  const year = searchParams.get('year');
  if (year) {
    filters.year = year;
  }

  try {
    const scraper = new MangafireScraper();
    const data = await scraper.search(query, page, filters, language);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching manga:', error);
    return NextResponse.json({ error: 'Failed to search manga' }, { status: 500 });
  }
}
