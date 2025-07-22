'use client';

import { useState, useEffect, Suspense } from 'react';
import useSWR from 'swr';
import { Channel } from '@/types/live-tv';
import CategoryFilter from '@/components/live-tv/categoryfilter';
import ChannelList from '@/components/live-tv/channellist';
import CountryFilter from '@/components/live-tv/countryfilter';
import SearchBar from '@/components/live-tv/searchbar';
import { Button } from "@/components/ui/button";
import { BetaChannelList } from '@/components/live-tv/betachannellist';

const FAVORITES_KEY = 'favorite-channels';
const BETA_FAVORITES_KEY = 'beta-favorite-channels';

interface BetaChannel {
    name: string;
    embed: string;
    id?: string; // Add optional id field
}

interface BetaResponse {
    success: boolean;
    data: BetaChannel[];
}

const LoadingSkeleton = () => (
    <div className="min-h-screen px-4 py-12 mx-auto max-w-[1440px] mt-8 space-y-4 bg-base-100 dark:bg-base-900 overflow-y-hidden">
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col space-y-6 mb-8">
                <div className="flex items-center">
                    <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 flex items-center gap-4 w-full md:w-auto">
                        <div className="h-10 w-40 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-10 w-40 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full md:w-[300px]">
                        <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 2xl:grid-cols-10 gap-4">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="group flex flex-col p-3 text-center">
                        <div className="max-h-28 w-full overflow-hidden rounded-2xl bg-base-100 dark:bg-[#262626] p-4">
                            <div className="relative aspect-square h-full w-full overflow-hidden">
                                <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-1 flex-col space-y-2">
                            <div className="h-4 w-3/4 mx-auto bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 w-1/2 mx-auto bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const FavoritesSection = ({
    channels,
    onToggleFavorite,
    favoriteChannels,
    type
}: {
    channels: Channel[] | BetaChannel[],
    onToggleFavorite: (channel: any) => void,
    favoriteChannels: Channel[] | BetaChannel[],
    type: 'alpha' | 'beta'
}) => {
    if (favoriteChannels.length === 0) return null;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Favorites</h2>
            {type === 'alpha' ? (
                <ChannelList
                    channels={channels as Channel[]}
                    streams={[]}
                    onToggleFavorite={onToggleFavorite}
                    favoriteChannels={favoriteChannels as Channel[]}
                    isFavoriteSection
                />
            ) : (
                <BetaChannelList
                    channels={channels as BetaChannel[]}
                    onToggleFavorite={onToggleFavorite}
                    favoriteChannels={favoriteChannels as BetaChannel[]}
                    isFavoriteSection
                />
            )}
        </div>
    );
};

const REVALIDATE_INTERVAL = 2 * 60 * 60 * 1000;

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
};

