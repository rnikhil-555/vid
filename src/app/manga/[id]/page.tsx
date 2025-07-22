import { ChaptersSection } from '@/components/manga/ChapterSection';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WatchlistButton from "@/components/shared/watchlist-button";
import ReadMangaButton from "@/components/shared/read-manga-button";

interface PageParams {
  id: string;
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

// --- Main Manga Detail Page ---
export default async function MangaDetailPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const manga = await getMangaDetail(resolvedParams.id);

  if (!manga) {
    notFound();
  }

  // Get the first chapter by sorting chapters array
  const sortedChapters = manga.chapters.sort((a:any, b:any) => {
    const aNum = parseFloat(a.chapterNo || a.name.match(/(\d+(\.\d+)?)/)?.[0] || '0');
    const bNum = parseFloat(b.chapterNo || b.name.match(/(\d+(\.\d+)?)/)?.[0] || '0');
    return aNum - bNum;
  });

  const firstChapter = sortedChapters[0]?.url?.split("/").pop() || "";

  return (
    <div className="relative min-h-screen pb-16 text-gray-900 dark:text-gray-100 bg-white dark:bg-black">
      {/* Hero banner section with improved gradient */}
      <div className="relative w-full h-[90vh] overflow-hidden">
        <img
          src={manga.imageUrl || '/placeholder.png'}
          alt={manga.name}
          className="object-cover w-full h-full blur-md"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/60 dark:to-black"></div>
      </div>

      <div className="relative z-10 mx-auto -mt-[30rem] max-w-screen-xl px-4 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="hidden flex-shrink-0 md:block md:w-1/3 lg:w-1/4">
            <img
              src={manga.imageUrl || '/placeholder.png'}
              alt={manga.name}
              className="mx-auto rounded-xl shadow-xl md:mx-0"
              width="260"
              height="390"
            />
          </div>

          <div className="mt-6 md:mt-0 md:w-2/3 lg:w-3/4">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {manga.name}
            </h1>

            {manga.altName && (
              <div className="mb-4 text-sm text-black dark:text-gray-300">
                <p className="mb-2">Other Name: {manga.altName}</p>
              </div>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
              {manga.genre?.slice(0, 3).map((genre: string) => (
                <span
                  key={genre}
                  className="rounded-full bg-slate-900 bg-opacity-40 px-3 py-1 text-sm text-white dark:bg-red-900 dark:bg-opacity-40 dark:text-red-400"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-black dark:text-white">
              <span>Status: {manga.status}</span>
              <span>Author: {manga.author}</span>
              {manga.year && <span>Year: {manga.year}</span>}
              {manga.type && <span>Type: {manga.type}</span>}
            </div>

            <p className="mb-6 text-lg line-clamp-4 text-ellipsis">{manga.description}</p>

            {/* Desktop buttons */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <ReadMangaButton
                  mangaId={resolvedParams.id}
                  title={manga.name}
                  imageUrl={manga.imageUrl}
                  firstChapter={firstChapter}
                  className="border border-white font-bold transition-transform hover:scale-110"
                />
                <WatchlistButton
                  mediaId={resolvedParams.id}
                  mediaType="manga"
                  title={manga.name}
                  backdrop_path={manga.imageUrl}
                  variant="secondary"
                  size="lg"
                  className="border border-black bg-transparent font-bold dark:border-white dark:text-white lg:transition-transform lg:hover:scale-110"
                />
              </div>
            </div>

            {/* Mobile buttons */}
            <div className="flex flex-col space-y-3 md:hidden">
              <ReadMangaButton
                mangaId={resolvedParams.id}
                title={manga.name}
                imageUrl={manga.imageUrl}
                firstChapter={firstChapter}
                className="w-full border border-white font-bold lg:transition-transform lg:hover:scale-110"
              />
              <WatchlistButton
                mediaId={resolvedParams.id}
                mediaType="manga"
                title={manga.name}
                backdrop_path={manga.imageUrl}
                variant="secondary"
                size="lg"
                className="w-full border border-black bg-transparent font-bold dark:border-white dark:text-white lg:transition-transform lg:hover:scale-110"
              />
            </div>
          </div>
        </div>

        {/* Chapters List with Languages and Recommendations */}
        <div className="mb-8 mt-16">
          <ChaptersSection
            chapters={manga.chapters || []}
            mangaId={resolvedParams.id}
            languages={manga.languages || []}
            recommendations={manga.recommendations?.map((rec:any) => ({
              ...rec,
              id: `/manga/${rec.id}`, // Clean up the ID
              type: 'Manga'
            })) || []}
          />
        </div>
      </div>
    </div>
  );
}
