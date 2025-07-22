"use client";

import { DramaInfo } from "@/types/drama";
import { Bell, FastForward, X, Check, Forward } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { DramaEpisodesSection } from "../drama/EpisodesSection";
import { BookmarkIcon, Download } from "lucide-react";
import { Switch } from "../ui/switch";
import { useMediaList } from "@/hooks/use-media-list";
import { useSession } from "next-auth/react";
import type { MediaItem } from "@/hooks/use-media-list";
import { useAuthModal } from "@/store/use-auth-modal";

interface DramaPlayerProps {
    dramaInfo: DramaInfo;
    id: string;
}

interface StreamData {
    name: string;
    embeded_link: string;
    m3u8: boolean;
    stream: string | null;
    sub: string | null;
    error?: string;
    skipped?: boolean;
}

interface StreamServerResponse {
    [key: string]: StreamData;
}

interface StreamResponse {
    success: boolean;
    data: StreamServerResponse;
}

type ServerName = keyof StreamServerResponse;

interface ServerInfo {
    name: ServerName;
    embeded_link: string;
    url: string;
    isM3u8: boolean;
    isWorking: boolean;
    status: string;
}

const DramaPlayer = ({ dramaInfo, id }: DramaPlayerProps) => {
    const { data: session, status } = useSession();
     const{onOpen} = useAuthModal();
    const isAuthenticated = !!session;
    const [streamUrl, setStreamUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [showServers, setShowServers] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [linkCopied, setLinkCopied] = useState(false);
    const [selectedServer, setSelectedServer] = useState<ServerName>('streamwish');
    const [availableServers, setAvailableServers] = useState<ServerInfo[]>([]);
    const searchParam = useSearchParams()
    const episodeId = searchParam.get('epId')
    const currentEpisode = dramaInfo.episodes.find(ep => ep.episode_id === episodeId);
    const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(false);
    
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const {
        addItem: addToWatchlist,
        removeItem: removeFromWatchlist,
    } = useMediaList("watchlist", false);

    useEffect(() => {
        const fetchStreamUrl = async () => {
            try {
                const response = await fetch(`/api/drama/stream?episodeId=${episodeId}`);
                const result: StreamResponse = await response.json();
                if (result.success) {
                    // Map all servers with proper type casting
                    const servers: ServerInfo[] = Object.entries(result.data).map(([name, data]) => ({
                        name: name as ServerName,
                        embeded_link: data.embeded_link,
                        url: data.m3u8 ? data.stream || '' : data.embeded_link,
                        isM3u8: Boolean(data.m3u8),
                        isWorking: Boolean(!data.error && (data.stream || data.embeded_link)),
                        status: data.error ? 'error' : data.skipped ? 'skipped' : 'working'
                    }));

                    setAvailableServers(servers);

                    // Set default stream URL to first server that has a URL
                    const firstServer = servers.find(server => server.embeded_link);
                    if (firstServer) {
                        setStreamUrl(firstServer.embeded_link);
                        setSelectedServer(firstServer.name);
                    } else {
                        setStreamUrl('');
                        setSelectedServer(servers[0]?.name || 'standard');
                    }
                }
            } catch (error) {
                console.error('Error fetching stream URL:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStreamUrl();
    }, [episodeId]);

    // Sort episodes by episodeNo in ascending order, filtering out invalid episodes
    const sortedEpisodes = [...dramaInfo.episodes]
      .filter((ep) => ep.episodeNo !== undefined && ep.episode_id) // Ensure valid episodes
      .sort((a, b) => (a.episodeNo || 0) - (b.episodeNo || 0));

    // Find the current episode index
    const currentEpisodeIndex = sortedEpisodes.findIndex(
      (ep) => ep.episode_id === episodeId
    );

    // Determine the previous and next episodes
    const previousEpisode =
      currentEpisodeIndex > 0 ? sortedEpisodes[currentEpisodeIndex - 1] : undefined;
    const nextEpisode =
      currentEpisodeIndex < sortedEpisodes.length - 1
        ? sortedEpisodes[currentEpisodeIndex + 1]
        : undefined;

    // Helper functions to check navigation availability
    const canGoBack = currentEpisodeIndex > 0;
    const canGoForward = currentEpisodeIndex < sortedEpisodes.length - 1;

    const handleShare = () => {
        const link = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: dramaInfo.title,
                url: link,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(link).then(() => {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
            });
        }
    };

    const handleWatchlistToggle = () => {
        if (!isAuthenticated) {
            return;
        }

        if (isWatchlisted) {
            removeFromWatchlist(id, "drama");
            setIsWatchlisted(false);
        } else {
            addToWatchlist({
                mediaId: id,
                mediaType: "drama",
                title: dramaInfo.title,
                backdrop_path: dramaInfo.thumbnail,
                _id: '',
                addedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as MediaItem);
            setIsWatchlisted(true);
        }
    };

    // useEffect(() => {
    //     const handlePlayerEvent = (event: MessageEvent) => {
    //         const playerEvent = event.data;

    //         if (playerEvent?.type === 'PLAYER_EVENT') {
    //             const { currentTime, duration } = playerEvent.data;
    //             if (
    //                 currentTime &&
    //                 duration &&
    //                 Math.round(currentTime) >= Math.round(duration) &&
    //                 isAutoplayEnabled &&
    //                 canGoForward(currentEpisode?.episodeNo || 0, dramaInfo.episodes.length)
    //             ) {
    //                 const nextEpisodeId = nextEpisode?.episode_id;
    //                 if (nextEpisodeId) {
    //                     window.location.href = `/watch/drama/${nextEpisodeId}?epId=${nextEpisodeId}`;
    //                 }
    //             }
    //         }
    //     };

    //     window.addEventListener('message', handlePlayerEvent);
    //     return () => window.removeEventListener('message', handlePlayerEvent);
    // }, [isAutoplayEnabled, currentEpisode, nextEpisode, dramaInfo.episodes.length]);

    // Update the loading state render
    if (loading) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
            </div>
        );
    }

    // Add a check for no available stream
    if (!streamUrl) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center flex-col gap-4">
                <p className="text-red-500">No available streams found</p>
                {availableServers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {availableServers.map((server) => (
                            <button
                                key={server.name}
                                onClick={() => {
                                    if (server.embeded_link) {
                                        setStreamUrl(server.embeded_link);
                                        setSelectedServer(server.name);
                                    }
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm",
                                    server.embeded_link
                                        ? "bg-red-700 hover:bg-red-800 text-white"
                                        : "bg-gray-700 text-gray-300 cursor-not-allowed"
                                )}
                                disabled={!server.embeded_link}
                            >
                                {server.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16">
            <div className="mx-auto max-w-screen-xl px-4">
                <h1 className="truncate pb-5 text-center text-xl font-semibold">
                    Now Watching: <span className="font-bold">{dramaInfo.title}</span>
                </h1>

                <div className={cn(
                    "mx-auto mb-2 flex w-full items-center rounded-sm bg-red-700 text-white lg:w-3/4 lg:pl-6",
                    isOpen ? "" : "hidden",
                )}>
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
                    {/* Server selection button */}
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
                    <div
                        className={`absolute left-0 right-0 top-12 z-20 mx-auto w-fit max-w-[90vw] rounded-md bg-gray-800 p-4 text-white transition-all duration-200 ${showServers
                            ? "scale-100 opacity-100"
                            : "pointer-events-none scale-95 opacity-0"
                            }`}
                    >
                        <div className="scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-600 max-h-[200px] overflow-auto px-2 sm:max-h-[200px]">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                {availableServers.map((server) => (
                                    <button
                                        key={server.name}
                                        onClick={() => {
                                            setStreamUrl(server.embeded_link);
                                            setSelectedServer(server.name);
                                            setShowServers(false);
                                        }}
                                        className={cn(
                                            "w-full rounded-md px-2 py-1 text-xs font-semibold transition-all duration-150 sm:text-[.8rem]",
                                            selectedServer === server.name
                                                ? "bg-[#960000]"
                                                : "border border-[#444444] bg-[#3e3939] hover:bg-[#960000]"
                                        )}
                                    >
                                        {server.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Video Player */}
                    <iframe
                        src={streamUrl}
                        className="absolute left-0 top-0 h-full w-full"
                        allowFullScreen
                        allow="autoplay; encrypted-media; picture-in-picture"
                    />
                </div>

                {/* Controls */}
                <div className="relative z-10 mx-auto -mt-[5px] flex w-full items-center justify-center gap-x-4 rounded-b-lg bg-gray-900 py-1 text-sm text-white lg:w-3/4">
                    {canGoBack && (
                        <Link href={`/watch/drama/${id}?epId=${previousEpisode?.episode_id}`}>
                            <label className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all">
                                <FastForward className="h-4 w-4 rotate-180 fill-white" />
                                <span className="hidden lg:block">Previous</span>
                            </label>
                        </Link>
                    )}

                    {canGoForward && (
                        <>
                            <Link href={`/watch/drama/${id}?epId=${nextEpisode?.episode_id}`}>
                                <label className="flex cursor-pointer items-center gap-x-1 rounded-md transition-all">
                                    <FastForward className="h-4 w-4 fill-white" />
                                    <span className="hidden lg:block">Next</span>
                                </label>
                            </Link>
                            {/* <div className="flex items-center gap-x-2">
                                <Switch
                                    checked={isAutoplayEnabled}
                                    onCheckedChange={(checked) => {
                                        setIsAutoplayEnabled(checked);
                                        localStorage.setItem('autoplay', String(checked));
                                    }}
                                    className="h-4 w-7"
                                />
                                <span className="lg:block">Auto Next</span>
                            </div> */}
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
                </div>
            </div>
            <div className="mx-auto mt-8 w-full lg:w-3/4">
                <div className="mt-6 px-4 md:px-8 lg:px-12 xl:px-16">

                    <DramaEpisodesSection
                        data={{
                            title: dramaInfo.title,
                            thumbnail: dramaInfo.thumbnail,
                            episodes: dramaInfo.episodes
                        }}
                        id={id}
                    />
                </div>
            </div>
        </div>
    );
};

export default DramaPlayer;