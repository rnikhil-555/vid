"use client";

import { usePersistedState } from "@/hooks/usePersistedState";
import { TVInfo } from "@/types/tmdbApi";
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
import { Combobox } from "../tv-page/EpisodesSection";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { isBookmarked, toggleTVBookmark } from "@/lib/utils";
import { AUTOPLAY_PROVIDERS, DEFAULT_TV_PROVIDER } from "@/lib/constants";
import { PROVIDERS_TV, Provider } from "@/lib/constants";
import { useMediaList } from "@/hooks/use-media-list";
import { useSession } from "next-auth/react";
import type { MediaItem } from "@/hooks/use-media-list";
import { Switch } from "../ui/switch";
import { useRouter } from 'next/navigation';
import { useAuthModal } from "@/store/use-auth-modal";

interface TVPlayerProps {
  tvId: string;
  tvInfo: TVInfo;
  imdbId: string;
}

// Update PlayerEvent interface to match actual event data
interface PlayerEvent {
  type: "PLAYER_EVENT" | "MEDIA_DATA";
  data: {
    event?: "play" | "pause" | "seeked" | "ended" | "timeupdate";
    currentTime?: number;
    duration?: number;
    id?: string;
    mediaType?: "movie" | "tv";
    season?: number;
    episode?: number;
  };
}

// First update the utility function
const getStoredAutoplayValue = () => {
  try {
    // Don't check for window, let Next.js handle it
    const stored = localStorage?.getItem('autoplay');
    return stored === 'true'; // returns false if stored is null/undefined
  } catch {
    return false;
  }
};

// Move these functions outside the component
const canGoBack = (currentSeason: number, currentEpisode: number) => {
  return !(currentSeason === 1 && currentEpisode === 1);
};

const canGoForward = (
  currentSeason: number,
  currentEpisode: number,
  currSeasonEps: number,
  tvSeasons: TVInfo['seasons']
) => {
  const lastSeason = tvSeasons[tvSeasons.length - 1];
  return !(
    currentSeason === lastSeason.season_number &&
    currentEpisode === currSeasonEps
  );
};

