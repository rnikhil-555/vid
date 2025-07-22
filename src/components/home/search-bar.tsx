"use client";

import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import Image from "next/image";
import { useSearch } from "@/components/header/search";
import Link from "next/link";

export default function HomeSearchBar() {
  const searchHook = useSearch();
  const {
    query,
    results,
    showResults,
    handleQueryChange,
    handleItemClick,
    handleSeeMore,
    getYear,
  } = searchHook;

  return (
    <div className="relative mx-auto mt-8 w-full max-w-3xl">
      <div className="relative text-black dark:text-gray-200">
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg border-[#D6D6D6] bg-[#FFFFFF] py-3 pl-20 pr-4 capitalize text-black placeholder:text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-600"
          value={query}
          onChange={handleQueryChange}
        />
        {!query && (
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        )}
        <Link href="/search">
          <div className="absolute left-1 top-1/2 flex size-10 w-16 -translate-y-1/2 items-center justify-center gap-x-1 rounded-lg">
            <Filter className="size-3" />
            <span className="text-xs">Filters</span>
          </div>
        </Link>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results && results.length > 0 && (
        <div className="absolute mt-2 w-full rounded-lg bg-white p-2 dark:bg-black">
          {results.map((item) => (
            <div
              key={item.id}
              className="group my-1 flex cursor-pointer items-center gap-2 rounded-lg bg-gray-100 p-1.5 hover:bg-yellow-500 dark:bg-[#2a2a30] dark:hover:bg-yellow-500"
              onClick={() => handleItemClick(item)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                alt={item.title || item.name || ""}
                width={40}
                height={40}
                className="rounded object-cover"
              />

              <div className="flex flex-col">
                <span className="text-sm dark:text-white dark:group-hover:text-black">
                  {item.title || item.name}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 dark:group-hover:text-black">
                  <span className="capitalize">{item.media_type}</span>
                  {parseInt(item.vote_average.toFixed(1)) > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        ⭐ {item.vote_average.toFixed(1)}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>
                    {getYear(item.release_date || item.first_air_date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={handleSeeMore}
            className="mt-2 w-full rounded-lg bg-gray-100 p-2 text-center text-sm text-black hover:bg-gray-400 dark:bg-[#2a2a30] dark:text-white dark:hover:bg-gray-600"
          >
            See more results
          </button>
        </div>
      )}
    </div>
  );
}
