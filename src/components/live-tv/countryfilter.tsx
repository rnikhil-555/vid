import { Country } from '@/types/live-tv';
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
import { useState, useEffect, useMemo } from 'react';

const commandStyles = {
    input: "h-9",
    content: "w-full sm:w-[280px] p-0",
    group: "max-h-[300px] overflow-auto"
};

interface CountryFilterProps {
    countries: Country[];
    selectedCountry: string;
    onSelectCountry: (countryCode: string) => void;
}

export default function CountryFilter({
    countries,
    selectedCountry,
    onSelectCountry
}: CountryFilterProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        onSelectCountry('all');
    }, []);

    const filteredCountries = useMemo(() => {
        if (!searchQuery) return countries;
        return countries.filter(country =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [countries, searchQuery]);

    const selectedCountryName = useMemo(() =>
        value === 'all'
            ? 'All Countries'
            : countries.find(country => country.code === value)?.name || 'Select Country',
        [value, countries]
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
                    {selectedCountryName}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={commandStyles.content} align='start'>
                <Command>
                    <CommandInput
                        placeholder="Search country..."
                        className={commandStyles.input}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className={commandStyles.group}>
                        <CommandItem
                            value="all"
                            onSelect={() => {
                                setValue('all');
                                onSelectCountry('all');
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
                            All Countries
                        </CommandItem>
                        {filteredCountries.map((country) => (
                            <CommandItem
                                key={country.code}
                                value={country.name}
                                onSelect={() => {
                                    setValue(country.code);
                                    onSelectCountry(country.code);
                                    setOpen(false);
                                    setSearchQuery('');
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === country.code ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="flex items-center gap-2 w-full">
                                    <span className="flex-shrink-0 w-6">{country.flag}</span>
                                    <span className="truncate flex-1">{country.name}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}