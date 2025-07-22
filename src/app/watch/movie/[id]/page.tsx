import VideoPlayer from "@/components/watch/movie-player";
import { fetchMovieInfo } from "@/lib/api-calls/shows";
import { Metadata } from "next";
import Image from "next/image";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const movieInfo = await fetchMovieInfo(parseInt(params.id));

  if (!movieInfo) {
    return {
      title: `Watch `,
    };
  }

  return {
    title: `Watch ${movieInfo.title} `,
    description: movieInfo.overview,
  };
}

export default async function WatchPage(props: PageProps) {
  const params = await props.params;
  const movieInfo = await fetchMovieInfo(parseInt(params.id));

  if (!movieInfo) {
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
          src={`${process.env.TMDB_IMG}${movieInfo.backdrop_path}`}
          className="object-cover"
          alt={movieInfo.title}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/60 dark:to-black"></div>
      </div>

      {/* Player */}
      <div className="relative z-10">
        <VideoPlayer movieId={params.id} movieInfo={movieInfo} />
      </div>
    </main>
  );
}
