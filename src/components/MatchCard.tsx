"use client"

import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { WatchSportsVideoPlayer } from "./watch/sports-player"
import { formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';


interface Team {
    name: string;
    badge: string;
}

interface Teams {
    home?: Team;
    away?: Team;
}

interface Source {
    source: string;
    id: string;
}

interface Match {
    id: string;
    title: string;
    category: string;
    date: number;
    poster?: string;
    popular: boolean;
    teams?: Teams;
    sources: Source[];
}

export function MatchCard({ match, isChannel = false, isMatchLive = false }: { match: Match, isChannel?: boolean, isMatchLive?: boolean }) {
    const isLive = match.date == 0 || isMatchLive;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="group block w-full rounded-lg transition-all mb-2 hover:opacity-90 text-left"
                >
                    <div className="aspect-video overflow-hidden rounded-lg relative mb-2
                                bg-gradient-to-r from-pink-500/30 to-blue-500/30 
                                backdrop-blur-xl">
                        {isLive && (
                            <span className="inline-flex items-center rounded-full px-1 md:px-2.5 py-0.5
                                        bg-red-500 text-white text-xs md:font-bold
                                        absolute top-1 md:top-3 left-1 md:left-3 z-10">
                                LIVE
                            </span>
                        )}
                        {match.popular && (
                            <span className="inline-flex items-center rounded-full px-1 md:px-2.5 py-0.5
                                        bg-yellow-600 text-white text-xs md:font-bold
                                        absolute top-1 md:top-3 md:right-3 right-1 z-10">
                                Popular
                            </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <span className="absolute inset-0 flex items-center justify-center
                                    text-md md:text-lg lg:text-xl font-bold text-white uppercase text-center">
                            {match.category}
                        </span>
                    </div>

                    <div className="py-2">
                        <h1 className="break-words line-clamp-2 text-ellipsis font-bold text-md
                                    dark:text-white text-gray-900 mb-1"
                            title={match.teams ? `${match.teams.home?.name} vs ${match.teams.away?.name}` : match.title}>
                            {match.teams
                                ? `${match.teams.home?.name} vs ${match.teams.away?.name}`
                                : match.title
                            }
                        </h1>
                        {!isChannel ? <p className="text-sm dark:text-gray-400 text-gray-600">
                            <span className="font-semibold uppercase">{match.category}</span>
                            <span> | {isLive ? 'LIVE' : formatDistanceToNow(match.date, { addSuffix: false })}</span>
                        </p> : null}
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="fixed inset-0 flex h-screen w-screen items-center justify-center overflow-hidden border-none bg-transparent backdrop-blur-sm p-6">
                <div className="relative h-full w-full max-w-7xl">
                    <div className="absolute -top-4 right-0 z-50">
                        <DialogClose className="rounded-full bg-red-600 p-2 hover:bg-red-700">
                            <X className="h-6 w-6 text-white" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </div>
                    <div className="h-full w-full pt-4">
                        <WatchSportsVideoPlayer id={match.id} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}