"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DramaCard from "@/components/DramaCard";
import DramaCardSkeleton from "@/components/DramaCardSkeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, GENRES, TYPES } from "@/constants/filters";
import { useDebounce } from '@/hooks/useDebounce';
import { ResetIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Filters {
  search: string;
  type: string;
  genre: string;
  year: string;
  country: string;
}

export default function KDramaHome() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
    genre: "",
    year: "",
    country: "",
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const fetchData = async () => {
    if (!filters.search && !filters.type && !filters.genre && !filters.year && !filters.country) {
      setLoading(true);
    }

    try {
      if (filters.search) {
        const response = await fetch(`/api/drama/search?query=${filters.search}`);
        const result = await response.json();
        setData({ ...data, recently_added: result.data });
      } else if (filters.type || filters.genre || filters.year || filters.country) {
        const queryParams = new URLSearchParams({
          ...(filters.type && { type: filters.type }),
          ...(filters.genre && { genre: filters.genre }),
          ...(filters.year && { 'release-year': filters.year }),
          ...(filters.country && { country: filters.country }),
        });
        const response = await fetch(`/api/drama/discover?${queryParams.toString()}`);
        const result = await response.json();
        setData({ ...data, recently_added: result.data });
      } else {
        const response = await fetch('/api/drama/home');
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, filters.type, filters.genre, filters.year, filters.country]); // Re-fetch when filters change

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Update URL with filter params
    const queryParams = new URLSearchParams(window.location.search);
    if (value) {
      queryParams.set(key, value);
    } else {
      queryParams.delete(key);
    }
    window.history.pushState({}, '', `?${queryParams.toString()}`);
  };

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

  const navButtons = [
    { label: "Latest", color: "bg-blue-500", href: "/asian-drama/latest" },
    { label: "Latest K-Drama", color: "bg-pink-500", href: "/asian-drama/latest-kdrama" },
    { label: "Popular", color: "bg-purple-500", href: "/asian-drama/popular" },
    { label: "Upcoming", color: "bg-yellow-500", href: "/asian-drama/upcoming" },
  ];

  const [genreOpen, setGenreOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [yearSearch, setYearSearch] = useState('');

  const filteredGenres = GENRES.filter(genre =>
    genre.label.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const years = [
    ...Array.from(
      { length: new Date().getFullYear() - 2000 },
      (_, i) => new Date().getFullYear() - i
    ),
    2000, 1999, 1998, 1996, 1994, 1992, 1991, 1986, 1982, 1981, 1958
  ];

  const filteredYears = years.filter(year =>
    year.toString().includes(yearSearch)
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 mt-12 max-w-[1440px] min-h-screen">
      {/* Navigation Buttons - Always visible */}
      <div className="flex flex-wrap gap-4 mb-8">
        {navButtons.map((button) => (
          <Link
            key={button.label}
            href={button.href}
            className={`${button.color} hover:opacity-90 text-white px-6 py-2 rounded-full transition-all`}
          >
            {button.label}
          </Link>
        ))}
      </div>

      {/* Search Bar - Full width */}
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
                  {filteredGenres.map((genre) => (
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
                  {filteredYears.map((year) => (
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


      {/* Recently Added Section */}
      <section className="mb-12">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {[...Array(21)].map((_, index) => (
              <DramaCardSkeleton key={index} />
            ))}
          </div>
        ) : data?.recently_added?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {data.recently_added.map((drama: any) => (
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
      </section>
    </div>
  );
}