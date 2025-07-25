"use client";

import { usePersistedState } from "@/hooks/usePersistedState";
import { PROVIDERS_MOVIE } from "@/lib/constants";
import { cn, isBookmarked, toggleMovieBookmark } from "@/lib/utils";
import { DEFAULT_MOVIE_PROVIDER } from "@/lib/constants";
import { MovieInfo } from "@/types/tmdbApi";
import { Bell, BookmarkIcon, X, Check, Download, Forward } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useMediaList } from "@/hooks/use-media-list";
import { createAuthClient } from "better-auth/react"
const { useSession } = createAuthClient()
import type { MediaItem } from "@/hooks/use-media-list";
import { useAuthModal } from "@/store/use-auth-modal";

interface VideoPlayerProps {
  movieId: string;
  movieInfo: MovieInfo;
}

const VideoPlayer = ({ movieId, movieInfo }: VideoPlayerProps) => {
  const { data: session } = useSession();
  const { onOpen } = useAuthModal();
  const isAuthenticated = !!session;
  const imdbId = movieInfo.imdb_id;
  const tmdbId = movieInfo.id;

  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("watchHistoryPaused") === "true";
    }
    return false;
  });
  const { addItem: addToHistory } = useMediaList("history", isPaused);
  const {
    addItem: addToWatchlist,
    removeItem: removeFromWatchlist,
    isInList: isInWatchlist,
  } = useMediaList("watchlist", false);

  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showServers, setShowServers] = useState(false);
  const [currentProvider, setCurrentProvider, loading] = usePersistedState(
    "currentProvider",
    DEFAULT_MOVIE_PROVIDER,
  );

  // console.log(currentProvider);
  const [bookmarked, setBookmarked] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    // Add to history when video starts playing
    addToHistory({
      mediaId: movieId,
      mediaType: "movie",
      title: movieInfo.title,
      backdrop_path: movieInfo.backdrop_path,
      _id: '', // MongoDB will generate this
      addedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as MediaItem);
  }, [movieId, movieInfo]);

  useEffect(() => {
    setIsWatchlisted(isInWatchlist(movieId, "movie"));
  }, [movieId, isInWatchlist]);

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      return;
    }

    if (isWatchlisted) {
      removeFromWatchlist(movieId, "movie");
      setIsWatchlisted(false);
    } else {
      addToWatchlist({
        mediaId: movieId,
        mediaType: "movie",
        title: movieInfo.title,
        backdrop_path: movieInfo.backdrop_path,
        _id: '',
        addedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as MediaItem);
      setIsWatchlisted(true);
    }
  };

  useEffect(() => {
    setBookmarked(isBookmarked(movieId, "movie"));
  }, [movieId]);

  const handleBookmarkToggle = () => {
    const isNowBookmarked = toggleMovieBookmark(movieId);
    setBookmarked(isNowBookmarked);
  };

  const handleProviderChange = (provider: (typeof PROVIDERS_MOVIE)[0]) => {
    setCurrentProvider(provider);
    setShowServers(false);
  };

  const handleShare = () => {
    const link = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: movieInfo.title,
          url: link,
        })
        .then(() => {
          // console.log("Thanks for sharing!");
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
    provider: (typeof PROVIDERS_MOVIE)[0],
    movieId: string,
  ) => {
    // Wait for provider to be loaded
    if (loading || !provider) {
      return "";
    }

    // Get the correct ID based on provider's idType
    const id = provider.idType === "imdb" ? imdbId : tmdbId;
    if (!id) {
      return "";
    }
    try {
      // Build the base URL
      let url = provider.url;
      // Add the formatted path
      if (provider.urlFormat) {
        url = url.replace("{id}", id.toString());
      } else {
        url += id.toString();
      }
      // Add extra parameters if they exist
      if (provider.extraParams) {
        // Remove duplicate question marks
        // const separator = url.includes("?") ? "&" : "?";
        // url += separator + provider.extraParams.replace(/^\?/, "");
        url += provider.extraParams;
      }
      return url;
    } catch (error) {
      console.error("Error generating provider URL:", error);
      return "";
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="mx-auto max-w-screen-xl px-4">
        <h1 className="truncate pb-5 text-center text-xl font-semibold">
          Now Watching: <span className="font-bold">{movieInfo.title}</span>
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

          {!loading && (
            <div
              className={`absolute left-0 right-0 top-12 z-20 mx-auto w-fit max-w-[90vw] rounded-md bg-gray-800 p-4 text-white transition-all duration-200 ${showServers
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0"
                }`}
            >
              <div className="scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-600 max-h-[200px] overflow-auto px-2 sm:max-h-[200px]">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {PROVIDERS_MOVIE.map((provider, index) => (
                    <button
                      key={`${provider.name}-${index}`}
                      onClick={() => handleProviderChange(provider)}
                      className={`w-full rounded-md px-2 py-1 text-xs font-semibold transition-all duration-150 sm:text-[.8rem] ${currentProvider?.name === provider.name
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

          {!loading && currentProvider && (
            <iframe
              //@ts-ignore
              src={getProviderUrl(currentProvider, movieId)}
              // src={"autoembed.cc/embed/player.php?id=19404"}
              className="absolute left-0 top-0 h-full w-full"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          )}
        </div>

        <div className="relative z-10 mx-auto -mt-[5px] flex w-full items-center justify-center gap-x-4 rounded-b-lg bg-gray-900 py-1 text-sm text-white lg:w-3/4">
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
              <Forward className="h-4 w-4" />
            )}
            <span className="hidden lg:block">Share</span>
          </label>
          <Link href={`https://dl.vidsrc.vip/movie/${movieId}`}>
            <label className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all">
              <Download className="h-4 w-4" />
              <span className="hidden lg:block">Download</span>
            </label>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
