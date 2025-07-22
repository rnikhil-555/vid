"use client";

import { useEffect, useState } from "react";
import CollectionCard from "@/components/collection/CollectionCard";
import { Collection } from "@/types/collection";
import { cachedFetch } from "@/hooks/useCachedFetch";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";

const COLLECTION_IDS = [
  ...new Set([
    645,86311,10,119,531241,8945,2344,748,141290,286904,302331,133830,
    141748,522577,1173608,33514,230,131635,404609,263,31562,141649,
    248534,10194,528,8650,939352,304,286948,730098,121938,328
  ])
];

const CACHE_KEY = 'collections-data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function CollectionPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllCollections = async () => {
    try {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setCollections(data);
          setFilteredCollections(data);
          setLoading(false);
          return;
        }
      }

      const responses = await Promise.allSettled<Collection>(
        COLLECTION_IDS.map(id =>
          cachedFetch<Collection>(
            `https://api.themoviedb.org/3/collection/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
            {
              headers: {
                'accept': 'application/json'
              },
              next: { revalidate: 86400 }
            }
          )
        )
      );

      const validResults = responses
        .filter(
          (result): result is PromiseFulfilledResult<Collection> =>
            result.status === 'fulfilled' && !!result.value
        )
        .map(result => result.value);

      // Cache the results
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: validResults,
        timestamp: Date.now()
      }));

      setCollections(validResults);
      setFilteredCollections(validResults);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      setError('Failed to load collections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = debounce((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredCollections(collections);
      return;
    }

    const filtered = collections.filter(collection =>
      collection.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCollections(filtered);
  }, 300);

  // Initial load
  useEffect(() => {
    fetchAllCollections();
  }, []);

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
          <h2 className="mt-4 text-xl font-semibold text-white">Something went wrong</h2>
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
    <div className="container mx-auto mt-0 md:mt-16 min-h-[80vh] w-full max-w-[1440px] pt-20 space-y-4 px-4 py-6">
      {/* Add search input */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search collections..."
           className="w-full rounded-lg py-4 capitalize text-black dark:text-white"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchQuery}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="aspect-[16/9] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </>
        ) : filteredCollections.length > 0 ? (
          filteredCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))
        ) : searchQuery.trim() ? (
          <div className="col-span-full text-center text-gray-500">
            No collections found matching "{searchQuery}"
          </div>
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No collections available
          </div>
        )}
      </div>
    </div>
  );
}