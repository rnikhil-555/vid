"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { country } from "@/lib/constants";
import { ResetIcon } from "@radix-ui/react-icons";
import {
  useSearch,
  Result,
  MediaType,
  SortOption,
  RatingOption,
  WatchProvider,
} from "@/hooks/use-search";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Command, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTopLoader } from "nextjs-toploader";

interface FilterSectionProps {
  currentType: MediaType;
  currentGenre: string;
  currentSort: SortOption;
  currentYear: string;
  currentCountry: string;
  currentRating: RatingOption;
  currentWatchProvider: string;
  genres: Array<{ id: number; name: string }>;
  watchProviders: WatchProvider[];
  updateSearchParams: (params: { [key: string]: string }) => void;
  handleReset: () => void;
}

const ResultCard = ({ result }: { result: Result }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/${result.media_type}/${result.id}`} prefetch={false}>
      <div className="relative overflow-hidden rounded-md hover:text-white aspect-[2/3]">
        <div className="relative rounded-sm w-full h-full">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            src={
              result.poster_path
                ? `https://image.tmdb.org/t/p/original${result.poster_path}`
                : "/placeholder.png"
            }
            alt={result.title || result.name!}
            width={300}
            height={450}
            style={{ objectFit: "cover" }}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center rounded-sm bg-gray-900 bg-opacity-60 opacity-0 transition-opacity hover:opacity-100 hover:backdrop-blur-[2px]">
            <img src="/icon-play.png" alt="play" width={25} height={25} />
            <div className="absolute bottom-2 px-1 text-center text-sm font-semibold leading-snug sm:text-base">
              <h3 className="mb-2 line-clamp-2 text-xs font-semibold">
                {result.title || result.name}
              </h3>
              <p className="-mt-2 text-[10px] text-gray-400">
                {result.media_type?.toUpperCase()} /{" "}
                {new Date(
                  result.release_date || result.first_air_date || "",
                ).getFullYear()}
              </p>
            </div>
          </div>
          <div className="absolute top-2 rounded-r bg-yellow-500 px-0.5 text-xs font-semibold text-white">
            HD
          </div>
          <div className="absolute right-0 top-2 flex gap-1 rounded-l bg-black bg-opacity-50 pl-1 text-xs font-semibold text-white">
            <svg
              className="h-4 w-4 fill-yellow-500"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            {result.vote_average.toFixed(1)}
          </div>
        </div>
      </div>
    </Link>
  );
};

const getYearsList = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }
  return years;
};

