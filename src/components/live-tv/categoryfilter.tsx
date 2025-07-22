import { Category, Channel } from '@/types/live-tv';
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useMemo } from 'react';
import { calculateCategoryCounts, getCachedCategoryCounts, setCachedCategoryCounts } from '@/utils/categoryUtils';


const commandStyles = {
    input: "h-9",
    content: "w-full sm:w-[200px] p-0",
    group: "max-h-[200px] overflow-auto"
};

interface CategoryFilterProps {
    categories: Category[];
    channels: Channel[];
    selectedCategory: string;
    selectedCountry: string;
    onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({
    categories,
    channels,
    selectedCategory,
    selectedCountry,
    onSelectCategory
}: CategoryFilterProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(selectedCategory);
    const [searchQuery, setSearchQuery] = useState('');


    const { categoriesWithCount, allCategoriesCount } = useMemo(() => {
        const CACHE_KEY = 'category-counts';
        const cached = getCachedCategoryCounts(CACHE_KEY, selectedCountry);

        if (cached) {
            const allCount = cached.find(c => c.categoryId === 'all')?.count || 0;
            const categoriesData = categories
                .map(cat => ({
                    ...cat,
                    count: cached.find(c => c.categoryId === cat.id)?.count || 0
                }))
                .filter(cat => cat.count > 0); // Filter out categories with zero count
            return { categoriesWithCount: categoriesData, allCategoriesCount: allCount };
        }

        const categoriesWithCounts = calculateCategoryCounts(channels, categories, selectedCountry);
        const allCount = categoriesWithCounts.find(cat => cat.id === 'all')?.count || 0;
        const regularCategories = categoriesWithCounts
            .filter(cat => cat.id !== 'all' && cat.count > 0); // Filter out "all" and zero count categories

        setCachedCategoryCounts(CACHE_KEY, categoriesWithCounts, selectedCountry);
        return { categoriesWithCount: regularCategories, allCategoriesCount: allCount };
    }, [categories, channels, selectedCountry]);


    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categoriesWithCount;
        return categoriesWithCount.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categoriesWithCount, searchQuery]);

    const selectedCategoryName = useMemo(() =>
        value === 'all'
            ? `All Categories (${allCategoriesCount})`
            : `${categoriesWithCount.find(category => category.id === value)?.name || 'Select category'}`,
        [value, allCategoriesCount, categoriesWithCount]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full sm:w-[200px] justify-between"
                >
                    {selectedCategoryName}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={commandStyles.content} align='end'>
                <Command>
                    <CommandInput
                        placeholder="Search category..."
                        className={commandStyles.input}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup className={commandStyles.group}>
                        <CommandItem
                            value="all"
                            onSelect={() => {
                                setValue('all');
                                onSelectCategory('all');
                                setOpen(false);
                                setSearchQuery('');
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value === 'all' ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <div className="flex items-center justify-between w-full">
                                <span>All Categories</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                    ({allCategoriesCount})
                                </span>
                            </div>
                        </CommandItem>
                        {filteredCategories.map((category) => (
                            <CommandItem
                                key={category.id}
                                value={category.id}
                                onSelect={() => {
                                    setValue(category.id);
                                    onSelectCategory(category.id);
                                    setOpen(false);
                                    setSearchQuery('');
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === category.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="flex items-center justify-between w-full">
                                    <span>{category.name}</span>
                                    {typeof category.count !== 'undefined' && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({category.count})
                                        </span>
                                    )}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}