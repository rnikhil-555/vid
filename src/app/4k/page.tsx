"use client";

import { useEffect, useRef, useState } from "react";
import ResultCard from "@/components/4k/ResultCard";
import { Result } from "@/types/4k";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useSWR from "swr";

interface VideasyResponse {
  message: string;
  tmdbIds: string[];
}

interface MovieResult extends Result {
  media_type: "movie";
}

const CHUNK_SIZE = 21;

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

const fetchMovieDetails = async (id: string): Promise<MovieResult | null> => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
      {
        headers: {
          accept: "application/json",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie ${id}`);
    }

    const data = await response.json();

    return {
      id: data.id || 0,
      title: data.title || "N.A.",
      poster_path: data.poster_path || "/default-poster.jpg",
      backdrop_path: data.backdrop_path || "/default-backdrop.jpg",
      overview: data.overview || "No overview available.",
      release_date: data.release_date || "N.A.",
      vote_average: data.vote_average || 0,
      vote_count: data.vote_count || 0,
      popularity: data.popularity || 0,
      adult: data.adult || false,
      media_type: "movie" as const,
      original_language: data.original_language || "N.A.",
    } satisfies MovieResult;
  } catch (error) {
    console.error(`Failed to fetch movie ${id}:`, error);
    return null;
  }
};

const generatePaginationRange = (
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  if (currentPage < 3) {
    return [0, 1, 2, "ellipsis", totalPages - 1];
  }

  if (currentPage > totalPages - 4) {
    return [0, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1];
  }

  return [
    0,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages - 1,
  ];
};

export default function FourKPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [results, setResults] = useState<MovieResult[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const idsRef = useRef<string[]>([]);

  const { data: videasyData, error: videasyError } = useSWR<VideasyResponse>(
    "https://cdn.videasy.net/4k",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
    },
  );

  useEffect(() => {
    if (videasyData?.tmdbIds) {
      idsRef.current = [...videasyData.tmdbIds];
      setTotalItems(videasyData.tmdbIds.length);
      fetchPage(0);
    }
  }, [videasyData]);

  const fetchPage = async (pageIndex: number) => {
    try {
      const start = pageIndex * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;
      const currentIds = idsRef.current.slice(start, end);

      if (currentIds.length === 0) {
        return;
      }

      const movieDetails = await Promise.all(
        currentIds.map((id) => fetchMovieDetails(id)),
      );

      const validResults = movieDetails.filter(
        (result): result is MovieResult => result !== null,
      );

      setResults(validResults);
      setCurrentPage(pageIndex);
    } catch (error) {
      console.error("Failed to fetch page:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < Math.ceil(totalItems / CHUNK_SIZE)) {
      fetchPage(newPage);
    }
  };

  const isLoading = !videasyData && !videasyError;

  const error = videasyError
    ? "Failed to load movie list. Please try again later."
    : null;

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-center">
        <div className="rounded-lg bg-gray-800 p-8 shadow-lg">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-white">
            Something went wrong
          </h2>
          <p className="mt-2 text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-0 min-h-[80vh] w-full max-w-[1440px] space-y-4 px-4 py-6 pt-20 md:mt-16">
      {/* Movie grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {isLoading || results.length === 0
          ? 
            Array.from({ length: CHUNK_SIZE }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="aspect-[2/3] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
              />
            ))
          :
            results.map((result) => (
              <div key={result.id} className="aspect-[2/3]">
                <ResultCard
                  result={{
                    ...result,
                    poster_path: result.poster_path
                      ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
                      : "/default-poster.jpg",
                  }}
                  isFromCollection={false}
                />
              </div>
            ))}
      </div>

      {/* Pagination buttons */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="rounded-md bg-gray-900 p-2 text-sm font-medium text-white hover:bg-gray-700 hover:from-red-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {generatePaginationRange(
          currentPage,
          Math.ceil(totalItems / CHUNK_SIZE),
        ).map((pageNum, index) => {
          if (pageNum === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-400"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              disabled={isLoading}
              className={`h-10 min-w-10 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed ${
                currentPage === pageNum
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {pageNum + 1}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={
            currentPage + 1 >= Math.ceil(totalItems / CHUNK_SIZE) || isLoading
          }
          className="rounded-md bg-gray-900 p-2 text-sm font-medium text-white hover:bg-gray-700 hover:from-red-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
