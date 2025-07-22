import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MangaReader from '@/components/manga/MangaReader';

interface PageParams {
  id: string;
  chapterId: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

interface ImageData {
  0: string; // url
  1: number; // page
  2: number; // width
}

async function getMangaDetail(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/${id}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) {
      throw new Error('Failed to fetch manga detail');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching manga detail:', error);
    return null;
  }
}

async function getMangaChapter(id: string, chapterId:string,lang: string) {
  try {
    const chapters = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/chapters/${id}?lang=${lang}`, {
      next: { revalidate: 3600 }
    });
    const images = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/${id}/${chapterId}`, {
      next: { revalidate: 3600 }
    });
    if (!chapters.ok) {
      throw new Error('Failed to fetch manga detail');
    }
    return { result: { images: await images.json(), chapters: await chapters.json() }};
  } catch (error) {
    console.error('Error fetching manga detail:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolvedParams = await params;
  const manga = await getMangaDetail(resolvedParams.id);

  if (!manga) {
    return {
      title: 'Manga Not Found',
      description: 'The requested manga could not be found.'
    };
  }

  return {
    title: `${manga.name} | Manga Reader`,
    description: manga.description?.slice(0, 155) + '...',
    openGraph: {
      title: manga.name,
      description: manga.description?.slice(0, 155) + '...',
      images: [manga.imageUrl]
    }
  };
}

export default async function MangaReaderPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{lang:string}>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const manga = await getMangaDetail(resolvedParams.id);
  const chapter = await getMangaChapter(resolvedParams.id, resolvedParams.chapterId, resolvedSearchParams.lang || 'en');

  if (!manga) {
    notFound();
  }

  return (
    <main className="min-h-screen dark:bg-[#1a1a1a] bg-white">
      <div className="pt-6">
        <MangaReader
          images={chapter?.result?.images?.result?.images ?? []}
          id={resolvedParams.id}
          chapterId={resolvedParams.chapterId}
          manga={manga}
          chapters={chapter?.result?.chapters ?? []}
          lang={resolvedSearchParams.lang || 'en'}
        />
      </div>
    </main>
  );
}
