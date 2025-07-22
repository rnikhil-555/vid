"use client";

import { useState, useEffect } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { MatchCardSkeleton } from '../LiveMatchesSlider';
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { getLiveSports, getMatches } from '@/lib/api-calls/sports';

type Match = {
    id: string;
    title: string;
    category: string;
    date: number;
    poster?: string;
    popular: boolean;
    teams?: {
        home?: {
            name: string;
            badge: string;
        };
        away?: {
            name: string;
            badge: string;
        };
    };
    sources: {
        source: string;
        id: string;
    }[];
};

type SportsListProps = {
    id: string;
};

type GroupedMatches = {
    type: '24/7' | 'date';
    day?: string;
    date?: number;
    month?: string;
    matches: Match[];
};

function groupMatchesByDate(matches: Match[]): GroupedMatches[] {
    const twentyFourSeven = matches.filter(match => match.date === 0);
    const regularMatches = matches.filter(match => match.date !== 0);

    const grouped = regularMatches.reduce((acc: { [key: string]: GroupedMatches }, match) => {
        const dateInfo = formatMatchDate(match.date);
        const key = `${dateInfo.date}-${dateInfo.month}`;

        if (!acc[key]) {
            acc[key] = {
                ...dateInfo,
                type: 'date',
                matches: []
            };
        }
        acc[key].matches.push(match);
        return acc;
    }, {});

    const result: GroupedMatches[] = [];

    if (twentyFourSeven.length > 0) {
        result.push({
            type: '24/7',
            matches: twentyFourSeven
        });
    }

    result.push(...Object.values(grouped).sort((a, b) =>
        (a.date || 0) - (b.date || 0)
    ));

    return result;
}


function formatMatchDate(timestamp: number) {
    const date = new Date(timestamp);

    return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
    };
}

const sportsList = [
    'basketball',
    'football',
    'american-football',
    'hockey',
    'baseball',
    'motor-sports',
    'fight',
    'tennis',
    'rugby',
    'golf',
    'billiards',
    'afl',
    'darts',
    'cricket',
    'other'
] as const;

export function SportsList({ id }: SportsListProps) {
    const [filters, setFilters] = useState({
        isLive: false,
        isPopular: false,
    });
    const [selectedSport, setSelectedSport] = useState('all');
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                setSelectedSport(id);

                const data = filters.isLive
                    ? await getLiveSports()
                    : await getMatches();
                setMatches(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch matches');
                console.error('Error fetching matches:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();

        let pollInterval: NodeJS.Timeout;
        if (filters.isLive) {
            pollInterval = setInterval(fetchMatches, 36000000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [filters.isLive, id]);

    const filteredMatches = matches?.filter(match => {
        const sportMatch = selectedSport === 'all'
            ? true
            : match.category.toLowerCase() === selectedSport.toLowerCase();

        const popularMatch = filters.isPopular ? match.popular : true;

        return sportMatch && popularMatch;
    });

    const toggleFilter = (filterName: 'isLive' | 'isPopular') => {
        setFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };

    const handleSportChange = (value: string) => {
        setSelectedSport(value);
        const newUrl = `/sport/${value}`;
        window.history.pushState({ id: value }, '', newUrl);
    };

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            const sportId = event.state?.id || 'all';
            setSelectedSport(sportId);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return (
        <div className="min-h-screen mt-8">
            <div className="container mx-auto max-w-[1440px] px-4 py-12 space-y-4">
                <div className="flex items-center justify-between gap-2 md:gap-4 mb-8">
                    <div className="flex space-x-2 md:space-x-4 w-full sm:w-auto">
                        <button
                            onClick={() => toggleFilter('isLive')}
                            className={`px-2 py-2 md:px-6 rounded-full transition-all text-sm md:text-md ${filters.isLive
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Live
                        </button>
                        <button
                            onClick={() => toggleFilter('isPopular')}
                            className={`px-2 py-2 md:px-6 rounded-full transition-all text-sm md:text-md ${filters.isPopular
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Popular
                        </button>
                    </div>

                    <Select value={selectedSport} onValueChange={handleSportChange}>
                        <SelectTrigger className="w-full sm:w-[300px] text-sm md:text-md">
                            {selectedSport === 'all'
                                ? 'Select a sport'
                                : selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sports</SelectItem>
                            {sportsList.map((sport) => (
                                <SelectItem key={sport} value={sport}>
                                    {sport === 'fight'
                                        ? 'Fight (UFC, Boxing)'
                                        : sport.charAt(0).toUpperCase() + sport.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* <h1 className="text-4xl font-bold dark:text-white text-gray-900 mb-8 text-center">
                    {filters.isLive ? 'Live Matches' : 'All Matches'}
                </h1> */}

                {error ? (
                    <div className="text-center text-red-600 dark:text-red-400 py-12">
                        Error loading matches. Please try again later.
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
                        {[...Array(10)].map((_, index) => (
                            <MatchCardSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="space-y-8">
                            {groupMatchesByDate(filteredMatches || []).map((group) => (
                                <div key={group.type === '24/7' ? '24/7' : `${group.date}-${group.month}`}
                                    className="flex flex-row gap-1 md:gap-4"
                                >
                                    {/* Date Display Column */}
                                    <div className="flex-shrink-0">
                                        {group.type === '24/7' ? (
                                            <div className="flex flex-col gap-1 items-center text-sm w-16">
                                                <h1 className="font-bold text-xl">24/7</h1>
                                                <span>FREE</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1 items-center text-primary text-sm w-16 sticky top-4">
                                                <span className="font-extrabold">{group.day}</span>
                                                <h1 className="font-bold text-4xl">{group.date}</h1>
                                                <span>{group.month}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Matches Grid Column */}
                                    <div className="flex-grow">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 items-baseline">
                                            {group.matches.map((match) => (
                                                <MatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isMatchLive={filters.isLive}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredMatches?.length === 0 && (
                            <div className="text-center dark:text-gray-400 text-gray-600 py-12">
                                No matches found for the selected filters.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}