import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR, { mutate } from 'swr';
import { cache } from 'react';

export type MediaType = "all" | "movie" | "tv" | "anime" | "manga" | "asian-drama";
export type SortOption =
  | "popularity"
  | "latest"
  | "oldest"
  | "a-z"
  | "z-a"
  | "rating";
export type RatingOption = "all" | "4" | "5" | "6" | "7" | "8" | "9";

export interface Result {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: "movie" | "tv";
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

const getSortQuery = (sort: SortOption): string => {
  switch (sort) {
    case "popularity":
      return "popularity.desc";
    case "latest":
      return "primary_release_date.desc";
    case "oldest":
      return "primary_release_date.asc";
    case "a-z":
      return "original_title.asc";
    case "z-a":
      return "original_title.desc";
    case "rating":
      return "vote_average.desc";
    default:
      return "popularity.desc";
  }
};

const buildSearchUrl = (params: {
  baseUrl: string;
  type: MediaType;
  query?: string;
  page: number;
  sort?: SortOption;
  genre?: string;
  year?: string;
  watchProvider?: string;
  watchRegion?: string;
  country?: string;
  rating?: string;
}) => {
  const {
    baseUrl,
    type,
    query,
    page,
    sort,
    genre,
    year,
    watchProvider,
    watchRegion,
    country,
    rating,
  } = params;

  let url = `${baseUrl}`;

  if (query) {
    url += type === 'all'
      ? `/search/multi?query=${encodeURIComponent(query)}`
      : `/search/${type}?query=${encodeURIComponent(query)}`;
  } else {
    url += type === 'all'
      ? '/discover/movie'
      : sort === 'rating'
        ? `/${type}/top_rated`
        : `/discover/${type}`;
  }

  if (type === 'all' && !query) {
    if (sort === 'rating') {
      return [
        `${baseUrl}/movie/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=${page}${genre !== 'all' ? `&with_genres=${genre}` : ''}${year !== 'all' ? `&primary_release_year=${year}` : ''}${watchProvider !== 'all' ? `&with_watch_providers=${watchProvider}&watch_region=${watchRegion}` : ''}${country !== 'all' ? `&with_origin_country=${country}` : ''}${rating !== 'all' ? `&vote_average.gte=${rating}` : ''}`,
        `${baseUrl}/tv/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=${page}${genre !== 'all' ? `&with_genres=${genre}` : ''}${year !== 'all' ? `&first_air_date_year=${year}` : ''}${watchProvider !== 'all' ? `&with_watch_providers=${watchProvider}&watch_region=${watchRegion}` : ''}${country !== 'all' ? `&with_origin_country=${country}` : ''}${rating !== 'all' ? `&vote_average.gte=${rating}` : ''}`
      ];
    } else {
      return [
        `${baseUrl}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=${page}&sort_by=${getSortQuery(sort || "popularity")}${genre !== 'all' ? `&with_genres=${genre}` : ''}${year !== 'all' ? `&primary_release_year=${year}` : ''}${watchProvider !== 'all' ? `&with_watch_providers=${watchProvider}&watch_region=${watchRegion}` : ''}${country !== 'all' ? `&with_origin_country=${country}` : ''}${rating !== 'all' ? `&vote_average.gte=${rating}` : ''}`,
        `${baseUrl}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=${page}&sort_by=${getSortQuery(sort || "popularity")}${genre !== 'all' ? `&with_genres=${genre}` : ''}${year !== 'all' ? `&first_air_date_year=${year}` : ''}${watchProvider !== 'all' ? `&with_watch_providers=${watchProvider}&watch_region=${watchRegion}` : ''}${country !== 'all' ? `&with_origin_country=${country}` : ''}${rating !== 'all' ? `&vote_average.gte=${rating}` : ''}`
      ];
    }
  }

  url += `${url.includes('?') ? '&' : '?'}api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=${page}`;

  if (!query) {
    if (sort && sort !== 'rating') url += `&sort_by=${getSortQuery(sort)}`;
    if (genre !== 'all') url += `&with_genres=${genre}`;
    if (year !== 'all') url += `&${type === 'movie' ? 'primary_release_year' : 'first_air_date_year'}=${year}`;
    if (watchProvider !== 'all') url += `&with_watch_providers=${watchProvider}&watch_region=${watchRegion}`;
    if (country !== 'all') url += `&with_origin_country=${country}`;
    if (rating !== 'all') url += `&vote_average.gte=${rating}`;
  }

  return url;
};



const searchCache = new Map<string, any>();

interface SearchResponseMerged {
  results: (Result & { media_type: 'movie' | 'tv' })[];
  total_pages: number;
}

export function useSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQuery = searchParams.get("q") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [resultsMap, setResultsMap] = useState<Map<number, Result>>(new Map());
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage - 1);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState([]);
  const [watchProviders, setWatchProviders] = useState<WatchProvider[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const currentType = (searchParams.get("type") as MediaType) || "all";
  const currentGenre = searchParams.get("genre") || "all";
  const currentSort = (searchParams.get("sort") as SortOption) || "popularity";
  const currentYear = searchParams.get("year") || "all";
  const currentWatchProvider = searchParams.get("watch_provider") || "all";
  const currentCountry = searchParams.get("country") || "all";
  const currentRating = (searchParams.get("rating") as RatingOption) || "all";
  const watchRegion = currentCountry === "all" ? "US" : currentCountry;

  const fetchGenres = async () => {
    try {
      if (currentType === "all") {
        const [movieGenres, tvGenres] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
          ).then((res) => res.json()),
          fetch(
            `https://api.themoviedb.org/3/genre/tv/list?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
          ).then((res) => res.json()),
        ]);

        const movieGenresList = movieGenres?.genres || [];
        const tvGenresList = tvGenres?.genres || [];
        const mergedGenres = [...movieGenresList, ...tvGenresList];
        const uniqueGenres = Array.from(
          new Map(mergedGenres.map((item) => [item.id, item])).values(),
        );
        // @ts-ignore
        setGenres(uniqueGenres);
      } else {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/${currentType}/list?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        );
        const data = await response.json();
        setGenres(data?.genres || []);
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
      setGenres([]);
    }
  };

  const fetchWatchProviders = async () => {
    try {
      const [movieProviders, tvProviders] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/watch/providers/movie?language=en-US&watch_region=${watchRegion}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        ).then((res) => res.json()),
        fetch(
          `https://api.themoviedb.org/3/watch/providers/tv?language=en-US&watch_region=${watchRegion}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        ).then((res) => res.json()),
      ]);

      const allProviders = [...movieProviders.results, ...tvProviders.results];
      const uniqueProviders = Array.from(
        new Map(allProviders.map((item) => [item.provider_id, item])).values(),
      );

      setWatchProviders(uniqueProviders);

      if (
        currentWatchProvider !== "all" &&
        !uniqueProviders.some(
          (provider) => provider.provider_id.toString() === currentWatchProvider,
        )
      ) {
        updateSearchParams({ watch_provider: "all" });
      }
    } catch (error) {
      console.error("Error fetching watch providers:", error);
      setWatchProviders([]);
    }
  };

  const searchUrl = buildSearchUrl({
    baseUrl: 'https://api.themoviedb.org/3',
    type: currentType,
    query: searchQuery,
    page: currentPage + 1,
    sort: currentSort,
    genre: currentGenre,
    year: currentYear,
    watchProvider: currentWatchProvider,
    watchRegion: watchRegion,
    country: currentCountry,
    rating: currentRating,
  });

  const cachedFetcher = cache(async (url: string | string[]) => {
    if (Array.isArray(url)) {
      const results = await Promise.all(
        url.map(async (u) => {
          if (searchCache.has(u)) {
            return searchCache.get(u);
          }
          const response = await fetch(u);
          if (!response.ok) {
            throw new Error('An error occurred while fetching the data.');
          }
          const data = await response.json();
          searchCache.set(u, data);
          return data;
        })
      );

      return {
        results: [
          ...results[0].results.map((item: any) => ({ ...item, media_type: 'movie' })),
          ...results[1].results.map((item: any) => ({ ...item, media_type: 'tv' }))
        ],
        total_pages: Math.max(results[0].total_pages, results[1].total_pages)
      };
    }

    if (searchCache.has(url)) {
      return searchCache.get(url);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('An error occurred while fetching the data.');
    }
    const data = await response.json();
    searchCache.set(url, data);
    return data;
  });

  const { data, error: fetchError, isLoading } = useSWR<SearchResponseMerged, Error>(
    searchUrl,
    cachedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000,
      keepPreviousData: true,
      fallbackData: searchCache.get(Array.isArray(searchUrl) ? searchUrl[0] : searchUrl),
    }
  );

  useEffect(() => {
    if (data?.results) {
      setTotalPages(data.total_pages);
      setResultsMap(new Map(
        data.results
          .filter((item: any) => item.poster_path)
          .map((item: any) => {
            const id = item.media_type === 'tv' ? `${item.id}_tv` : item.id;
            return [
              id,
              {
                ...item,
                id,
                media_type: item.media_type || currentType,
              },
            ];
          })
      ));
    }
  }, [data, currentType]);

  useEffect(() => {
    setError(fetchError ? fetchError.message : null);
  }, [fetchError]);

  const generatePaginationRange = (
    currentPage: number,
    totalPages: number,
  ): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    if (currentPage < 3) {
      return [0, 1, 2, 'ellipsis', totalPages - 1];
    }

    if (currentPage > totalPages - 4) {
      return [0, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1];
    }

    return [
      0,
      'ellipsis',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis',
      totalPages - 1,
    ];
  };

  const handlePageChange = useCallback(async (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('page', (newPage + 1).toString());
      router.push(`${pathname}?${params.toString()}`);
      setCurrentPage(newPage);
    }
  }, [pathname, router, searchParams, totalPages]);

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

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("q", value);
      router.push(`${pathname}?${params.toString()}`);
    }, 300),
    [searchParams, pathname, router]
  );

  const handleSearch = useCallback((value: string) => {
    setInputValue(value);
    setCurrentPage(0);

    if (value !== searchQuery) {
      const params = new URLSearchParams(searchParams);
      params.set('q', value);
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams, searchQuery]);

  const handleReset = useCallback(() => {
    setInputValue('');
    setSearchQuery('');
    setCurrentPage(0);
    setResultsMap(new Map());
    router.push(pathname);
    mutate(searchUrl);
  }, [pathname, router, searchUrl]);


  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    setInputValue(query);
  }, [searchParams]);


  useEffect(() => {
    fetchGenres();
    fetchWatchProviders();
  }, [currentType, currentCountry]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    return () => {
      searchCache.clear();
    };
  }, []);

  return {
    resultsMap,
    loading: isLoading,
    error: fetchError?.message || error,
    searchQuery,
    inputValue,
    genres,
    watchProviders,
    currentType,
    currentGenre,
    currentSort,
    currentYear,
    currentCountry,
    currentRating,
    currentWatchProvider,
    totalPages,
    currentPage,
    setInputValue,
    handleSearch,
    handleReset,
    updateSearchParams,
    handlePageChange,
    generatePaginationRange,
    setResultsMap,
  };
}
