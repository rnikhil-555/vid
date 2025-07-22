"use client";

import { usePersistedState } from "@/hooks/usePersistedState";
import { AnimeInfo } from "@/types/anilist";
import {
  Bell,
  BookmarkIcon,
  FastForward,
  X,
  Check,
  Download,
  Forward,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ANIME_PROVIDERS, DEFAULT_ANIME_PROVIDER } from "@/lib/constants";
import { useMediaList } from "@/hooks/use-media-list";
import { useSession } from "next-auth/react";
import type { MediaItem } from "@/hooks/use-media-list";
import { AnimeEpisodesList } from "@/components/anime/AnimeEpisodesList";
import { useAuthModal } from "@/store/use-auth-modal";

interface AnimePlayerProps {
  animeId: string;
  anilistId: string;
  malId: string;
  animeInfo: AnimeInfo;
  totalEpisodes: number;
}

const AnimePlayer = ({
  animeId,
  anilistId,
  malId,
  animeInfo,
  totalEpisodes,
}: AnimePlayerProps) => {
  const searchParams = useSearchParams();
  const [showServers, setShowServers] = useState(false);
  const [currentProvider, setCurrentProvider, loading] = usePersistedState(
    "currentAnimeProvider",
    DEFAULT_ANIME_PROVIDER,
  );
  const [currentEpisode, setCurrentEpisode] = useState(
    parseInt(searchParams.get("episode") || "1"),
  );
  const [isOpen, setIsOpen] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
   const{onOpen} = useAuthModal();
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    const storedPauseStatus = localStorage.getItem("watchHistoryPaused");
    return storedPauseStatus === "true";
  });
  const { addItem: addToHistory } = useMediaList("history", isPaused);
  const {
    addItem: addToWatchlist,
    removeItem: removeFromWatchlist,
    isInList: isInWatchlist,
  } = useMediaList("watchlist", false);

  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const canGoBack = () => {
    return currentEpisode > 1;
  };

  const canGoForward = () => {
    return currentEpisode < totalEpisodes;
  };

  const getNextEpisodeLink = () => {
    return `/watch/anime/${animeId}?episode=${currentEpisode + 1}`;
  };

  const getPreviousEpisodeLink = () => {
    return `/watch/anime/${animeId}?episode=${currentEpisode - 1}`;
  };

  useEffect(() => {
    const episode = searchParams.get("episode");
    if (episode) setCurrentEpisode(parseInt(episode));
  }, [searchParams]);

  useEffect(() => {
    // Add to history when video starts playing
    addToHistory({
      mediaId: animeId,
      mediaType: "anime",
      title: animeInfo.title.userPreferred || animeInfo.title.romaji,
      backdrop_path: animeInfo.image || animeInfo.cover,
      episode: currentEpisode,
      _id: '', // MongoDB will generate this
      addedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as MediaItem);
  }, [animeId, animeInfo, currentEpisode]);

  useEffect(() => {
    setIsWatchlisted(isInWatchlist(animeId, "anime"));
  }, [animeId, isInWatchlist]);

  const handleProviderChange = (provider: (typeof ANIME_PROVIDERS)[0]) => {
    setCurrentProvider(provider);
    setShowServers(false);
  };

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      return;
    }

    if (isWatchlisted) {
      removeFromWatchlist(animeId, "anime");
      setIsWatchlisted(false);
    } else {
      addToWatchlist({
        mediaId: animeId,
        mediaType: "anime",
        title: animeInfo.title.userPreferred || animeInfo.title.romaji,
        backdrop_path: animeInfo.image || animeInfo.cover,
        _id: '', // MongoDB will generate this
        addedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as MediaItem);
      setIsWatchlisted(true);
    }
  };

  const handleShare = () => {
    const link = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: animeInfo.title.userPreferred || animeInfo.title.romaji,
          url: link,
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(link).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      });
    }
  };

  const getProviderUrl = (
    provider: (typeof ANIME_PROVIDERS)[0],
    episode: number,
  ) => {
    if (loading || !provider) {
      return "";
    }

    const id = provider.idType === "anilist" ? anilistId : malId;
    if (!id) {
      return "";
    }

    try {
      let url = provider.url;

      if (provider.urlFormat) {
        url += provider.urlFormat
          .replace(/id/g, id.toString())
          .replace(/episode/g, episode.toString());
      } else {
        url += `${id}/${episode}`;
      }

      if (provider.extraParams) {
        const separator = url.includes("?") ? "&" : "?";
        url += separator + provider.extraParams.replace(/^\?/, "");
      }
      return url;
    } catch (error) {
      console.error("Error generating provider URL:", error);
      return "";
    }
  };

  // Create episodes array for AnimeEpisodesList
  const episodes = Array.from({ length: totalEpisodes }, (_, i) => ({
    id: `${i + 1}`,
    number: i + 1,
    title: `Episode ${i + 1}`,
    description: animeInfo.description || "",
    image: animeInfo.image || animeInfo.cover,
  }));

  return (
    <div className="min-h-screen pt-16">
      <div className="mx-auto max-w-screen-xl px-4">
        <h1 className="truncate pb-5 text-center text-xl font-semibold">
          Now Watching:{" "}
          <span className="font-bold">
            {animeInfo.title.userPreferred || animeInfo.title.romaji}
          </span>
        </h1>

        <div
          className={cn(
            "mx-auto mb-2 flex w-full items-center rounded-sm bg-red-700 text-white lg:w-3/4 lg:pl-6",
            isOpen ? "" : "hidden",
          )}
        >
          <div className="flex w-full items-center justify-center gap-x-2 p-2 text-sm">
            <Bell className="h-3 w-3 fill-white" />
            <span className="text-[10px] md:text-xs lg:text-sm">
              Please switch to other servers if default server doesnt work.
            </span>
          </div>
          <X
            className="h-8 w-8 cursor-pointer justify-end pr-2"
            onClick={() => setIsOpen(false)}
          />
        </div>

        <div className="relative mx-auto h-[400px] w-full overflow-hidden rounded-lg shadow-lg md:aspect-video md:h-full lg:w-3/4">
          {/* Server selection */}
          <button
            onClick={() => setShowServers(!showServers)}
            className="absolute left-0 right-0 top-0 z-20 mx-auto flex h-10 w-40 items-center justify-center gap-x-2 rounded-b-[12px] bg-red-700 text-white transition-all hover:bg-[#fa1111]"
          >
            {showServers ? (
              <X />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-7 md:w-7"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M20 3H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-5 5h-2V6h2zm4 0h-2V6h2zm1 5H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2zm-5 5h-2v-2h2zm4 0h-2v-2h2z"
                ></path>
              </svg>
            )}
            {showServers ? "Close" : "Select a server"}
          </button>

          {/* Server selection modal */}
          {!loading && (
            <div
              className={`absolute left-0 right-0 top-12 z-20 mx-auto w-fit max-w-[90vw] rounded-md bg-gray-800 p-4 text-white transition-all duration-200 ${
                showServers
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
              }`}
            >
              <div className="scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-600 max-h-[200px] overflow-auto px-2 sm:max-h-[200px]">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {ANIME_PROVIDERS.map((provider, index) => (
                    <button
                      key={`${provider.name}-${index}`}
                      onClick={() => handleProviderChange(provider)}
                      className={`w-full rounded-md px-2 py-1 text-xs font-semibold transition-all duration-150 sm:text-[.8rem] ${
                        currentProvider?.name === provider.name
                          ? "bg-[#960000]"
                          : "border border-[#444444] bg-[#3e3939] hover:bg-[#960000]"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-x-1">
                        {<img src={provider.countryUrl} alt="Country" />}{" "}
                        {provider.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Video Player */}
          {!loading && currentProvider && (
            <div>
              <iframe
                src={getProviderUrl(currentProvider, currentEpisode)}
                className="absolute left-0 top-0 h-full w-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="relative z-10 mx-auto -mt-[5px] flex w-full items-center justify-center gap-x-4 rounded-b-lg bg-gray-900 py-1 text-sm text-white lg:w-3/4">
          {canGoBack() && (
            <Link href={getPreviousEpisodeLink()}>
              <label className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all">
                <FastForward className="h-4 w-4 rotate-180 fill-white" />
                <span className="hidden lg:block">Previous</span>
              </label>
            </Link>
          )}

          {canGoForward() && (
            <Link href={getNextEpisodeLink()}>
              <label className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all">
                <FastForward className="h-4 w-4 fill-white" />
                <span className="hidden lg:block">Next</span>
              </label>
            </Link>
          )}

          {isAuthenticated ? (
            <label
              className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all"
              onClick={handleWatchlistToggle}
            >
              <BookmarkIcon
                className={cn("h-4 w-4 rounded", isWatchlisted && "fill-white")}
              />
              <span className="hidden lg:block">
                {isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
              </span>
            </label>
          ) : (
            <button
            onClick={onOpen}
              className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all"
            >
              <BookmarkIcon className="h-4 w-4" />
              <span className="hidden lg:block">Add to Watchlist</span>
            </button>
          )}

          <label
            className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all"
            onClick={handleShare}
          >
            {linkCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Forward className="h-5 w-5" />
            )}
            <span className="hidden lg:block">Share</span>
          </label>

          <Link
            href={`https://dl.vidsrc.vip/anime/${animeId}/${currentEpisode}`}
          >
            <label className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all">
              <Download className="h-4 w-4" />
              <span className="hidden lg:block">Download</span>
            </label>
          </Link>
        </div>

        {/* Replace Episodes Grid with AnimeEpisodesList */}
        <div className="mx-auto mt-8 w-full lg:w-3/4">
          <AnimeEpisodesList
            episodes={episodes}
            animeId={animeId}
            description={animeInfo.description || ""}
            coverImage={animeInfo.cover || ""}
            image={animeInfo.image || ""}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimePlayer;
