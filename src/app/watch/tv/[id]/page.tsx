import TVPlayer from "@/components/watch/tv-player";
import { fetchTVInfo } from "@/lib/api-calls/tv";
import { Metadata } from "next";
import Image from "next/image";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const tvInfo = await fetchTVInfo(parseInt(params.id));

  if (!tvInfo) {
    return {
      title: `Watch `,
    };
  }

  return {
    title: `Watch ${tvInfo.name} `,
    description: tvInfo.overview,
  };
}

export default async function WatchPage(props: PageProps) {
  const params = await props.params;
  const tvInfo = await fetchTVInfo(parseInt(params.id));
  const data = await fetch(
    `https://api.themoviedb.org/3/tv/${params.id}/external_ids?api_key=${process.env.TMDB_API_KEY}`,
  );
  const imdbId = (await data.json()).imdb_id;

  if (!tvInfo) {
    return (
      <div>
        <p className="p-4 text-center text-red-500 dark:text-red-400">
          Error occurred, we're sorry
        </p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-gray-800">
      {/* Background Image */}
      <div className="absolute inset-0 blur-sm">
        <img
          src={`${process.env.TMDB_IMG}${tvInfo.backdrop_path}`}
          className="object-cover"
          alt={tvInfo.name}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/60 dark:to-black"></div>
      </div>

      {/* Player */}
      <div className="relative z-10">
        <TVPlayer tvId={params.id} tvInfo={tvInfo} imdbId={imdbId} />
      </div>
    </main>
  );
}
