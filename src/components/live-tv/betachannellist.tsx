'use client';

import { useState, useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Heart } from "lucide-react";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 35; // 7 columns × 4 rows for optimal display

interface BetaChannel {
    name: string;
    embed: string;
    id?: string;
}

const createChannelId = (channel: BetaChannel, index: number) => {
    const str = `${channel.name}_${index}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `channel_${hash}`;
};

export const BetaChannelList = ({
    channels,
    onToggleFavorite,
    favoriteChannels,
    isFavoriteSection = false
}: {
    channels: BetaChannel[];
    onToggleFavorite: (channel: BetaChannel) => void;
    favoriteChannels: BetaChannel[];
    isFavoriteSection?: boolean;
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setDebouncedSearchQuery(query);
        }, 300),
        []
    );

    // Update search handler
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setCurrentPage(1);
        debouncedSearch(query);
    };

    // Memoized filtered channels with improved search
    const filteredChannels = useMemo(() => {
        if (isFavoriteSection) return channels;

        const query = debouncedSearchQuery.toLowerCase().trim();
        if (!query) return channels;

        return channels.filter(channel => {
            const name = channel.name.toLowerCase();
            const searchTerms = query.split(' ');
            return searchTerms.every(term => name.includes(term));
        });
    }, [channels, debouncedSearchQuery, isFavoriteSection]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredChannels.length / ITEMS_PER_PAGE);
    const currentChannels = filteredChannels.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-6">
            {/* Search Bar - Only show if not favorites section */}
            {!isFavoriteSection && (
                <div className="w-full md:w-[300px]">
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search Channel..."
                        className="w-full"
                    />
                </div>
            )}

            {/* Channel Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 2xl:grid-cols-7 gap-0">
                {currentChannels.map((channel, index) => {
                    const channelId = createChannelId(channel, index);
                    return (
                        <Dialog key={channelId}>
                            <DialogTrigger asChild>
                                <div className="box-border flex flex-none content-stretch p-3">
                                    <div className="group flex w-full flex-1 cursor-pointer flex-col py-4 relative"
                                        data-tip={channel.name}>
                                        {/* Favorite Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleFavorite(channel);
                                            }}
                                            className="absolute top-4 right-0 p-1.5 z-20 rounded-full 
                                                     hover:scale-110 transition-transform duration-200"
                                        >
                                            <Heart
                                                className={`h-4 w-4 ${favoriteChannels.some(fav => fav.name === channel.name)
                                                    ? 'fill-[#e90000] stroke-[#d20000]'
                                                    : 'stroke-[#d20000] hover:stroke-red-500'
                                                    }`}
                                            />
                                        </button>

                                        <div className="flex h-28 w-full items-center justify-center overflow-hidden 
                                                      rounded-2xl bg-gray-50 dark:bg-[#262626] p-4 transition-all 
                                                      ease-in-out group-hover:scale-110 group-hover:shadow-xl 
                                                      group-hover:shadow-primary/30 group-hover:ring 
                                                      group-hover:ring-primary hover:bg-gray-100 
                                                      dark:hover:bg-[#616161] border border-gray-200 
                                                      dark:border-[#616161]">
                                            <p className="text-center text-sm font-black uppercase opacity-50">
                                                {channel.name.split(' ')[0]}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex w-full flex-1 flex-col text-center">
                                            <p className="line-clamp-1 text-sm font-semibold transition-colors 
                                                        ease-in-out group-hover:text-primary">
                                                {channel.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-[1080px] px-2 py-4 mx-auto bg-blur-lg">
                                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 
                                                     ring-offset-background transition-opacity hover:opacity-100">
                                    <X className="h-6 w-6 text-white" />
                                    <span className="sr-only">Close</span>
                                </DialogClose>
                                <iframe
                                    src={channel.embed}
                                    className="w-full aspect-video"
                                    allowFullScreen
                                />
                            </DialogContent>
                        </Dialog>
                    );
                })}
            </div>

            {/* Pagination - Updated to match alpha style */}
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
};