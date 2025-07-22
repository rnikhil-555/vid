"use client";

import { useEffect, memo, useState, Fragment } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ResetIcon } from "@radix-ui/react-icons";
import { Filter as FilterIcon } from 'lucide-react';
import { Command, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MangaResult, useMangaSearch } from "@/hooks/use-manga-search";
import { usePathname } from "next/navigation";

const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

const AnimeResultCard = memo(({ result }: { result: MangaResult }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`${result.id}`}>
      <div className="relative overflow-hidden rounded-md hover:text-white">
        <div className="relative rounded-sm">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            className="object-cover"
            src={result.imageUrl || "/placeholder.png"}
            alt={result.name}
            style={{ width: "100%", height: "100%" }}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center rounded-sm bg-gray-900 bg-opacity-60 opacity-0 transition-opacity hover:opacity-100 hover:backdrop-blur-[2px]">
            <img src="/icon-play.png" alt="play" width={25} height={25} />
            <div className="absolute bottom-2 px-1 text-center text-sm font-semibold leading-snug sm:text-base">
              <h3 className="mb-2 line-clamp-2 text-xs font-semibold">
                {result.name}
              </h3>
              <p className="-mt-2 text-[10px] text-gray-400">
                {result.type}
              </p>
            </div>
          </div>
          <div className="absolute top-2 rounded-r bg-yellow-500 px-0.5 text-xs font-semibold text-white">
            {result.type}
          </div>
        </div>
      </div>
    </Link>
  )
});

AnimeResultCard.displayName = "AnimeResultCard";

interface FilterOption {
  name: string;
  value: string;
}

interface Filter {
  type_name: string;
  name: string;
  state?: any;
  values?: FilterOption[];
  type?: string;
}

const mangaTypes: FilterOption[] = [
  { name: "Manga", value: "manga" },
  { name: "One-Shot", value: "one_shot" },
  { name: "Doujinshi", value: "doujinshi" },
  { name: "Novel", value: "novel" },
  { name: "Manhwa", value: "manhwa" },
  { name: "Manhua", value: "manhua" },
];

const mangaGenres: FilterOption[] = [
  { name: "Action", value: "1" },
  { name: "Adventure", value: "78" },
  { name: "Avant Garde", value: "3" },
  { name: "Boys Love", value: "4" },
  { name: "Comedy", value: "5" },
  { name: "Demons", value: "77" },
  { name: "Drama", value: "6" },
  { name: "Ecchi", value: "7" },
  { name: "Fantasy", value: "79" },
  { name: "Girls Love", value: "9" },
  { name: "Gourmet", value: "10" },
  { name: "Harem", value: "11" },
  { name: "Horror", value: "530" },
  { name: "Isekai", value: "13" },
  { name: "Iyashikei", value: "531" },
  { name: "Josei", value: "15" },
  { name: "Kids", value: "532" },
  { name: "Magic", value: "539" },
  { name: "Mahou Shoujo", value: "533" },
  { name: "Martial Arts", value: "534" },
  { name: "Mecha", value: "19" },
  { name: "Military", value: "535" },
  { name: "Music", value: "21" },
  { name: "Mystery", value: "22" },
  { name: "Parody", value: "23" },
  { name: "Psychological", value: "536" },
  { name: "Reverse Harem", value: "25" },
  { name: "Romance", value: "26" },
  { name: "School", value: "73" },
  { name: "Sci-Fi", value: "28" },
  { name: "Seinen", value: "537" },
  { name: "Shoujo", value: "30" },
  { name: "Shounen", value: "31" },
  { name: "Slice of Life", value: "538" },
  { name: "Space", value: "33" },
  { name: "Sports", value: "34" },
  { name: "SuperPower", value: "75" },
  { name: "Supernatural", value: "76" },
  { name: "Suspense", value: "37" },
  { name: "Thriller", value: "38" },
  { name: "Vampire", value: "39" },
];

const statusTypes: FilterOption[] = [
  { name: "Releasing", value: "releasing" },
  { name: "Completed", value: "completed" },
  { name: "Hiatus", value: "on_hiatus" },
  { name: "Discontinued", value: "discontinued" },
  { name: "Not Yet Published", value: "info" },
];