const FilterSection = ({
  currentType,
  currentGenre,
  currentSort,
  currentYear,
  currentCountry,
  currentRating,
  currentWatchProvider,
  genres,
  watchProviders,
  handleReset,
  updateSearchParams,
}: FilterSectionProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
    const { start } = useTopLoader();
  const handleFilterChange = (params: { [key: string]: string }) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.set('page', '1');

    Object.entries(params).forEach(([key, value]) => {
      if (value === 'all') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    router.push(`${pathname}?${current.toString()}`);
  };

  const [genreSearch, setGenreSearch] = useState('');
  const [yearSearch, setYearSearch] = useState('');
  const [networkSearch, setNetworkSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  const [genreOpen, setGenreOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:flex xl:items-center xl:gap-0 xl:space-x-2">
      <Select
        value={currentType}
        onValueChange={(value: MediaType) => {
          if (value === "manga") {
            start();
            router.push("/manga");
            return;
          }
          if (value === "asian-drama") {
            start();
            router.push("/asian-drama");
            return;
          }
          handleFilterChange({ type: value });
        }}
      >
        <SelectTrigger className="w-full xl:w-[180px] bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <SelectItem value="all">Type</SelectItem>
          <SelectItem value="movie">Movies</SelectItem>
          <SelectItem value="tv">TV Shows</SelectItem>
          <SelectItem value="anime">Anime</SelectItem>
          <SelectItem value="asian-drama">Drama</SelectItem>
          <SelectItem value="manga">Manga</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={genreOpen} onOpenChange={setGenreOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full xl:w-[180px] justify-between bg-[#f3f4f6] dark:bg-[#2a2a30] border-0"
          >
            {genres.find(g => g.id.toString() === currentGenre)?.name || "Genre"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <Command className="bg-[#f3f4f6] dark:bg-[#2a2a30]">
            <CommandInput
              placeholder="Search genre..."
              className="h-9 bg-[#f3f4f6] dark:bg-[#2a2a30]"
              value={genreSearch}
              onValueChange={setGenreSearch}
            />
            <CommandGroup className="max-h-[200px] overflow-auto">
              <CommandItem
                value="all"
                onSelect={() => {
                  handleFilterChange({ genre: 'all' });
                  setGenreOpen(false);
                }}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !currentGenre || currentGenre === 'all' ? "opacity-100" : "opacity-0"
                  )}
                />
                All Genres
              </CommandItem>
              {genres
                .filter(genre =>
                  genre.name.toLowerCase().includes(genreSearch.toLowerCase())
                )
                .map((genre) => (
                  <CommandItem
                    key={genre.id}
                    value={genre.name}
                    onSelect={() => {
                      handleFilterChange({ genre: genre.id.toString() });
                      setGenreOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentGenre === genre.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {genre.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Select
        value={currentSort}
        onValueChange={(value: SortOption) =>
          handleFilterChange({ sort: value })
        }
      >
        <SelectTrigger className="w-full xl:w-[180px] bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <SelectItem value="popularity">Sort by</SelectItem>
          <SelectItem value="popular">Popular</SelectItem>
          <SelectItem value="rating">Top Rated</SelectItem>
          <SelectItem value="a-z">Title A-Z</SelectItem>
          <SelectItem value="z-a">Title Z-A</SelectItem>
          <SelectItem value="latest">Latest Release</SelectItem>
          <SelectItem value="oldest">Oldest Release</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={yearOpen} onOpenChange={setYearOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full xl:w-[180px] justify-between bg-[#f3f4f6] dark:bg-[#2a2a30] border-0"
          >
            {currentYear === 'all' ? 'Year' : currentYear}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <Command className="bg-[#f3f4f6] dark:bg-[#2a2a30]">
            <CommandInput
              placeholder="Search year..."
              className="h-9 bg-[#f3f4f6] dark:bg-[#2a2a30]"
              value={yearSearch}
              onValueChange={setYearSearch}
            />
            <CommandGroup className="max-h-[200px] overflow-auto">
              <CommandItem
                value="all"
                onSelect={() => {
                  handleFilterChange({ year: 'all' });
                  setYearOpen(false);
                }}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentYear === 'all' ? "opacity-100" : "opacity-0"
                  )}
                />
                Year
              </CommandItem>
              {getYearsList()
                .filter(year =>
                  year.toString().includes(yearSearch)
                )
                .map((year) => (
                  <CommandItem
                    key={year}
                    value={year.toString()}
                    onSelect={() => {
                      handleFilterChange({ year: year.toString() });
                      setYearOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentYear === year.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {year}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={networkOpen} onOpenChange={setNetworkOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full xl:w-[180px] justify-between bg-[#f3f4f6] dark:bg-[#2a2a30] border-0"
          >
            {watchProviders.find(p => p.provider_id.toString() === currentWatchProvider)?.provider_name || "Networks"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <Command className="bg-[#f3f4f6] dark:bg-[#2a2a30]">
            <CommandInput
              placeholder="Search network..."
              className="h-9 bg-[#f3f4f6] dark:bg-[#2a2a30]"
              value={networkSearch}
              onValueChange={setNetworkSearch}
            />
            <CommandGroup className="max-h-[200px] overflow-auto">
              <CommandItem
                value="all"
                onSelect={() => {
                  handleFilterChange({ watch_provider: 'all' });
                  setNetworkOpen(false);
                }}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !currentWatchProvider || currentWatchProvider === 'all' ? "opacity-100" : "opacity-0"
                  )}
                />
                All Networks
              </CommandItem>
              {watchProviders
                .filter(provider =>
                  provider.provider_name.toLowerCase().includes(networkSearch.toLowerCase())
                )
                .map((provider) => (
                  <CommandItem
                    key={provider.provider_id}
                    value={provider.provider_name}
                    onSelect={() => {
                      handleFilterChange({ watch_provider: provider.provider_id.toString() });
                      setNetworkOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentWatchProvider === provider.provider_id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {provider.provider_name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={countryOpen} onOpenChange={setCountryOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full xl:w-[180px] justify-between bg-[#f3f4f6] dark:bg-[#2a2a30] border-0"
          >
            {currentCountry === 'all' ? 'Country' : country.find(c => c.value === currentCountry)?.label || 'Country'}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <Command className="bg-[#f3f4f6] dark:bg-[#2a2a30]">
            <CommandInput
              placeholder="Search country..."
              className="h-9 bg-[#f3f4f6] dark:bg-[#2a2a30]"
              value={countrySearch}
              onValueChange={setCountrySearch}
            />
            <CommandGroup className="max-h-[200px] overflow-auto">
              <CommandItem
                value="all"
                onSelect={() => {
                  handleFilterChange({ country: 'all' });
                  setCountryOpen(false);
                }}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentCountry === 'all' ? "opacity-100" : "opacity-0"
                  )}
                />
                Country
              </CommandItem>
              {country
                .filter(c =>
                  c.label.toLowerCase().includes(countrySearch.toLowerCase())
                )
                .map((c) => (
                  <CommandItem
                    key={c.value}
                    value={c.label}
                    onSelect={() => {
                      handleFilterChange({ country: c.value });
                      setCountryOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentCountry === c.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {c.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Select
        value={currentRating}
        onValueChange={(value: RatingOption) =>
          handleFilterChange({ rating: value })
        }
      >
        <SelectTrigger className="w-full xl:w-[180px] bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
          <SelectItem value="all">Ratings</SelectItem>
          <SelectItem value="9">9+ ⭐</SelectItem>
          <SelectItem value="8">8+ ⭐</SelectItem>
          <SelectItem value="7">7+ ⭐</SelectItem>
          <SelectItem value="6">6+ ⭐</SelectItem>
          <SelectItem value="5">5+ ⭐</SelectItem>
          <SelectItem value="4">4+ ⭐</SelectItem>
          <SelectItem value="3">3+ ⭐</SelectItem>
          <SelectItem value="2">2+ ⭐</SelectItem>
          <SelectItem value="1">1+ ⭐</SelectItem>
        </SelectContent>
      </Select>

      <button
        onClick={handleReset}
        className="flex items-center justify-center gap-x-2 rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
      >
        <ResetIcon />
        Reset
      </button>
    </div>
  );
};

const SearchContent = () => {
  const [localInput, setLocalInput] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const {
    resultsMap,
    loading,
    error,
    handleSearch,
    currentType,
    currentGenre,
    currentSort,
    currentYear,
    currentCountry,
    currentRating,
    currentWatchProvider,
    genres,
    watchProviders,
    handleReset,
    updateSearchParams,
    currentPage,
    totalPages,
    handlePageChange,
    generatePaginationRange,
  } = useSearch();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localInput !== searchParams.get("q")) {
        const params = new URLSearchParams(searchParams);
        if (localInput) {
          params.set("q", localInput);
        } else {
          params.delete("q");
        }
        params.set("page", "1");
        router.push(`${pathname}?${params}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInput(e.target.value);
  };

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setLocalInput(query);
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] pt-20 space-y-4 px-4 py-6 min-h-[80vh]">
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search..."
          className="w-full rounded-lg py-4 capitalize text-black dark:text-white"
          value={localInput}
          onChange={handleInputChange}
        />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <FilterSection
            currentType={currentType}
            currentGenre={currentGenre}
            currentSort={currentSort}
            currentYear={currentYear}
            currentCountry={currentCountry}
            currentRating={currentRating}
            currentWatchProvider={currentWatchProvider}
            genres={genres}
            watchProviders={watchProviders}
            updateSearchParams={updateSearchParams}
            handleReset={handleReset}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500" />
        </div>
      ) : resultsMap.size === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-gray-500">No results found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {Array.from(resultsMap.values()).map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
            className="rounded-md bg-gray-900 hover:bg-gray-700 p-2 text-sm font-medium text-white hover:from-red-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {generatePaginationRange(currentPage, totalPages).map(
            (pageNum, index) => {
              if (pageNum === 'ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading || currentPage === pageNum}
                  className={`rounded-md px-3 py-2 min-w-10 h-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed
                    ${currentPage === pageNum
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  {pageNum + 1}
                </button>
              );
            }
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || loading}
            className="rounded-md bg-gray-900 hover:bg-gray-700 p-2 text-sm font-medium text-white hover:from-red-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchContent;
