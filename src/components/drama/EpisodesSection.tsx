"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  GalleryThumbnails,
  List,
  ListEndIcon,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useMediaList } from "@/hooks/use-media-list";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { MediaItem } from "@/hooks/use-media-list";
import { useAuthModal } from "@/store/use-auth-modal";

interface Episode {
  title: string;
  episode_id: string;
  time: string;
  episodeNo?: number;
}

interface DramaInfo {
  title: string;
  thumbnail: string;
  episodes: Episode[];
}

export function DramaEpisodesSection({ data, id }: { data: DramaInfo, id: string }) {
  const router = useRouter();
  const { data: session } = useSession();
   const [isPaused, setIsPaused] = React.useState<boolean>(() => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem("watchHistoryPaused") === "true";
        }
        return false;
      });
  const { addItem: addToHistory } = useMediaList("history", isPaused);
  const { addItem: addToWatchlist } = useMediaList("watchlist", false);
  
  const searchParams = useSearchParams();
  const episodeId = searchParams.get("epId");
  const [viewMode, setViewMode] = React.useState<"list" | "grid" | "thumbnail">("list");
  const [order, setOrder] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  data &&
  data.episodes &&
  data.episodes.length > 0 &&
  data.episodes.sort((a, b) => (a.episodeNo ?? 0) - (b.episodeNo ?? 0));
  const filteredEpisodes = React.useMemo(() => {
    if (!searchTerm) return data.episodes;

    return data.episodes.filter((ep) => {
      const epNumber = ep.episodeNo?.toString() || '';
      return epNumber.includes(searchTerm);
    });
  }, [data.episodes, searchTerm]);

  const displayedEpisodes = order ? filteredEpisodes : [...filteredEpisodes].reverse();

  const handleEpisodeClick = async (episode: Episode, e: React.MouseEvent) => {
    e.preventDefault();

    if (!session) {
      return;
    }

    try {
      const now = new Date().toISOString();
      const mediaData: MediaItem = {
        mediaId: id,
        mediaType: "drama" as const, // Type assertion to narrow the type
        title: data.title,
        backdrop_path: data.thumbnail,
        episode: episode.episodeNo,
        _id: '',
        addedAt: now,
        watchedAt: now,
        createdAt: now,
        updatedAt: now
      };

      await Promise.all([
        addToHistory(mediaData),
        addToWatchlist(mediaData)
      ]);

      router.push(`/watch/drama/${id}?epId=${episode.episode_id}`);
    } catch (error) {
      console.error('Error saving episode data:', error);
      router.push(`/watch/drama/${id}?epId=${episode.episode_id}`);
    }
  };

  return (
    <div className="w-full">
      <h1 className="pb-5 text-2xl font-semibold">Episodes</h1>
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-1 w-32 rounded-md border bg-background px-2 py-[5px]  lg:w-44"
            min="1"
          />
          <div className="mr-6 flex h-10 items-center gap-2">
            <div>
              {order ? (
                <ArrowUpNarrowWide
                  onClick={() => setOrder(!order)}
                  className="cursor-pointer"
                />
              ) : (
                <ArrowDownWideNarrow
                  onClick={() => setOrder(!order)}
                  className="cursor-pointer"
                />
              )}
            </div>
            <div>
              {viewMode === "list" ? (
                <List
                  onClick={() => setViewMode("grid")}
                  className="cursor-pointer"
                />
              ) : viewMode === "thumbnail" ? (
                <GalleryThumbnails
                  onClick={() => setViewMode("list")}
                  className="cursor-pointer"
                />
              ) : (
                <ListEndIcon
                  onClick={() => setViewMode("thumbnail")}
                  className="cursor-pointer "
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[500px] px-2 pt-5">
        {filteredEpisodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              No episodes found matching episode number "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div
            className={clsx(
              viewMode === "thumbnail" &&
              "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4",
              viewMode === "grid" &&
              "grid grid-cols-1",
              viewMode === "list" &&
              "space-y-4"
            )}
          >
            {displayedEpisodes.map((episode, index) => (
              <Link
                key={episode.episode_id}
                href={`/watch/drama/${id}?epId=${episode.episode_id}`}
                onClick={(e) => handleEpisodeClick(episode, e)}
                className={clsx(episodeId === episode.episode_id && "bg-gray-400 dark:bg-gray-900",
                  "group relative overflow-hidden rounded-lg transition-colors",
                  viewMode === "list" && "mb-2 flex h-20 w-full cursor-pointer gap-2 overflow-hidden rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a30] dark:hover:bg-gray-700",
                  viewMode === "grid" && "mb-2 flex h-12 w-full cursor-pointer gap-2 overflow-hidden rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a30] dark:hover:bg-gray-700",
                  viewMode === "thumbnail" && "aspect-video"
                )}
              >
                {viewMode === "thumbnail" ? (
                  <>
                    <img
                      src={data.thumbnail}
                      alt={episode.title}
                      className={`${episodeId === episode.episode_id && "blur-[1.3px]"} absolute inset-0 h-full w-full object-cover transition-opacity hover:opacity-60`}
                    />
                    <div className="absolute left-0 top-0 rounded-br-md rounded-tl-md bg-black bg-opacity-70 px-2 py-1 text-sm text-white">
                      {episode.episodeNo}
                    </div>
                    {episodeId === episode.episode_id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="28"
                          height="28"
                          className="absolute left-1/2 top-1/2 mx-auto shrink-0 -translate-x-1/2 -translate-y-1/2 fill-slate-50"
                          viewBox="0 0 24 24"
                        >
                          <rect width="24" height="24" fill="none"></rect>
                          <path d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"></path>
                        </svg>
                      </div>
                    )}
                  </>
                ) : (viewMode === "list" ? (<>
                  <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-md">
                    <img
                      src={data.thumbnail}
                      alt={episode.title}
                      className={`${episodeId === episode.episode_id && "blur-[1.3px]"} h-full w-full object-cover transition-transform group-hover:scale-110`}
                    />
                    {episodeId === episode.episode_id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="28"
                          height="28"
                          className="fill-white"
                          viewBox="0 0 24 24"
                        >
                          <rect width="24" height="24" fill="none"></rect>
                          <path d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"></path>
                        </svg>
                      </div>
                    )}
                    <div className="absolute left-0 top-0 rounded-br-md rounded-tl-md bg-black bg-opacity-70 px-2 py-1 text-sm text-white">
                      {episode.episodeNo}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col pl-3 justify-center">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium ">
                          Episode {episode.episodeNo}: {episode.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </>) : (
                  <div className="flex flex-1 flex-col pl-3 justify-center">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium ">
                          Episode {episode.episodeNo}: {episode.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                )
                )}
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}