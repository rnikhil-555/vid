import { useMemo } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useManga() {
  const getPopular = (page = 1) => {
    const { data, error, isLoading } = useSWR(
      `/api/manga/popular?page=${page}`,
      fetcher
    );

    return {
      manga: data?.list || [],
      hasNextPage: data?.hasNextPage || false,
      isLoading,
      isError: error
    };
  };

  const getLatest = (page = 1) => {
    const { data, error, isLoading } = useSWR(
      `/api/manga/latest?page=${page}`,
      fetcher
    );

    return {
      manga: data?.list || [],
      hasNextPage: data?.hasNextPage || false,
      isLoading,
      isError: error
    };
  };

  const search = (query: string, page = 1, filters = {}) => {
    const queryParams = new URLSearchParams({
      q: query,
      page: String(page),
      ...Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        ])
      )
    });

    const { data, error, isLoading } = useSWR(
      query ? `/api/manga/search?${queryParams}` : null,
      fetcher
    );

    return {
      manga: data?.list || [],
      hasNextPage: data?.hasNextPage || false,
      isLoading,
      isError: error
    };
  };

  const getDetails = (id: string) => {
    const { data, error, isLoading } = useSWR(
      id ? `/api/manga/${id}` : null,
      fetcher
    );

    return {
      manga: data,
      isLoading,
      isError: error
    };
  };

  return {
    getPopular,
    getLatest,
    search,
    getDetails
  };
}