const TVPlayer = ({ tvId, tvInfo, imdbId }: TVPlayerProps) => {
  const router = useRouter();
  const tmdbId = tvInfo.id;
  const searchParams = useSearchParams();
  const [showServers, setShowServers] = useState(false);
  const [currentProvider, setCurrentProvider, loading] = usePersistedState(
    "currentTVProvider",
    DEFAULT_TV_PROVIDER,
  );
  const [currentSeason, setCurrentSeason] = useState(
    parseInt(searchParams.get("season") || "1"),
  );
  const [currentEpisode, setCurrentEpisode] = useState(
    parseInt(searchParams.get("episode") || "1"),
  );
  const [bookmarked, setBookmarked] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [seasons, setSeasons] = useState<number>(tvInfo.number_of_seasons);
  const [currSeasonEps, setCurrSeasonEps] = useState<number>(0);
  const [isLastEp, setIsLastEp] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
    const{onOpen} = useAuthModal();
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

  // Update the autoplay state initialization
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(false);

  // Add useEffect to sync with localStorage after mount
  useEffect(() => {
    // Sync autoplay with localStorage
    const storedAutoplay = getStoredAutoplayValue();
    setIsAutoplayEnabled(storedAutoplay);
  }, []);

  // Keep the storage sync effect
  useEffect(() => {
    try {
      localStorage.setItem('autoplay', String(isAutoplayEnabled));
    } catch (error) {
      console.error('Failed to save autoplay preference:', error);
    }
  }, [isAutoplayEnabled]);

  // Add this effect to handle provider updates when autoplay changes
  useEffect(() => {
    if (isAutoplayEnabled) {
      const isCurrentProviderAutoplayable = AUTOPLAY_PROVIDERS.some(
        provider => provider.name === currentProvider?.name
      );
  
      // If current provider isn't in autoplay providers, switch to first autoplay provider
      if (!isCurrentProviderAutoplayable) {
        const newProvider = AUTOPLAY_PROVIDERS[0];
        setCurrentProvider(newProvider);
        // Persist to localStorage
        localStorage.setItem('currentTVProvider', JSON.stringify(newProvider));
      }
    } else {
      // When autoplay is disabled, check if current provider is in PROVIDERS_TV
      const isProviderInRegular = PROVIDERS_TV.some(
        provider => provider.name === currentProvider?.name
      );
  
      // If current provider isn't in regular providers, switch to first regular provider
      if (!isProviderInRegular) {
        const newProvider = PROVIDERS_TV[0];
        setCurrentProvider(newProvider);
        // Persist to localStorage
        localStorage.setItem('currentTVProvider', JSON.stringify(newProvider));
      }
    }
  }, [isAutoplayEnabled, currentProvider]);

  useEffect(() => {
    const season = searchParams.get("season");
    const episode = searchParams.get("episode");
    if (season) setCurrentSeason(parseInt(season));
    if (episode) setCurrentEpisode(parseInt(episode));

    const data = tvInfo.seasons.find(
      (season) => season.season_number === currentSeason,
    );
    setCurrSeasonEps(data?.episode_count || 0);

    if (currentEpisode === currSeasonEps) {
      setIsLastEp(true);
    }
  }, [searchParams, currentSeason, tvInfo.seasons]);

  useEffect(() => {
    setBookmarked(isBookmarked(tvId, "tv"));
  }, [tvId]);

  useEffect(() => {
    // Add to history when video starts playing
    addToHistory({
      mediaId: tvId,
      mediaType: "tv",
      title: tvInfo.name,
      backdrop_path: tvInfo.backdrop_path,
      season: currentSeason,
      episode: currentEpisode,
      _id: '', // MongoDB will generate this
      addedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as MediaItem);
  }, [tvId, tvInfo, currentSeason, currentEpisode]);

  useEffect(() => {
    setIsWatchlisted(isInWatchlist(tvId, "tv"));
  }, [tvId, isInWatchlist]);

  // Add event listener for player events
  useEffect(() => {
    const handlePlayerEvent = (event: MessageEvent) => {
      // console.log('Received player event:', event.data);
      
      const playerEvent = event.data as PlayerEvent;
      
      // Handle vidlink.pro events
      if (playerEvent?.type === 'PLAYER_EVENT') {
        const { currentTime, duration } = playerEvent.data;
        // console.log(">>>>>>>>>>>>>>>",currentTime, duration);
        if (
          currentTime && 
          duration &&
          Math.round(currentTime) >= Math.round(duration) && 
          isAutoplayEnabled && 
          canGoForward(currentSeason, currentEpisode, currSeasonEps, tvInfo.seasons)
        ) {
          let nextEpisode = currentEpisode;
          let nextSeason = currentSeason;
          
          if (currentEpisode === currSeasonEps) {
            nextSeason++;
            nextEpisode = 1;
          } else {
            nextEpisode++;
          }
          
          const params = new URLSearchParams();
          params.set('season', nextSeason.toString());
          params.set('episode', nextEpisode.toString());
          
          router.replace(`/watch/tv/${tvId}?${params.toString()}`);
          
          setCurrentSeason(nextSeason);
          setCurrentEpisode(nextEpisode);
        }
      }
      
      // Handle videasy.net events
      if (event.origin.includes('videasy.net')) {
        const data = event.data;
        if (
          data.event === 'time' && 
          data.data && 
          data.duration &&
          Math.round(data.data) >= Math.round(data.duration) &&
          isAutoplayEnabled &&
          canGoForward(currentSeason, currentEpisode, currSeasonEps, tvInfo.seasons)
        ) {
          let nextEpisode = currentEpisode;
          let nextSeason = currentSeason;
          
          if (currentEpisode === currSeasonEps) {
            nextSeason++;
            nextEpisode = 1;
          } else {
            nextEpisode++;
          }
          
          const params = new URLSearchParams();
          params.set('season', nextSeason.toString());
          params.set('episode', nextEpisode.toString());
          
          router.replace(`/watch/tv/${tvId}?${params.toString()}`);
          
          setCurrentSeason(nextSeason);
          setCurrentEpisode(nextEpisode);
        }
      }
    };

    window.addEventListener('message', handlePlayerEvent);
    return () => window.removeEventListener('message', handlePlayerEvent);
  }, [
    isAutoplayEnabled,
    currentSeason,
    currentEpisode,
    currSeasonEps,
    tvId,
    router,
    tvInfo.seasons
  ]);

  useEffect(() => {
    if (isAutoplayEnabled && currentProvider) {
      // Check if current provider is in AUTOPLAY_PROVIDERS
      const isCurrentProviderAutoplayable = AUTOPLAY_PROVIDERS.some(
        provider => provider.name === currentProvider?.name
      );
  
      if (!isCurrentProviderAutoplayable) {
        // Set the first autoplay provider and persist it
        const newProvider = AUTOPLAY_PROVIDERS[0];
        setCurrentProvider(newProvider);
      }
    } else if (!isAutoplayEnabled && currentProvider) {
      // When disabling autoplay, check if we need to switch to a regular provider
      const isInRegularProviders = PROVIDERS_TV.some(
        provider => provider.name === currentProvider?.name
      );
      
      if (!isInRegularProviders) {
        // Set the first regular provider and persist it
        const newProvider = PROVIDERS_TV[0];
        setCurrentProvider(newProvider);
      }
    }
  }, [isAutoplayEnabled, currentProvider]);

  const getNextEpisodeLink = () => {
    if (currentEpisode === currSeasonEps) {
      return `/watch/tv/${tvId}?season=${currentSeason + 1}&episode=1`;
    }
    return `/watch/tv/${tvId}?season=${currentSeason}&episode=${currentEpisode + 1}`;
  };

  const getPreviousEpisodeLink = () => {
    if (currentEpisode === 1) {
      const prevSeasonData = tvInfo.seasons.find(
        (season) => season.season_number === currentSeason - 1,
      );
      return `/watch/tv/${tvId}?season=${currentSeason - 1}&episode=${
        prevSeasonData?.episode_count || 1
      }`;
    }
    return `/watch/tv/${tvId}?season=${currentSeason}&episode=${currentEpisode - 1}`;
  };

  const handleProviderChange = (provider: Provider) => {
    if (isAutoplayEnabled) {
      // Only allow switching to autoplay providers when autoplay is enabled
      const isAutoplayProvider = AUTOPLAY_PROVIDERS.some(p => p.name === provider.name);
      if (!isAutoplayProvider) {
        return;
      }
    }
    setCurrentProvider(provider);
    localStorage.setItem('currentTVProvider', JSON.stringify(provider));
    setShowServers(false);
  };

  const handleEpisodeSelect = (season: number, episode: number) => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
  };

  const handleBookmarkToggle = () => {
    const isNowBookmarked = toggleTVBookmark(
      tvId,
      currentSeason,
      currentEpisode,
    );
    setBookmarked(isNowBookmarked);
  };

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      // Show auth modal or redirect to sign in
      return;
    }

    if (isWatchlisted) {
      removeFromWatchlist(tvId, "tv");
      setIsWatchlisted(false);
    } else {
      addToWatchlist({
        mediaId: tvId,
        mediaType: "tv",
        title: tvInfo.name,
        backdrop_path: tvInfo.backdrop_path,
        addedAt: new Date().toISOString(),
        _id: '', // MongoDB will generate this
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
          title: tvInfo.name,
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
    provider: Provider,
    tvId: string,
    season: number,
    episode: number,
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
        url += provider.urlFormat
          .replace(/id/g, id.toString())
          .replace(/season/g, season.toString())
          .replace(/episode/g, episode.toString());
      } else {
        url += `${id}/${season}/${episode}`;
      }
  
      // Add extra parameters if they exist
      if (provider.extraParams) {
        const separator = url.includes("?") ? "&" : "?";
        url += separator + provider.extraParams.replace(/^\?/, "");
      }
  
      // Add autoplay parameters if enabled
      if (isAutoplayEnabled) {
        const separator = url.includes('?') ? '&' : '?';
        
        if (url.includes('vidlink.pro')) {
          url += `${separator}nextbutton=true&enablePostMessage=true`;
        } 
        else if (url.includes('player.videasy.net')) {
          url += `${separator}nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true`;
        }
        else if (url.includes('vidsrc.net')) {
          url += `${separator}autonext=true`;
        }
        else if (url.includes('vidfast.pro')) {
          // Add event listener for vidfast.pro
          const videoElement = document.querySelector('iframe');
          if (videoElement) {
            videoElement.addEventListener('load', () => {
              videoElement.contentWindow?.postMessage({ type: 'enable_autoplay' }, '*');
            });
          }
          url += `${separator}autonext=true&nextepisode=true`;
        }
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
          Now Watching: <span className="font-bold">{tvInfo.name}</span>
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
                  d="M20 3H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-5 5h-2V6h2zm4 0h-2V6h2zm1 5H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2zm-5 5h-2v-2h2zm4 0h-2v-2z"
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
                {(!isAutoplayEnabled ? PROVIDERS_TV : AUTOPLAY_PROVIDERS)
                    .map((provider, index) => (
                      <button
                        key={`${provider.name}-${index}`}
                        onClick={() => handleProviderChange(provider)}
                        className={cn(
                          "w-full rounded-md px-2 py-1 text-xs font-semibold transition-all duration-150 sm:text-[.8rem]",
                          currentProvider?.name === provider.name
                            ? "bg-[#960000]"
                            : "border border-[#444444] bg-[#3e3939] hover:bg-[#960000]"
                        )}
                      >
                        <div className="flex items-center justify-center gap-x-1">
                          {<img src={provider.countryUrl} alt="Country" />} {provider.name}
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
                // src={"vidlink.pro/tv/1396/1/1"}
                src={getProviderUrl(
                  //@ts-ignore
                  currentProvider,
                  tvId,
                  currentSeason,
                  currentEpisode,
                )}
                className="absolute left-0 top-0 h-full w-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="relative z-10 mx-auto -mt-[5px] flex w-full items-center justify-center gap-x-4 rounded-b-lg bg-gray-900 py-1 text-sm text-white lg:w-3/4">
          {canGoBack(currentSeason, currentEpisode) && (
            <Link href={getPreviousEpisodeLink()}>
              <label className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all">
                <FastForward className="h-4 w-4 rotate-180 fill-white" />
                <span className="hidden lg:block">Previous</span>
              </label>
            </Link>
          )}

          {canGoForward(currentSeason, currentEpisode, currSeasonEps, tvInfo.seasons) && (
            <>
              <Link href={getNextEpisodeLink()}>
                <label className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all">
                  <FastForward className="h-4 w-4 fill-white" />
                  <span className="hidden lg:block">Next</span>
                </label>
              </Link>
              <div className="flex items-center gap-x-2">
                <Switch
                  checked={isAutoplayEnabled}
                  onCheckedChange={(checked) => {
                    setIsAutoplayEnabled(checked);
                    localStorage.setItem('autoplay', String(checked));
                  }}
                  className="h-4 w-7"
                />
                <span className="lg:block">Auto Next</span>
              </div>
            </>
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
            href={`https://dl.vidsrc.vip/tv/${tvId}/${currentSeason}/${currentEpisode}`}
          >
            <label className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all">
              <Download className="h-4 w-4" />
              <span className="hidden lg:block">Download</span>
            </label>
          </Link>
        </div>

        {/* TV Info and Episodes */}
        <div className="mx-auto mt-8 w-full lg:w-3/4">
          {/* Episodes Section */}
          <div className="mt-6">
            <Combobox
              props={{
                id: Number(tvId),
                name: tvInfo.name,
                seasons: tvInfo.seasons,
                backdrop_path: tvInfo.backdrop_path,
                overview: tvInfo.overview,
                poster_path: tvInfo.poster_path,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVPlayer;
