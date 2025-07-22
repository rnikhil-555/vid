"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamData {
    id: string;
    streamNo: number;
    language: string;
    hd: boolean;
    embedUrl: string;
    source: string;
}

export function WatchSportsVideoPlayer({ id }: { id: string }) {
    const [currentProvider, setCurrentProvider] = useState<StreamData | null>(null);
    const [allProviders, setAllProviders] = useState<StreamData[]>([]);
    const [showServers, setShowServers] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(true);

    const sources = [
        "alpha",
        "bravo",
        "charlie",
        "delta",
        "echo",
        "foxtrot"
    ];

    useEffect(() => {
        const fetchAllStreams = async () => {
            try {
                const promises = sources.map(source =>
                    fetch(`https://worker.vidlink.pro/proxy?url=https://streamed.su/api/stream/${source}/${id}`).then(res => res.json())
                );

                const results = await Promise.all(promises);
                const allStreams = results.flat();

                setAllProviders(allStreams);
                if (allStreams.length > 0) {
                    setCurrentProvider(allStreams[0]);
                }
            } catch (error) {
                console.error("Error fetching streams:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllStreams();
    }, [id]);
    const handleProviderChange = (provider: StreamData) => {
        setCurrentProvider(provider);
        setShowServers(false);
    };

    return (
        <div className="container mx-auto p-4">
            <div
                className={cn(
                    "mx-auto mb-2 flex w-full items-center rounded-sm bg-red-700 text-white lg:w-3/4 lg:pl-6",
                    isOpen ? "" : "hidden"
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
                {/* Server selection button */}
                <button
                    onClick={() => setShowServers(!showServers)}
                    className="absolute left-0 right-0 top-0 z-20 mx-auto flex h-10 w-40 items-center justify-center gap-x-2 rounded-b-[12px] bg-red-700 text-white transition-all hover:bg-[#fa1111]"
                >
                    {showServers ? <X /> : (
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
                        className={`absolute left-0 right-0 top-12 z-20 mx-auto w-fit max-w-[90vw] rounded-md bg-gray-800 p-4 text-white transition-all duration-200 ${showServers
                            ? "scale-100 opacity-100"
                            : "pointer-events-none scale-95 opacity-0"
                            }`}
                    >
                        <div className="scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-600 max-h-[200px] overflow-auto px-2 sm:max-h-[200px]">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                {allProviders.map((provider, index) => (
                                    <button
                                        key={`${provider?.source || 'empty'}-${index}`}
                                        onClick={() => provider?.embedUrl ? handleProviderChange(provider) : null}
                                        className={cn(
                                            "w-full rounded-md px-2 py-1 text-xs font-semibold transition-all duration-150 sm:text-[.8rem]",
                                            currentProvider?.embedUrl === provider?.embedUrl
                                                ? "bg-[#960000]"
                                                : "border border-[#444444] bg-[#3e3939] hover:bg-[#960000]",
                                            !provider?.embedUrl && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="flex items-center justify-center gap-x-1">
                                            {(provider?.embedUrl || !allProviders) ? (
                                                <>
                                                    {provider.source} ({provider.streamNo}) {provider.hd ? "HD" : "SD"}
                                                </>
                                            ) : (
                                                "404 No Source"
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stream player */}
                {currentProvider && (
                    <iframe
                        src={currentProvider.embedUrl}
                        className="h-full w-full"
                        allowFullScreen
                        allow="encrypted-media"
                    />
                )}

                {loading && (
                    <div className="flex h-full items-center justify-center bg-gray-900">
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em]"
                                role="status"
                            >
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p className="text-sm text-gray-400">Loading streams...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}