export default function LiveTV() {
    const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
    const [filterKey, setFilterKey] = useState('0');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [favoriteChannels, setFavoriteChannels] = useState<Channel[]>([]);
    const [selectedServer, setSelectedServer] = useState<'alpha' | 'beta'>('alpha');
    const [betaFavorites, setBetaFavorites] = useState<BetaChannel[]>([]);
    const [betaChannels, setBetaChannels] = useState<BetaChannel[]>([]);

    // Separate SWR calls for alpha and beta data
    const { data, error, isLoading } = useSWR('/api/live-tv', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: REVALIDATE_INTERVAL,
    });

    const { data: betaData } = useSWR<BetaResponse>('/api/channel/beta', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: REVALIDATE_INTERVAL,
        dedupingInterval: 2000,
    });

    // Effect to update beta channels
    useEffect(() => {
        if (betaData?.success) {
            setBetaChannels(betaData.data);
        }
    }, [betaData]);

    useEffect(() => {
        if (data) {
            setFilteredChannels(data.channels);
        }
    }, [data]);

    useEffect(() => {
        if (!data?.channels) return;

        let filtered = [...data.channels];

        if (selectedCategory && selectedCategory !== 'all') {
            filtered = filtered.filter((channel: Channel) =>
                channel.categories && channel.categories.includes(selectedCategory)
            );
        }

        if (selectedCountry && selectedCountry !== 'all') {
            filtered = filtered.filter((channel: Channel) =>
                channel.country === selectedCountry
            );
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((channel: Channel) =>
                channel.name.toLowerCase().includes(query) ||
                (channel.alt_names && channel.alt_names.some(name =>
                    name.toLowerCase().includes(query)
                ))
            );
        }

        setFilteredChannels(filtered);
        setFilterKey(prev => (parseInt(prev) + 1).toString());
    }, [data?.channels, selectedCategory, selectedCountry, searchQuery]);

    const toggleFavorite = (channel: Channel) => {
        const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
        const isCurrentlyFavorite = favorites.some((fav: Channel) => fav.id === channel.id);

        let newFavorites;
        if (isCurrentlyFavorite) {
            newFavorites = favorites.filter((fav: Channel) => fav.id !== channel.id);
        } else {
            newFavorites = [...favorites, channel];
        }

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        setFavoriteChannels(newFavorites);
    };

    const toggleBetaFavorite = (channel: BetaChannel) => {
        const favorites = JSON.parse(localStorage.getItem(BETA_FAVORITES_KEY) || '[]');
        const isCurrentlyFavorite = favorites.some((fav: BetaChannel) => fav.name === channel.name);

        let newFavorites;
        if (isCurrentlyFavorite) {
            newFavorites = favorites.filter((fav: BetaChannel) => fav.name !== channel.name);
        } else {
            newFavorites = [...favorites, channel];
        }

        localStorage.setItem(BETA_FAVORITES_KEY, JSON.stringify(newFavorites));
        setBetaFavorites(newFavorites);
    };

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
        setFavoriteChannels(savedFavorites);
    }, []);

    useEffect(() => {
        const savedBetaFavorites = JSON.parse(localStorage.getItem(BETA_FAVORITES_KEY) || '[]');
        setBetaFavorites(savedBetaFavorites);
    }, []);

    if (isLoading) return <LoadingSkeleton />;
    if (error) return <div className="text-red-500 text-center">Error: {error.message}</div>;
    if (!data) return <div className="text-red-500 text-center">No data available</div>;

    return (
        <div className="min-h-screen px-4 py-12 mx-auto max-w-[1440px] mt-8 space-y-4 bg-base-100 dark:bg-base-900">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-bold">Live TV</h1>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedServer === 'alpha' ? 'default' : 'outline'}
                                onClick={() => setSelectedServer('alpha')}
                            >
                                IPTV
                            </Button>
                            <Button
                                variant={selectedServer === 'beta' ? 'default' : 'outline'}
                                onClick={() => setSelectedServer('beta')}
                            >
                                DADDY
                            </Button>
                        </div>
                    </div>

                    {selectedServer === 'alpha' && (
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 flex items-center gap-4 w-full md:w-auto">
                                <CountryFilter
                                    countries={data.countries}
                                    selectedCountry={selectedCountry}
                                    onSelectCountry={setSelectedCountry}
                                />
                                <CategoryFilter
                                    categories={data.categories}
                                    channels={data.channels}
                                    selectedCategory={selectedCategory}
                                    selectedCountry={selectedCountry}
                                    onSelectCategory={setSelectedCategory}
                                />
                            </div>
                            <div className="w-full md:w-[300px]">
                                <SearchBar onSearch={setSearchQuery} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full mt-6">
                    {/* Favorites Section */}
                    {selectedServer === 'alpha' && favoriteChannels.length > 0 && (
                        <FavoritesSection
                            channels={favoriteChannels}
                            onToggleFavorite={toggleFavorite}
                            favoriteChannels={favoriteChannels}
                            type="alpha"
                        />
                    )}

                    {selectedServer === 'beta' && betaFavorites.length > 0 && (
                        <FavoritesSection
                            channels={betaFavorites}
                            onToggleFavorite={toggleBetaFavorite}
                            favoriteChannels={betaFavorites}
                            type="beta"
                        />
                    )}

                    {/* Main Content */}
                    {selectedServer === 'alpha' ? (
                        <ChannelList
                            channels={filteredChannels}
                            filterKey={filterKey}
                            streams={data.streams}
                            onToggleFavorite={toggleFavorite}
                            favoriteChannels={favoriteChannels}
                        />
                    ) : (
                        betaChannels.length > 0 ? (
                            <BetaChannelList
                                channels={betaChannels}
                                onToggleFavorite={toggleBetaFavorite}
                                favoriteChannels={betaFavorites}
                            />
                        ) : (
                            <BetaLoadingSkeleton />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

const BetaLoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 2xl:grid-cols-7 gap-0">
        {[...Array(35)].map((_, i) => (
            <div key={i} className="box-border flex flex-none content-stretch p-3">
                <div className="group flex w-full flex-1 flex-col py-4 relative">
                    <div className="flex h-28 w-full items-center justify-center overflow-hidden 
                                  rounded-2xl bg-gray-100 dark:bg-gray-800 p-4">
                        <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="mt-4 flex w-full flex-1 flex-col text-center">
                        <div className="h-4 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);