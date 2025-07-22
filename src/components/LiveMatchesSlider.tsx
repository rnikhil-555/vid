"use client"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { MatchCard } from './MatchCard';
import { useState, useEffect } from 'react';
import 'swiper/css';

interface Match {
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
}

export function MatchCardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-video overflow-hidden rounded-lg relative mb-2
                          bg-gray-200 dark:bg-gray-800" />
            <div className="py-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
        </div>
    );
}

export function BaseSlider({ matches, title, isChannel, isMatchLive }: { matches: Match[], title: string, isChannel?: boolean, isMatchLive?: boolean }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (!matches || matches.length === 0) return null;

    return (
        <div className="mt-3 md:mt-8">
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-6">
                {title}
            </h2>
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    <div className="block">
                        <MatchCardSkeleton />
                    </div>
                    <div className="block">
                        <MatchCardSkeleton />
                    </div>
                    <div className="hidden md:block">
                        <MatchCardSkeleton />
                    </div>
                    <div className="hidden lg:block">
                        <MatchCardSkeleton />
                    </div>
                    <div className="hidden xl:block">
                        <MatchCardSkeleton />
                    </div>
                </div>
            ) : (
                <div className="transition-opacity duration-300 opacity-100">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={2}
                        autoplay={{ delay: isChannel ? 5000 : 3000 }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                            1280: { slidesPerView: 4 },
                            1440: { slidesPerView: 5 },
                        }}
                        className="pb-10"
                        onInit={() => setIsLoading(false)}
                    >
                        {matches.map((match) => (
                            <SwiperSlide key={isChannel ? `channel-${match.id}-${match.category}` : match.id}>
                                <MatchCard match={match} isChannel={isChannel} isMatchLive={isMatchLive} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </div>
    );
}