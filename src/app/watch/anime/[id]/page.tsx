import AnimePlayer from "@/components/watch/anime-player";
import { fetchAnimeInfo } from "@/lib/api-calls/anime";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const animeInfo = await fetchAnimeInfo(parseInt(params.id));

  if (!animeInfo) {
    return {
      title: `Watch `,
    };
  }

  return {
    title: `Watch ${animeInfo.title.romaji} `,
    description: animeInfo.description,
  };
}

export default async function WatchPage(props: PageProps) {
  const params = await props.params;
  const animeInfo = await fetchAnimeInfo(parseInt(params.id));

  if (!animeInfo) {
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
          src={animeInfo.cover || animeInfo.image}
          className="object-cover"
          alt={animeInfo.title.romaji}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/60 dark:to-black"></div>
      </div>

      {/* Player */}
      <div className="relative z-10">
        <AnimePlayer
          animeId={params.id}
          anilistId={animeInfo.id.toString()}
          malId={animeInfo.malId?.toString() || ""}
          animeInfo={animeInfo}
          totalEpisodes={animeInfo.episodes?.length || 0}
        />
      </div>
    </main>
  );
}