const lengthOptions: FilterOption[] = [
  { name: ">= 1 chapters", value: "1" },
  { name: ">= 3 chapters", value: "3" },
  { name: ">= 5 chapters", value: "5" },
  { name: ">= 10 chapters", value: "10" },
  { name: ">= 20 chapters", value: "20" },
  { name: ">= 30 chapters", value: "30" },
  { name: ">= 50 chapters", value: "50" },
];

const sortOptions: FilterOption[] = [
  { name: "Added", value: "recently_added" },
  { name: "Updated", value: "recently_updated" },
  { name: "Trending", value: "trending" },
  { name: "Most Relevance", value: "most_relevance" },
  { name: "Release date", value: "release_date" },
  { name: "Name", value: "title_az" },
  { name: "Most favourited", value: "most_favourited" },
  { name: "Most viewed", value: "most_viewed" },
  { name: "MAL Scores", value: "mal_scores" },
  { name: "Scores", value: "scores" },
];

const languageOptions: FilterOption[] = [
  { name: "English", value: "en" },
  { name: "Japanese", value: "ja" },
  { name: "French", value: "fr" },
  { name: "Spanish", value: "es" },
  { name: "Spanish (LA)", value: "es-la" },
  { name: "Portuguese", value: "pt" },
  { name: "Portuguese (BR)", value: "pt-br" },
];

const yearOptions: FilterOption[] = [
  { name: "1930s", value: "1930s" },
  { name: "1940s", value: "1940s" },
  { name: "1950s", value: "1950s" },
  { name: "1960s", value: "1960s" },
  { name: "1970s", value: "1970s" },
  { name: "1980s", value: "1980s" },
  { name: "1990s", value: "1990s" },
  { name: "2000s", value: "2000s" },
  ...Array.from(
    { length: new Date().getFullYear() - 2005 + 1 }, 
    (_, i) => ({
      name: `${2005 + i}`,
      value: `${2005 + i}`
    })
  )
];

