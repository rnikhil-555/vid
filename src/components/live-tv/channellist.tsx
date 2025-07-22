import { Channel, Stream } from '@/types/live-tv';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { X, Heart } from "lucide-react";
import { VideoPlayer } from "./videoplayer";
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChannelListProps {
    channels: Channel[];
    filterKey?: string;
    streams: Stream[];
    isFavoriteSection?: boolean;
    onToggleFavorite: (channel: Channel) => void;
    favoriteChannels: Channel[];
}

const ITEMS_PER_PAGE = 20;

export default function ChannelList({
    channels,
    filterKey,
    streams,
    isFavoriteSection = false,
    onToggleFavorite,
    favoriteChannels
}: ChannelListProps) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterKey]);

    const totalPages = Math.ceil(channels.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedChannels = channels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const channelsWithStreams = useMemo(() => {
        return paginatedChannels.map(channel => {
            const channelStream = streams.find(stream => stream.channel === channel.id);
            return {
                ...channel,
                stream: channelStream
            };
        });
    }, [paginatedChannels, streams]);

    if (channels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    No channels found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Try adjusting your filters or search criteria
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 2xl:grid-cols-10 gap-4 
                           ${isFavoriteSection ? 'pb-6 border-b border-gray-200 dark:border-gray-800' : ''}`}>
                {channelsWithStreams.map((channel) => (
                    <Dialog key={channel.id}>
                        <DialogTrigger asChild>
                            <div className="group flex flex-col p-3 text-center cursor-pointer relative">
                                {/* Add Favorite Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(channel);
                                    }}
                                    className="absolute top-3 right-3 p-1.5 z-20 rounded-full 
                                               hover:scale-110 transition-transform duration-200"
                                >
                                    <Heart
                                        className={`h-4 w-4 ${favoriteChannels.some(fav => fav.id === channel.id)
                                            ? 'fill-[#e90000] stroke-[#d20000]'
                                            : 'stroke-[#d20000] hover:stroke-red-500'
                                            }`}
                                    />
                                </button>

                                {/* Existing channel card content */}
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 px-2 py-1 
                                               bg-black/90 dark:bg-white/90 text-white dark:text-black rounded-md 
                                               text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 
                                               transition-opacity duration-200">
                                    {channel.name}
                                </span>
                                <div className="max-h-28 w-full overflow-hidden rounded-2xl bg-base-100 dark:bg-[#262626] p-4 
                                              transition-all ease-in-out group-hover:scale-110 group-hover:shadow-xl 
                                              group-hover:shadow-primary/30 group-hover:ring group-hover:ring-primary 
                                              hover:bg-base-200 dark:hover:bg-base-800
                                              border border-black/10 dark:border-transparent">
                                    <div className="relative aspect-square h-full w-full overflow-hidden">
                                        <img
                                            src={channel.logo || '/placeholder.png'}
                                            alt={channel.name}
                                            className="mx-auto object-contain w-full h-full"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-1 flex-col space-y-1"> {/* Added space-y-1 for better spacing */}
                                    <p className="line-clamp-2 font-bold transition-colors ease-in-out group-hover:text-primary
                                                 text-xs sm:text-sm md:text-base" // Added responsive text sizes
                                    >
                                        {channel.name}
                                    </p>
                                    <p className="text-xs sm:text-sm text-white/50 dark:text-gray-400">
                                        {channel.categories?.[0] || 'General'}
                                    </p>
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[1080px] px-2 py-4 mx-auto bg-blur-lg">
                            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background 
                                                 transition-opacity hover:opacity-100 focus:outline-none 
                                                 disabled:pointer-events-none data-[state=open]:bg-accent 
                                                 data-[state=open]:text-muted-foreground">
                                <X className="h-6 w-6 text-white" />
                                <span className="sr-only">Close</span>
                            </DialogClose>
                            <VideoPlayer
                                channel={channel}
                            />
                        </DialogContent>
                    </Dialog>
                ))}
            </div>

            {!isFavoriteSection && totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                bg-base-200 dark:bg-base-800 hover:bg-base-300 dark:hover:bg-base-700
                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                bg-base-200 dark:bg-base-800 hover:bg-base-300 dark:hover:bg-base-700
                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}