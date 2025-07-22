"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DramaCard from "@/components/DramaCard";
import DramaCardSkeleton from "@/components/DramaCardSkeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, GENRES, TYPES } from "@/constants/filters";
import { useDebounce } from '@/hooks/useDebounce';
import { ChevronRightIcon } from "lucide-react";
import { ResetIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Drama {
  title: string;
  id: string;
  original_id: string;
  image: string;
  episode: string;
  time: string;
}

interface PaginatedResponse {
  success: boolean;
  data: Drama[];
  pagination?: {
    nextpage: boolean;
    prevpage: boolean;
    maxpage: number;
  }
}

interface Filters {
  search: string;
  type: string;
  genre: string;
  year: string;
  country: string; // Add country
}

export default function DramaPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [maxPages, setMaxPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
    genre: "",
    year: "",
    country: "",
  });

  const [genreOpen, setGenreOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [yearSearch, setYearSearch] = useState('');

  const handleReset = () => {
    setFilters({
      search: "",
      type: "",
      genre: "",
      year: "",
      country: "",
    });
    window.history.pushState({}, '', window.location.pathname);
  };

  const debouncedSearch = useDebounce(filters.search, 300);

  const fetchData = async (page = 1) => {
    if (!filters.search && !filters.type && !filters.genre && !filters.year && !filters.country) {
      setLoading(true); // Only set loading true for initial load
    }

    try {
      let endpoint;
      const queryParams = new URLSearchParams({
        page: page.toString(),
      });

      if (filters.search) {
        endpoint = `/api/drama/search?query=${filters.search}&${queryParams.toString()}`;
      } else if (filters.type || filters.genre || filters.year || filters.country) {
        queryParams.append('type', filters.type);
        queryParams.append('genre', filters.genre);
        queryParams.append('release-year', filters.year);
        queryParams.append('country', filters.country);
        endpoint = `/api/drama/discover?${queryParams.toString()}`;
      } else {
        endpoint = `/api/drama/${id}?${queryParams.toString()}`;
      }

      const response = await fetch(endpoint);
      const result = await response.json() as PaginatedResponse;

      setData(result.data);

      if (result.pagination) {
        setHasNextPage(result.pagination.nextpage);
        setHasPrevPage(result.pagination.prevpage);
        setMaxPages(result.pagination.maxpage);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize filters from URL on mount
    const queryParams = new URLSearchParams(window.location.search);
    const initialFilters = {
      search: queryParams.get('search') || "",
      type: queryParams.get('type') || "",
      genre: queryParams.get('genre') || "",
      year: queryParams.get('release-year') || "",
      country: queryParams.get('country') || "",
    };
    setFilters(initialFilters);

    fetchData(parseInt(queryParams.get('page') || '1'));
  }, [id]);

  // Add useEffect to watch for filter changes
  useEffect(() => {
    fetchData(1);
  }, [debouncedSearch, filters.type, filters.genre, filters.year, filters.country]); // Re-fetch when filters change

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    // Remove URL manipulation since we're using the discover endpoint directly
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page);
    // Update URL with new page number while preserving other query params
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('page', page.toString());
    window.history.pushState({}, '', `?${queryParams.toString()}`);
  };


  return (
    <div className="container mx-auto px-4 py-8 space-y-8 mt-12 max-w-[1440px] min-h-screen">

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search dramas..."
          className="w-full lg:col-span-2 text-black dark:text-white"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 xl:flex xl:items-center xl:gap-0 xl:space-x-2">
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger
              className="bg-[#f3f4f6] dark:bg-[#2a2a30] w-full justify-between"
            >
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.country}
            onValueChange={(value) => handleFilterChange('country', value)}
          >
            <SelectTrigger
              className="bg-[#f3f4f6] dark:bg-[#2a2a30] w-full justify-between"
            >
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover open={genreOpen} onOpenChange={setGenreOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={genreOpen}
                className="bg-[#f3f4f6] dark:bg-[#2a2a30] w-full justify-between"
              >
                {GENRES.find(genre => genre.value === filters.genre)?.label || "Genre"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search genre..."
                  className="h-9"
                  value={genreSearch}
                  onValueChange={setGenreSearch}
                />
                <CommandEmpty>No genre found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {GENRES.filter(genre =>
                    genre.label.toLowerCase().includes(genreSearch.toLowerCase())
                  ).map((genre) => (
                    <CommandItem
                      key={genre.value}
                      value={genre.value}
                      onSelect={() => {
                        handleFilterChange('genre', genre.value);
                        setGenreOpen(false);
                        setGenreSearch('');
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          filters.genre === genre.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {genre.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover open={yearOpen} onOpenChange={setYearOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={yearOpen}
                className="bg-[#f3f4f6] dark:bg-[#2a2a30] w-full justify-between"
              >
                {filters.year || "Year"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search year..."
                  className="h-9"
                  value={yearSearch}
                  onValueChange={setYearSearch}
                />
                <CommandEmpty>No year found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {[
                    ...Array.from(
                      { length: new Date().getFullYear() - 2000 },
                      (_, i) => new Date().getFullYear() - i
                    ),
                    2000, 1999, 1998, 1996, 1994, 1992, 1991, 1986, 1982, 1981, 1958
                  ]
                    .filter(year =>
                      year.toString().includes(yearSearch)
                    )
                    .map((year) => (
                      <CommandItem
                        key={year}
                        value={year.toString()}
                        onSelect={() => {
                          handleFilterChange('year', year.toString());
                          setYearOpen(false);
                          setYearSearch('');
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.year === year.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {year}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-x-2 rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            <ResetIcon className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {[...Array(21)].map((_, index) => (
            <DramaCardSkeleton key={index} />
          ))}
        </div>
      ) : data?.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {data.map((drama: Drama) => (
            <DramaCard key={drama.id} result={drama} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No dramas found matching your criteria
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            <ResetIcon className="h-4 w-4" />
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {maxPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={!hasPrevPage}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-md bg-gray-900 hover:bg-gray-700 p-2 text-sm font-medium text-white hover:from-red-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600"
            aria-label="Previous page"
          >
            <ChevronRightIcon size={24} transform="rotate(180)" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: maxPages }, (_, i) => i + 1)
              .filter(page => {
                if (maxPages <= 7) return true;
                if (page === 1 || page === maxPages) return true;
                if (page >= currentPage - 2 && page <= currentPage + 2) return true;
                return false;
              })
              .map((page, index, array) => (
                <Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`rounded-md px-3 py-2 min-w-10 h-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed
                      ${currentPage === page
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    {page}
                  </button>
                </Fragment>
              ))}
          </div>

          <button
            disabled={!hasNextPage}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-md bg-gray-900 hover:bg-gray-700 p-2 text-sm font-medium text-white hover:from-red-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600"
            aria-label="Next page"
          >
            <ChevronRightIcon size={24} />
          </button>
        </div>
      )}
    </div>
  );
}