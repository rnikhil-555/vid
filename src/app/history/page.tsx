"use client";

import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { useState, useEffect } from "react";
import {
  Pause,
  Play,
  Trash,
  MoreVertical,
  Share2,
  Loader2,
} from "lucide-react";
import { useMediaList } from "@/hooks/use-media-list";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import type { MediaItem } from "@/hooks/use-media-list";

interface HistoryItem extends MediaItem {
  watchedAt: string; // Make this required
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("watchHistoryPaused") === "true";
    }
    return false;
  });
  
  const { items, loading, removeItem } = useMediaList("history", isPaused);
  // Filter out invalid dates and ensure title exists
  const validHistory = items.filter((item): item is HistoryItem => {
    if (!item?.title || !item?.watchedAt) return false;
    const date = new Date(item.watchedAt);
    const isValidDate = !isNaN(date.getTime());
    if (!isValidDate) {
      console.error(
        `Invalid date for item ${item.mediaId}: ${item.watchedAt}`,
      );
    }
    return isValidDate;
  });

  // Filter history based on search query
  const filteredHistory = validHistory
    .sort((a, b) => {
      return new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime();
    })
    .filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const groupedHistory = filteredHistory.reduce<Record<string, HistoryItem[]>>(
    (acc, item) => {
      const date = new Date(item.watchedAt);
      const dateString = format(date, "dd MMMM, yyyy");
      if (!acc[dateString]) {
        acc[dateString] = [];
      }
      acc[dateString].push(item);
      return acc;
    },
    {}
  );

  const togglePauseHistory = () => {
    const newPauseStatus = !isPaused;
    setIsPaused(newPauseStatus);
    window.localStorage.setItem(
      "watchHistoryPaused",
      JSON.stringify(newPauseStatus),
    );
  };

  const clearAllHistory = () => {
    if (!session) return;
    
    removeItem("all", "all", true);
  };

  const handleShare = (item: HistoryItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out ${item.title}`,
        url: `${window.location.origin}/${item.mediaType}/${item.mediaId}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[1440px] bg-white px-4 py-20 dark:bg-transparent">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,400px]">
        {/* Left side - History List */}
        <div className="order-2 lg:order-1">
          {Object.entries(groupedHistory)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([date, items], index) => (
              <div key={index} className="mb-8">
                <h2 className="py-5 text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {date}
                </h2>
                <ul className="space-y-4">
                  {items.map((item, index) => {
                    const watchedDate = new Date(item.watchedAt || item.createdAt || Date.now());
                    const formattedDate = `Watched ${formatDistanceToNow(watchedDate)} ago`;

                    return (
                      <li key={item._id} className="relative">
                        <Link
                          href={`/${item.mediaType}/${item.mediaId}`}
                          className="group flex w-full items-center space-x-4 rounded-md bg-gray-100 transition-all hover:bg-gray-200 dark:bg-[#2a2a30] dark:hover:bg-gray-700"
                        >
                          {item.backdrop_path.startsWith("/") ? (
                            <img
                              src={
                                item.backdrop_path
                                  ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                                  : "/placeholder.png"
                              }
                              alt={item.title}
                              className="h-[80px] w-[120px] rounded-md object-cover lg:h-[100px] lg:w-[150px]"
                            />
                          ) : (
                            <img
                              src={item.backdrop_path ?? "/placeholder.png"}
                              alt={item.title}
                              className="h-[80px] w-[120px] rounded-md object-cover lg:h-[100px] lg:w-[150px]"
                            />
                          )}
                          <div className="flex-1 pr-12">
                          <h3 className="line-clamp-2 text-lg font-semibold text-gray-800 dark:text-white">
  {item.title}{" "}
  {(item.mediaType === "tv" || item.mediaType === "drama") && item.season
    ? "| S" + item.season + " E" + item.episode
    : (item.mediaType === "anime" || item.mediaType === "drama") && item.episode
      ? "| E" + item.episode
      : ""}
</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {
                                // item.mediaType === "tv" &&
                                // item.season &&
                                // item.episode
                                //   ? `S${item.season} E${item.episode}`
                                //   :
                                item.mediaType.toUpperCase()
                              }
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {formattedDate}
                            </p>
                          </div>
                        </Link>
                        <div className="absolute right-2 top-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleShare(item)}
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  removeItem(item.mediaId, item.mediaType)
                                }
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

          {filteredHistory.length === 0 && (
            <div className="mt-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No valid watch history found.
              </p>
            </div>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="order-1 h-full space-y-4 lg:order-2 lg:pt-8">
          <Input
            type="text"
            placeholder="Search watch history"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={togglePauseHistory}
              className="w-full border bg-transparent text-black hover:bg-transparent dark:text-white hover:dark:bg-transparent"
            >
              {isPaused ? (
                <div className="flex items-center gap-x-2">
                  <Play className="h-5 w-5" />
                  <span>Resume History</span>
                </div>
              ) : (
                <div className="flex items-center gap-x-2">
                  <Pause className="h-5 w-5 fill-white" />
                  <span>Pause History</span>
                </div>
              )}
            </Button>
            <Button
              onClick={clearAllHistory}
              className="w-full border bg-transparent text-black hover:bg-transparent dark:text-white hover:dark:bg-transparent"
            >
              <Trash className="mr-2 h-5 w-5" />
              Clear All History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
