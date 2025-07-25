"use client";

import * as React from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Check,
  ChevronsUpDown,
  GalleryThumbnails,
  List,
  ListEndIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchSeasonInfo, fetchTVInfo } from "@/lib/api-calls/tv";
import { TVInfo, TVSeasonInfo } from "@/types/tmdbApi";
import ListItem from "./ListItem";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import { createAuthClient } from "better-auth/react"
const { useSession } = createAuthClient()
import { MediaItem, useMediaList } from "@/hooks/use-media-list";

type Seasons = {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
};

type SeasonInfo = {
  id: number;
  data: TVSeasonInfo;
};

interface ComboboxProps {
  props: {
    id: number;
    name: string;
    seasons: Seasons[];
    backdrop_path: string;
    overview: string;
    poster_path: string;
  };
}

export function Combobox({ props }: ComboboxProps) {
  const { data: session } = useSession();
  const [isPaused, setIsPaused] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("watchHistoryPaused") === "true";
    }
    return false;
  });
  const { addItem: addToHistory } = useMediaList("history", isPaused);
  const { addItem: addToWatchlist } = useMediaList("watchlist", false);
  const router = useRouter();
  const pathname = usePathname();
  const seasons = props.seasons;
  const searchParams = useSearchParams();
  const seasonFromParams = searchParams.get("season");
  const episodeFromParams = searchParams.get("episode");

  // Update state to track current episode
  const [currentEpisode, setCurrentEpisode] = React.useState(episodeFromParams || "1");
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(seasonFromParams || "1");
  const [order, setOrder] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<"list" | "grid" | "thumbnail">(
    "list",
  );
  const [epInfo, setEpInfo] = React.useState<SeasonInfo[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showInfo, setShowInfo] = React.useState<TVInfo>();

  React.useEffect(() => {
    if (seasonFromParams) {
      setValue(seasonFromParams);
    }
  }, [seasonFromParams]);

  const fetchEpisodeInfo = React.useCallback(
    async (id: number, seasonNumber: number) => {
      try {
        const fetchEpsInfo = (await fetchSeasonInfo(
          id,
          seasonNumber,
        )) as TVSeasonInfo;

        setEpInfo([...epInfo, { id: seasonNumber, data: fetchEpsInfo }]);
      } catch (err) {
        console.log(err);
      }
    },
    [value],
  );

  React.useEffect(() => {
    fetchEpisodeInfo(props.id, Number(value));
  }, [value]);

  const filteredEpisodes = React.useMemo(() => {
    const episodes =
      epInfo.filter((ep) => ep.id == Number(value))[0]?.data.episodes || [];
    return episodes.filter(
      (ep, index) =>
        ep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(index + 1).includes(searchTerm), // Filter by index
    );
  }, [epInfo, value, searchTerm]);

  // Update URL when season/episode changes
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("season", value);
    params.set("episode", currentEpisode);

    // Only update if we're on the watch page
    if (pathname.includes("/watch/tv/")) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [value, currentEpisode, pathname]);

  // Sync with URL params
  React.useEffect(() => {
    if (seasonFromParams) setValue(seasonFromParams);
    if (episodeFromParams) setCurrentEpisode(episodeFromParams);
  }, [seasonFromParams, episodeFromParams]);

  const handleEpisodeClick = async (episode: any) => {
    if (!session) {
      return;
    }

    const now = new Date().toISOString();
    const mediaData = {
      mediaId: props.id.toString(),
      mediaType: "tv",
      title: props.name,
      backdrop_path: props.backdrop_path,
      season: Number(value),
      episode: episode.episode_number,
      _id: '',
      addedAt: now,
      createdAt: now,
      updatedAt: now,
      watchedAt: now
    } as MediaItem;

    // Add to history
    addToHistory(mediaData);

    // Add to watchlist
    addToWatchlist(mediaData);

    // Update current episode state
    setCurrentEpisode(String(episode.episode_number));
  };

  return (
    <div className="w-full">
      <h1 className="pb-5 text-2xl font-semibold">Episodes</h1>
      <div className="flex justify-between">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[160px] justify-between"
            >
              {value
                ? seasons.find(
                  (season) => String(season.season_number) === value,
                )?.name
                : "Select season..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {seasons.map((season) => (
                    <CommandItem
                      key={season.id}
                      value={String(season.season_number)}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === String(season.season_number)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {season.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-1 w-32 rounded-md border bg-background px-2 py-[5px] lg:w-44"
          />
          <div className="mr-6 flex h-10 w-10 items-center gap-2">
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
      <ScrollArea className="h-[500px] px-2 pt-5">
        <div
          className={clsx(
            viewMode === "thumbnail" &&
            "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4",
            // icon && "space-y-4",
          )}
        >
          {(order ? filteredEpisodes : filteredEpisodes.toReversed()).map(
            (ep, index) => (
              <ListItem
                props={ep}
                viewMode={viewMode}
                key={ep.id}
                tvId={props.id}
                backdrop={props.backdrop_path}
                poster={props.poster_path}
                description={props.overview}
                isWrappedInAnchor={true}
                isActive={String(ep.episode_number) === episodeFromParams && value === seasonFromParams}
                onClick={() => handleEpisodeClick(ep)}
              />
            ),
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
