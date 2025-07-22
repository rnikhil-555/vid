"use client";

import { Filter, SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { cn } from "@/lib/utils";

// Extract the search result interface for reuse
export interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

// Extract search functionality into a custom hook for reuse
export const useSearch = () => {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const searchTMDB = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
          searchQuery,
        )}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
      );
      const data = await response.json();

      setResults(
        data.results
          .filter(
            (item: SearchResult) =>
              (item.media_type === "movie" || item.media_type === "tv") &&
              item.poster_path,
          )
          .slice(0, 5),
      );
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const debouncedSearch = useCallback(debounce(searchTMDB, 300), []);

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleInputFocus = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
  };

  const handleItemClick = (item: SearchResult) => {
    const path = item.media_type === "movie" ? "/movie" : "/tv";
    router.push(`${path}/${item.id}`);
    setShowResults(false);
    setQuery("");
  };

  const handleSeeMore = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setShowResults(false);
    setQuery("");
  };

  const getYear = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.getFullYear().toString();
  };

  const handleFilterClick = () => {
    if (window.location.pathname !== "/search") {
      router.push("/search");
    }
  };

  return {
    query,
    setQuery,
    results: mounted ? results : [],
    showResults: mounted ? showResults : false,
    setShowResults,
    handleQueryChange,
    handleItemClick,
    handleSeeMore,
    handleInputFocus,
    handleFilterClick,
    getYear,
  };
};

// Update the SearchProps interface
interface SearchProps {
  isMobile?: boolean;
  hideFilter?: boolean;
}

const Search = ({ isMobile, hideFilter }: SearchProps) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const searchHook = useSearch();
  const { query, showResults, results, setShowResults } = searchHook;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showResults, setShowResults]);

  return (
    <div
      className={cn(
        "relative",
        isMobile ? "w-full bg-transparent px-4 py-2" : "hidden md:block",
      )}
      ref={searchRef}
    >
      <Input
        className={cn(
          "h-8 w-full rounded-3xl border-0 bg-black/50 capitalize !text-white placeholder:text-center placeholder:text-gray-500 focus:placeholder:opacity-0 md:h-10",
          query && !hideFilter && "pl-[85px]",
          !isMobile && "sm:w-64 md:w-72 lg:w-[450px]",
        )}
        placeholder="Search"
        value={query}
        onChange={searchHook.handleQueryChange}
        onFocus={searchHook.handleInputFocus}
        onClick={searchHook.handleInputFocus}
        autoFocus={isMobile}
      />

      {!hideFilter && (
        <button
          onClick={searchHook.handleFilterClick}
          className={cn(
            "absolute left-2 top-[6px] flex cursor-pointer items-center gap-x-2 rounded-xl bg-black px-2 py-1 hover:bg-slate-800",
            isMobile && "left-5 top-[10px]",
          )}
        >
          <Filter className={cn("h-3 w-3 text-gray-500")} />
          <span className="text-sm text-gray-500">Filter</span>
        </button>
      )}

      <SearchIcon
        className={cn(
          "absolute right-2 top-2 h-6 w-6 text-gray-500",
          isMobile && "right-5 top-3",
        )}
      />

      {showResults && results && results.length > 0 && (
        <div
          className={cn(
            "absolute mt-1 w-full rounded-lg bg-white p-2 dark:bg-black",
            isMobile && "left-0 right-0 z-50",
          )}
        >
          {results.map((item) => (
            <div
              key={item.id}
              className="group my-1 flex cursor-pointer items-center gap-2 rounded-lg bg-gray-100 p-1.5 hover:bg-yellow-500 dark:bg-[#2a2a30] dark:hover:bg-yellow-500"
              onClick={() => searchHook.handleItemClick(item)}
            >
               <img
                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                alt={item.title || item.name || ""}
                width="40"
                height="40"
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
                    {searchHook.getYear(
                      item.release_date || item.first_air_date,
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={searchHook.handleSeeMore}
            className="mt-2 w-full rounded-lg bg-gray-100 p-2 text-center text-sm text-black hover:bg-gray-400 dark:bg-[#2a2a30] dark:text-white dark:hover:bg-gray-600"
          >
            See more results
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;
