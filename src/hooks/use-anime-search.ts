import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type AnimeSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";
export type AnimeFormat =
  | "TV"
  | "TV_SHORT"
  | "OVA"
  | "ONA"
  | "MOVIE"
  | "SPECIAL"
  | "MUSIC";
export type AnimeSortOption =
  | "POPULARITY_DESC"
  | "TRENDING_DESC"
  | "UPDATED_AT_DESC"
  | "START_DATE_DESC"
  | "SCORE_DESC"
  | "FAVOURITES_DESC";

export interface AnimeResult {
  id: string;
  originalId?: string;
  title: {
    english: string;
    romaji: string;
    native: string;
  };
  image: string;
  rating: number;
  releaseDate: string;
  type: string;
  malId?: number;
  anilistId?: number;
}

export const animeGenres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mecha",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

const CONSUMET_API_URL = process.env.NEXT_PUBLIC_ANIME_API;

export function useAnimeSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQuery = searchParams.get("q") || "";

  const [results, setResults] = useState<AnimeResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [selectedFormat, setSelectedFormat] = useState("all");

  const currentSeason = (searchParams.get("season") as AnimeSeason) || "WINTER";
  const currentSort =
    (searchParams.get("sort") as AnimeSortOption) || "POPULARITY_DESC";
  const currentFormat = (searchParams.get("format") as AnimeFormat) || "TV";
  const currentGenre = searchParams.get("genre") || "all";
  const currentYear = searchParams.get("year") || "all";

  const fetchResults = async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: "20",
      });

      if (searchQuery) params.append("query", searchQuery);
      if (currentGenre !== "all")
        params.append("genres", `["${currentGenre}"]`);
      if (currentYear !== "all") params.append("year", currentYear);
      if (currentFormat !== "TV") params.append("format", currentFormat);
      if (currentSeason !== "WINTER") params.append("season", currentSeason);
      if (currentSort !== "POPULARITY_DESC") params.append("sort", currentSort);

      const response = await fetch(
        `${CONSUMET_API_URL}/meta/anilist/advanced-search?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          next: { revalidate: 3600 },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const processedResults = (data.results || []).map(
        (result: AnimeResult) => ({
          ...result,
          originalId: result.id,
          id: `${result.id}-${result.malId || result.anilistId || Date.now()}`,
        }),
      );

      setResults((prevResults) => {
        if (reset) return processedResults;
        const existingIds = new Set(prevResults.map((r) => r.id));
        const newResults = processedResults.filter(
          (r: any) => !existingIds.has(r.id),
        );
        return [...prevResults, ...newResults];
      });

      setHasMore(data.hasNextPage || false);
    } catch (error) {
      console.error("Error fetching anime results:", error);
      setResults([]);
      setHasMore(false);
    }

    setLoading(false);
  };

  const updateSearchParams = (params: { [key: string]: string }) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(params).forEach(([key, value]) => {
      if (value === "") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    router.push(`${pathname}?${current.toString()}`);
  };

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setInputValue(query);
    setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    fetchResults(true);
  }, [
    searchQuery,
    currentSeason,
    currentSort,
    currentFormat,
    currentGenre,
    currentYear,
  ]);

  const handleReset = () => {
    setInputValue("");
    setSearchQuery("");
    setPage(1);
    router.push(pathname);
    fetchResults(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchResults(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      updateSearchParams({ q: query });
    }, 500),
    [],
  );

  const handleInputChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    results,
    loading,
    hasMore,
    inputValue,
    currentSeason,
    currentSort,
    currentFormat,
    currentGenre,
    currentYear,
    selectedFormat,
    setInputValue,
    updateSearchParams,
    setPage,
    handleReset,
    loadMore,
    handleInputChange,
    setSelectedFormat,
  };
}
