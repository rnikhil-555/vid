"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Loader2, MoreVertical, Share2, Trash } from "lucide-react";
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
import { useAuthModal } from "@/store/use-auth-modal";

interface WatchlistItem {
  _id: string;
  mediaType: "movie" | "tv" | "anime" | "drama" | "manga";
  mediaId: string;
  title: string;
  backdrop_path: string;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function WatchlistPage() {
  const { onOpen } = useAuthModal();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("watchHistoryPaused") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      onOpen();
    }
  }, [status, onOpen]);

  const { items, removeItem, loading } = useMediaList("watchlist", isPaused);

  const handleShare = (item: WatchlistItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out ${item.title}`,
        url: `${window.location.origin}/${item.mediaType}/${item.mediaId}`,
      });
    }
  };

  const clearAllWatchlist = () => {
    removeItem("1", "1", true);
    window.location.reload();
  };

  const filteredWatchlist = items
    .filter((item) => item?.title)
    .sort((a, b) => {
      const dateA = new Date(a.addedAt || a.createdAt);
      const dateB = new Date(b.addedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .filter((item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const groupedHistory = filteredWatchlist.reduce(
    (acc, item) => {
      const date = new Date(item.addedAt);
      if (!isNaN(date.getTime())) {
        const dateString = format(date, "dd MMMM, yyyy");
        if (!acc[dateString]) {
          acc[dateString] = [];
        }
        acc[dateString].push(item);
      }
      return acc;
    },
    {} as Record<string, WatchlistItem[]>
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[1440px] bg-white px-4 py-20 dark:bg-transparent">
      {!loading && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,400px]">
          <div className="order-2 lg:order-1">
            {Object.entries(groupedHistory)
              .sort(
                (a, b) =>
                  new Date(b[0]).getTime() - new Date(a[0]).getTime(),
              )
              .map(([date, items], index) => (
                <div key={index} className="mb-8">
                  <h2 className="py-5 text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {date}
                  </h2>
                  <ul className="space-y-4">
                    {items.map((item) => {
                      const addedDate = new Date(item.addedAt);
                      const formattedDate = `Added ${formatDistanceToNow(addedDate)} ago`;

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
                                src={
                                  item.backdrop_path ?? "/placeholder.png"
                                }
                                alt={item.title}
                                className="h-[80px] w-[120px] rounded-md object-cover lg:h-[100px] lg:w-[150px]"
                              />
                            )}
                            <div className="flex-1 pr-12">
                              <h3 className="line-clamp-2 text-lg font-semibold text-gray-800 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {item.mediaType.toUpperCase()}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {formattedDate}
                              </p>
                            </div>
                          </Link>
                          <div className="absolute right-2 top-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
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

            {filteredWatchlist.length === 0 && (
              <div className="mt-10 h-screen text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Your watchlist is empty.
                </p>
              </div>
            )}
          </div>

          <div className="order-1 h-full space-y-4 lg:order-2 lg:pt-8">
            <Input
              type="text"
              placeholder="Search watchlist"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <Button
              onClick={clearAllWatchlist}
              className="w-full border bg-transparent text-black hover:bg-transparent dark:text-white hover:dark:bg-transparent"
            >
              <Trash className="mr-2 h-5 w-5" />
              Clear All Watchlist
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
