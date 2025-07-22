"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import { DramaEpisodesSection } from "@/components/drama/EpisodesSection";
import WatchlistButton from "@/components/shared/watchlist-button";
import PlayDramaButton from "@/components/shared/play-drama-button";

interface Episode {
  title: string;
  episode_id: string;
  time: string;
  episodeNo: number;
}

interface DramaInfo {
  title: string;
  thumbnail: string;
  synopsis: string;
  other_name: string;
  total_episode: number | null;
  duration: string | null;
  rating: string | null;
  airs: string | null;
  country: string;
  status: string;
  release_year: string;
  genres: string[];
  starring: string[];
  trailer: string | null;
  episodes: Episode[];
}

interface ApiResponse {
  success: boolean;
  data: DramaInfo;
}

const getFirstEpisode = (episodes: Episode[]) => {
  if (!episodes.length) return null;

  // Sort episodes by episodeNo in ascending order
  const sortedEpisodes = episodes.sort((a, b) => a.episodeNo - b.episodeNo);

  // Return the first episode in the sorted array
  return sortedEpisodes[0];
};

export default function DramaPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<DramaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDramaInfo = async () => {
      try {
        const response = await fetch(`/api/drama/info?id=${id}`);
        const result: ApiResponse = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Error fetching drama info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramaInfo();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!data) return null;

  return (
    <div className="relative min-h-screen pb-16 text-gray-900 dark:text-gray-100 bg-white dark:bg-black">
      {/* Hero banner section with improved gradient */}
      <div className="relative w-full h-[90vh] overflow-hidden">
        <img
          src={data.thumbnail}
          alt={data.title}
          className="object-cover w-full h-full blur-md"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/60 dark:to-black"></div>
      </div>

      <div className="relative z-10 mx-auto -mt-64 max-w-screen-xl px-4 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="hidden flex-shrink-0 md:block md:w-1/3 lg:w-1/4">
            <img
              src={data.thumbnail}
              alt={data.title}
              className="mx-auto rounded-xl shadow-xl md:mx-0"
              width="300"
              height="450"
            />
          </div>

          <div className="mt-6 md:mt-0 md:w-2/3 lg:w-3/4">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {data.title}
            </h1>

            <div className="mb-4 text-sm text-black dark:text-gray-300">
              {data.other_name && (
                <p className="mb-2">Other Name: {data.other_name}</p>
              )}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {data.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-slate-900 bg-opacity-40 px-3 py-1 text-sm text-white dark:bg-red-900 dark:bg-opacity-40 dark:text-red-400"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-black dark:text-white">
              <span>Country: {data.country}</span>
              <span>Status: {data.status}</span>
              <span>Release Year: {data.release_year}</span>
            </div>

            <p className="mb-6 text-lg line-clamp-4 text-ellipsis">{data.synopsis}</p>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <PlayDramaButton
                  dramaId={id}
                  title={data.title}
                  thumbnail={data.thumbnail}
                  episodeId={getFirstEpisode(data.episodes)?.episode_id}
                  episodeNo={getFirstEpisode(data.episodes)?.episodeNo}
                  className="border border-white font-bold transition-transform hover:scale-110"
                />
                <WatchlistButton
                  mediaId={id}
                  mediaType="drama"
                  title={data.title}
                  backdrop_path={data.thumbnail}
                  variant="secondary"
                  size="lg"
                  className="border border-black bg-transparent font-bold dark:border-white dark:text-white lg:transition-transform lg:hover:scale-110"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-3 md:hidden">
              <PlayDramaButton
                  dramaId={id}
                  title={data.title}
                  thumbnail={data.thumbnail}
                  episodeId={getFirstEpisode(data.episodes)?.episode_id}
                  episodeNo={getFirstEpisode(data.episodes)?.episodeNo}
                  className="w-full border border-white font-bold lg:transition-transform lg:hover:scale-110"
                />
              <WatchlistButton
                mediaId={id}
                mediaType="drama"
                title={data.title}
                backdrop_path={data.thumbnail}
                variant="secondary"
                size="lg"
                className="w-full border border-black bg-transparent font-bold dark:border-white dark:text-white lg:transition-transform lg:hover:scale-110"
              />
            </div>
          </div>
        </div>

        <div className="mb-8 mt-16">
          <DramaEpisodesSection data={data} id={id} />
        </div>
      </div>
    </div>
  );
}