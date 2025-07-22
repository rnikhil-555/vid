"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ListItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  season?: number;
  episode?: number;
  poster_path: string;
  first_air_date?: string;
  release_date?: string;
  original_language: string;
}

interface TopListProps {
  movieItems: ListItem[];
  tvItems: ListItem[];
  type: "Movie" | "Tv";
}

export default function TopList({ movieItems, tvItems, type }: TopListProps) {
  const [activeTab, setActiveTab] = useState<"Movie" | "Tv">("Movie");
  const filteredItems = activeTab === "Movie" ? movieItems : tvItems;

  return (
    <div className="w-full px-4 pt-6 text-gray-900 dark:text-white md:px-0 md:pl-4 md:pt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center text-xl font-bold">
          <span className="mr-2 text-yellow-500">▶</span> TOP
        </h2>
        <div className="space-x-2">
          <Button
            variant={activeTab === "Movie" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("Movie")}
            className="text-sm"
          >
            Movies
          </Button>
          <Button
            variant={activeTab === "Tv" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("Tv")}
            className="text-sm"
          >
            Series
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {filteredItems.slice(0, 15).map((item, index) => (
          <Link
            key={item.id}
            href={`/${activeTab.toLowerCase() === "movie" ? "movie" : "tv"}/${item.id}`}
            className="group flex items-center space-x-3 rounded bg-gray-100 p-2 hover:bg-yellow-500 dark:bg-[#2a2a30] dark:hover:bg-yellow-500 dark:hover:text-black"
          >
            <div className="relative h-16 w-12 flex-shrink-0">
              <img
                src={
                  item.poster_path
                    ? `https://image.tmdb.org/t/p/original${item.poster_path}`
                    : "/placeholder.png"
                }
                alt={item.title || item.name}
                className="h-full w-full rounded object-cover"
              />
              <div className="absolute -left-3 top-1/2 flex h-[1.9rem] w-[1.9rem] -translate-y-1/2 items-center justify-center rounded-full border-2 border-yellow-500 bg-gray-100 text-sm font-bold text-black group-hover:bg-yellow-500 group-hover:text-black dark:bg-[#2a2a30] dark:text-white">
                {index + 1}
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-xs text-gray-600 group-hover:text-black dark:text-gray-400">
                {activeTab} /{" "}
                {item.first_air_date ? item.first_air_date : item.release_date}{" "}
                / {item.original_language.toUpperCase()}
              </p>
              <h3 className="line-clamp-1 font-semibold">
                {item.title || item.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