export default function MangaSearchContent() {
  const {
    results,
    loading,
    hasMore,
    inputValue,
    selectedType,
    selectedGenres,
    selectedStatus,
    selectedLength,
    selectedSort,
    setSelectedType,
    setSelectedGenres,
    setSelectedStatus,
    setSelectedLength,
    setSelectedSort,
    handleInputChange,
    handleReset,
    filterLoading,
    setFilterLoading,
    selectedLanguage,
    selectedYear,
    setSelectedLanguage,
    setSelectedYear,
    pagination, 
    fetchPage, 
  } = useMangaSearch();

  
  const [page, setPage] = useState(1);
  const [genreOpen, setGenreOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [yearSearch, setYearSearch] = useState('');

  const pathname = usePathname(); 
  
  const handleFilterClick = () => {
    setFilterLoading(true);
    const params = new URLSearchParams(window.location.search);

    params.set('page', '1');
    
    
    if (selectedType) {
      params.set('type[]', selectedType);
    } else {
      params.delete('type[]');
    }
    
    
    params.delete('genre[]');
    if (selectedGenres.length > 0) {
      selectedGenres.forEach(genre => {
        params.append('genre[]', genre);
      });
    }
    
    if (selectedStatus) {
      params.set('status[]', selectedStatus);
    } else {
      params.delete('status[]');
    }
    
    if (selectedLength) {
      params.set('minchap', selectedLength);
    } else {
      params.delete('minchap');
    }
    
    if (selectedSort) {
      params.set('sort', selectedSort);
    } else {
      params.set('sort', 'most_relevance');
    }
    
    if (selectedLanguage !== 'en') {
      params.set('language', selectedLanguage);
    } else {
      params.delete('language');
    }

    if (selectedYear) {
      params.set('year', selectedYear);
    } else {
      params.delete('year');
    }

    const newPath = `${pathname}?${params.toString()}`;
    window.history.pushState({ filters: params.toString() }, '', newPath);
    
    const currentFilters = {
      type: selectedType,
      genres: selectedGenres,
      status: selectedStatus,
      length: selectedLength,
      sort: selectedSort,
      language: selectedLanguage,
      year: selectedYear
    };

    fetchPage(1).then(() => {
      setSelectedType(currentFilters.type);
      setSelectedGenres(currentFilters.genres);
      setSelectedStatus(currentFilters.status);
      setSelectedLength(currentFilters.length);
      setSelectedSort(currentFilters.sort);
      setSelectedLanguage(currentFilters.language);
      setSelectedYear(currentFilters.year);
    });
  };

  const handleResetClick = () => {
    setSelectedType("");
    setSelectedGenres([]);
    setSelectedStatus("");
    setSelectedLength("");
    setSelectedSort("most_relevance");
    setSelectedLanguage("en");
    setSelectedYear("");
    setPage(1);
    
    const newPath = pathname;
    window.history.replaceState(null, '', newPath);
    
    fetchPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setFilterLoading(true);
    
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    
    params.delete('genre[]'); 
    if (selectedGenres.length > 0) {
      selectedGenres.forEach(genre => {
        params.append('genre[]', genre);
      });
    }
    
    if (selectedType) params.set('type[]', selectedType);
    if (selectedStatus) params.set('status[]', selectedStatus);
    if (selectedLength) params.set('minchap', selectedLength);
    if (selectedSort) params.set('sort', selectedSort);
    if (inputValue) params.set('q', inputValue);
    if (selectedLanguage !== 'en') params.set('language', selectedLanguage);
    if (selectedYear) params.set('year', selectedYear);
    
    const newPath = `${pathname}?${params.toString()}`;
    window.history.pushState({}, '', newPath);
    
    fetchPage(newPage);
  };

  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    const currentPage = currentParams.get('page') || '1';
    
    if (currentPage !== (page).toString()) {
      currentParams.set('page', page.toString());
      const newPath = `${pathname}?${currentParams.toString()}`;
      window.history.pushState({}, '', newPath);
    }
  }, [page, pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeFromURL = async () => {
      const params = new URLSearchParams(window.location.search);

      const filterUpdates = {
        type: params.get('type[]') || '',
        genres: params.getAll('genre[]') || [],
        status: params.get('status[]') || '',
        length: params.get('minchap') || '',
        sort: params.get('sort') || 'most_relevance',
        language: params.get('language') || 'en',
        year: params.get('year') || '',
        page: parseInt(params.get('page') || '1')
      };

      setSelectedType(filterUpdates.type);
      setSelectedGenres(filterUpdates.genres);
      setSelectedStatus(filterUpdates.status);
      setSelectedLength(filterUpdates.length);
      setSelectedSort(filterUpdates.sort);
      setSelectedLanguage(filterUpdates.language);
      setSelectedYear(filterUpdates.year);
      setPage(filterUpdates.page);

      if (window.location.search) {
        const fetchParams = new URLSearchParams();
        
        if (filterUpdates.type) {
          fetchParams.set('type[]', filterUpdates.type);
        }
        
        if (filterUpdates.genres.length > 0) {
          filterUpdates.genres.forEach(genre => {
            fetchParams.append('genre[]', genre);
          });
        }
        
        if (filterUpdates.status) {
          fetchParams.set('status[]', filterUpdates.status);
        }
        
        if (filterUpdates.length) {
          fetchParams.set('minchap', filterUpdates.length);
        }
        
        if (filterUpdates.sort) {
          fetchParams.set('sort', filterUpdates.sort);
        }
        
        if (filterUpdates.language !== 'en') {
          fetchParams.set('language', filterUpdates.language);
        }
        
        if (filterUpdates.year) {
          fetchParams.set('year', filterUpdates.year);
        }

        fetchParams.set('page', filterUpdates.page.toString());
        
        await fetchPage(filterUpdates.page);
      }
    };

    initializeFromURL();

    
    window.addEventListener('popstate', initializeFromURL);
    return () => window.removeEventListener('popstate', initializeFromURL);
  }, []); 

  return (
    <div className="container mx-auto max-w-[1440px] p-4 pt-20">
      <div className="mb-6 flex flex-col gap-4">
        <Input
          placeholder="Search manga..."
          className="w-full rounded-lg py-4 capitalize text-black dark:text-white"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:flex xl:items-center xl:gap-0 xl:space-x-2">
          {/* Type Filter */}
          <Select 
            value={selectedType} 
            onValueChange={(value) => {
              if (value === selectedType) {
                setSelectedType("");
              } else {
                setSelectedType(value);
              }
            }}
          >
            <SelectTrigger className="w-full xl:w-[180px] bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              {mangaTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Genre Filter - Multiple selection */}
          <Popover open={genreOpen} onOpenChange={setGenreOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full xl:w-[180px] justify-between bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
                Genres
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              <Command className="bg-[#f3f4f6] dark:bg-[#2a2a30]">
                <CommandInput
                  placeholder="Search genres..."
                  value={genreSearch}
                  onValueChange={setGenreSearch}
                  className="h-9 bg-[#f3f4f6] dark:bg-[#2a2a30]"
                />
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {mangaGenres
                    .filter(genre => 
                      genre.name.toLowerCase().includes(genreSearch.toLowerCase())
                    )
                    .map((genre) => (
                      <CommandItem
                        key={genre.value}
                        onSelect={() => {
                          setSelectedGenres((prev: string[]) =>
                            prev.includes(genre.value)
                              ? prev.filter((g: string) => g !== genre.value)
                              : [...prev, genre.value]
                          );
                        }}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedGenres.includes(genre.value) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {genre.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Select 
            value={selectedStatus} 
            onValueChange={(value) => setSelectedStatus(value === selectedStatus ? "" : value)}
          >
            <SelectTrigger className="w-full xl:w-[180px] bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              {statusTypes.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Length Filter */}
          <Select 
            value={selectedLength} 
            onValueChange={(value) => setSelectedLength(value === selectedLength ? "" : value)}
          >
            <SelectTrigger className="w-full xl:w-[180px] bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              <SelectValue placeholder="Length" />
            </SelectTrigger>
            <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              {lengthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select 
            value={selectedSort} 
            onValueChange={(value) => setSelectedSort(value === selectedSort ? "most_relevance" : value)}
          >
            <SelectTrigger className="w-full xl:w-[180px] bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Language Filter */}
          <Select 
            value={selectedLanguage} 
            onValueChange={(value) => {
              if (value === selectedLanguage) {
                setSelectedLanguage("en");
              } else {
                setSelectedLanguage(value);
              }
            }}
          >
            <SelectTrigger className="w-full xl:w-[180px] bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <Select
            value={selectedYear}
            onValueChange={(value) => {
              setSelectedYear(value === selectedYear ? "" : value);
            }}
          >
            <SelectTrigger className="w-full xl:w-[180px] bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
              {/* Year Search Bar */}
              <div className="px-2 py-2">
                <Input
                  placeholder="Search year..."
                  value={yearSearch}
                  onChange={e => setYearSearch(e.target.value)}
                  className="h-8 bg-[#f3f4f6] dark:bg-[#2a2a30] text-sm"
                />
              </div>
              {yearOptions
                .slice() // copy array
                .sort((a, b) => b.value.localeCompare(a.value)) // descending order
                .filter(option =>
                  !yearSearch ||
                  option.name.toLowerCase().includes(yearSearch.toLowerCase())
                )
                .map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Filter Button */}
          <button
            onClick={handleFilterClick}
            className="flex items-center justify-center gap-x-2 rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            <FilterIcon className="h-4 w-4" />
            Filter
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetClick}
            className="flex items-center justify-center gap-x-2 rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            <ResetIcon className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {(loading || filterLoading) ? (
        <div className="flex min-h-[50dvh] min-w-full items-center justify-center">
          <div role="status">
            <svg
              aria-hidden="true"
              className="size-7 animate-spin fill-red-600 text-gray-200 dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {(results || []).map((result) => ( // Add fallback empty array
            <AnimeResultCard
              key={`${result.id}-${result.name}`}
              result={result}
            />
          ))}
        </div>
      )}

      {!loading && !filterLoading && results.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-1">
            {/* First page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              «
            </button>

            {/* Previous page */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              ‹
            </button>

            {/* Generate page numbers */}
            {Array.from({ length:  pagination.totalPages!== 0 ? pagination.totalPages : pagination.currentPage || 1 }, (_, i) => i + 1)
              .filter(num => {
                // Always show current page, first and last pages, and pages around current
                if (num === 1) return true; // First page
                if (num === pagination.totalPages) return true; // Last page
                if (num === page) return true; // Current page
                if (Math.abs(num - page) <= 1) return true; // Pages around current
                return false;
              })
              .map((pageNum, index, array) => (
                <Fragment key={pageNum}>
                  {index > 0 && array[index - 1] !== pageNum - 1 && (
                    <span className="px-2">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      pageNum === page
  ? "dark:bg-white dark:text-black bg-black text-white font-medium"
  : "border hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {pageNum}
                  </button>
                </Fragment>
              ))}

            {/* Next page */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= (pagination.totalPages || 1)}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              ›
            </button>

            {/* Last page */}
            <button
              onClick={() => handlePageChange(pagination.totalPages || 1)}
              disabled={page >= (pagination.totalPages || 1)}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              »
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

