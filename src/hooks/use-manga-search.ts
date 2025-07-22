import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface MangaResult {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  pages: number[];
}

interface UseMangaSearchReturn {
  results: MangaResult[];
  loading: boolean;
  hasMore: boolean;
  inputValue: string;
  selectedType: string;
  selectedGenres: string[];
  selectedStatus: string;
  selectedLength: string;
  selectedSort: string;
  selectedLanguage: string;
  selectedYear: string;
  setSelectedType: React.Dispatch<React.SetStateAction<string>>;
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
  setSelectedLength: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSort: React.Dispatch<React.SetStateAction<string>>;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>;
  setSelectedYear: React.Dispatch<React.SetStateAction<string>>;
  handleInputChange: (value: string) => void;
  handleReset: () => void;
  fetchPage: (pageNumber: number) => Promise<void>;
  filterLoading: boolean;
  setFilterLoading: React.Dispatch<React.SetStateAction<boolean>>;
  pagination: PaginationInfo;
}

export function useMangaSearch(): UseMangaSearchReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();

  
  const [results, setResults] = useState<MangaResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type[]") || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(searchParams.getAll("genre[]"));
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status[]") || "");
  const [selectedLength, setSelectedLength] = useState(searchParams.get("minchap") || "");
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "most_relevance");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get("language") || "en");
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year[]") || "");
  const [filterLoading, setFilterLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    pages: []
  });

  
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setSelectedType(params.get("type[]") || "");
    setSelectedGenres(params.getAll("genre[]"));
    setSelectedStatus(params.get("status[]") || "");
    setSelectedLength(params.get("minchap") || "");
    setSelectedSort(params.get("sort") || "most_relevance");
    setSelectedLanguage(params.get("language") || "en");
    setSelectedYear(params.get("year[]") || "");
    setInputValue(params.get("q") || "");
    setSearchQuery(params.get("q") || "");
    setPage(parseInt(params.get("page") || "1"));

    
    const fetchParams = new URLSearchParams();
    fetchParams.set("page", params.get("page") || "1");
    if (params.get("type[]")) fetchParams.set("type[]", params.get("type[]")!);
    params.getAll("genre[]").forEach(g => fetchParams.append("genre[]", g));
    if (params.get("status[]")) fetchParams.set("status[]", params.get("status[]")!);
    if (params.get("minchap")) fetchParams.set("minchap", params.get("minchap")!);
    if (params.get("sort")) fetchParams.set("sort", params.get("sort")!);
    if (params.get("language") && params.get("language") !== "en") fetchParams.set("language", params.get("language")!);
    if (params.get("year[]")) fetchParams.set("year[]", params.get("year[]")!);
    if (params.get("q")) fetchParams.set("q", params.get("q")!);

    setLoading(true);
    setFilterLoading(true);

    fetch(`/api/manga/search?${fetchParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.list || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, hasNextPage: false, pages: [] });
        setHasMore(data.hasNextPage || false);
      })
      .catch(() => {
        setResults([]);
        setHasMore(false);
      })
      .finally(() => {
        setLoading(false);
        setFilterLoading(false);
      });
  }, [typeof window !== "undefined" ? window.location.search : ""]);

  
  const handleFilterClick = () => {
    setFilterLoading(true);
    const params = new URLSearchParams();

    params.set("page", "1");
    if (selectedType) params.set("type[]", selectedType);
    if (selectedGenres.length > 0) selectedGenres.forEach(g => params.append("genre[]", g));
    if (selectedStatus) params.set("status[]", selectedStatus);
    if (selectedLength) params.set("minchap", selectedLength);
    if (selectedSort) params.set("sort", selectedSort);
    if (selectedLanguage !== "en") params.set("language", selectedLanguage);
    if (selectedYear) params.set("year[]", selectedYear);
    if (inputValue) params.set("q", inputValue);

    router.push(`${pathname}?${params.toString()}`);
  };

  
  const handleReset = () => {
    setSelectedType("");
    setSelectedGenres([]);
    setSelectedStatus("");
    setSelectedLength("");
    setSelectedSort("most_relevance");
    setSelectedLanguage("en");
    setSelectedYear("");
    setInputValue("");
    setSearchQuery("");
    setPage(1);

    router.push(`${pathname}?page=1`);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);

      setLoading(true);
      setFilterLoading(true);

      fetch(`/api/manga/search?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.list || []);
          setPagination(data.pagination || { currentPage: 1, totalPages: 1, hasNextPage: false, pages: [] });
          setHasMore(data.hasNextPage || false);
        })
        .catch(() => {
          setResults([]);
          setHasMore(false);
        })
        .finally(() => {
          setLoading(false);
          setFilterLoading(false);
        });
    }, 400),
    [pathname, router]
  );

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setSearchQuery(value);
    setPage(1);
    debouncedSearch(value);
  }, [debouncedSearch]);

  
  const fetchPage = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setFilterLoading(true);

    const params = new URLSearchParams(window.location.search);
    params.set("page", pageNumber.toString());

    setPage(pageNumber);

    fetch(`/api/manga/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.list || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, hasNextPage: false, pages: [] });
        setHasMore(data.hasNextPage || false);
      })
      .catch(() => {
        setResults([]);
        setHasMore(false);
      })
      .finally(() => {
        setLoading(false);
        setFilterLoading(false);
      });
  }, []);

  return {
    results,
    loading,
    hasMore,
    inputValue,
    selectedType,
    selectedGenres,
    selectedStatus,
    selectedLength,
    selectedSort,
    selectedLanguage,
    selectedYear,
    setSelectedType,
    setSelectedGenres,
    setSelectedStatus,
    setSelectedLength,
    setSelectedSort,
    setSelectedLanguage,
    setSelectedYear,
    handleInputChange,
    handleReset,
    fetchPage,
    filterLoading,
    setFilterLoading,
    pagination,
  };
}