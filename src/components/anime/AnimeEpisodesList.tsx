"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  GalleryThumbnails,
  List,
  ListEndIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import clsx from "clsx";

interface AnimeEpisode {
  id: string;
  title: string;
  description: string;
  image: string;
  number: number;
}

interface AnimeEpisodesListProps {
  episodes: AnimeEpisode[];
  animeId: string;
  description: string;
  coverImage: string;
  image: string;
}

export function AnimeEpisodesList({
  episodes,
  animeId,
  description,
  coverImage,
  image,
}: AnimeEpisodesListProps) {
  const searchParams = useSearchParams();
  const currentEpisode = searchParams.get("episode");
  const [order, setOrder] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<"list" | "grid" | "thumbnail">(
    "list",
  );
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredEpisodes = React.useMemo(() => {
    return episodes.filter(
      (ep) =>
        ep.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(ep.number).includes(searchTerm),
    );
  }, [episodes, searchTerm]);

  return (
    <div className="w-full">
      <h1 className="pb-5 text-2xl font-semibold">Episodes</h1>
      <div className="flex justify-between">
        <div className="flex w-full items-center gap-2">
          <div className="mr-2 flex h-10 w-full items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-1 w-32 rounded-md border bg-background px-2 py-[5px] lg:w-44"
            />
            <div className="flex gap-x-2">
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
                    className="cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[500px] px-2 pt-5">
        <div
          className={clsx(
            viewMode === "thumbnail" &&
              "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4",
          )}
        >
          {(order ? filteredEpisodes : [...filteredEpisodes].reverse()).map(
            (episode) => (
              <EpisodeItem
                key={episode.id}
                episode={episode}
                viewMode={viewMode}
                animeId={animeId}
                description={description}
                image={coverImage || image}
                isCurrentEpisode={currentEpisode === String(episode.number)}
              />
            ),
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface EpisodeItemProps {
  episode: AnimeEpisode;
  viewMode: "list" | "grid" | "thumbnail";
  animeId: string;
  description?: string;
  image: string;
  isCurrentEpisode: boolean;
}

function EpisodeItem({
  episode,
  viewMode,
  animeId,
  description,
  image,
  isCurrentEpisode,
}: EpisodeItemProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/watch/anime/${animeId}?episode=${episode.number}`);
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={handleNavigate}
        className={cn(
          "mb-2 flex h-20 w-full cursor-pointer gap-2 overflow-hidden rounded-md transition-colors",
          isCurrentEpisode
            ? "bg-gray-400 dark:bg-gray-900"
            : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a30] dark:hover:bg-gray-700",
        )}
      >
        <div className="relative h-full min-w-36">
          <img
            className={`rounded-l-md object-cover ${isCurrentEpisode ? "blur-[1.3px]" : ""}`}
            src={episode.image || image}
            alt={`Episode ${episode.number} - ${episode.title}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />

          <div className="absolute inset-0">
            {isCurrentEpisode && (
              <div>
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
            <div
              className={cn(
                "absolute left-0 top-0 rounded-br-md rounded-tl-md bg-black bg-opacity-70 px-2 py-1 text-sm text-white",
              )}
            >
              {episode.number}
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center p-2">
          <h2 className={cn("text-sm font-semibold", isCurrentEpisode)}>
            {episode.title ?? `Episode ${episode.number}`}
          </h2>
          <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
            {episode.description || description}
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div
        onClick={handleNavigate}
        className={cn(
          "mb-2 flex h-12 w-full cursor-pointer gap-2 overflow-hidden rounded-md transition-colors",
          isCurrentEpisode
            ? "bg-gray-400 dark:bg-gray-900"
            : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a30] dark:hover:bg-gray-700",
        )}
      >
        <div className="flex flex-1 items-center justify-center p-2">
          <div
            className={cn(
              "flex flex-1 text-sm font-semibold",
              isCurrentEpisode && "backdrop-blur-md",
            )}
          >
            Episode {episode.number}
            {episode.title && `: ${episode.title}`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleNavigate}
      className="relative cursor-pointer transition-opacity hover:opacity-80"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          className={`rounded-md object-cover ${isCurrentEpisode ? "blur-[1.3px]" : ""}`}
          src={episode.image || image}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          alt={`Episode ${episode.number} - ${episode.title}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        <div className="absolute inset-0">
          {isCurrentEpisode && (
            <div>
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
          <div
            className={cn(
              "absolute left-0 top-0 rounded-br-md rounded-tl-md px-2 py-1 text-sm text-white",
              "bg-black bg-opacity-70",
            )}
          >
            {episode.number}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeEpisodesList;
