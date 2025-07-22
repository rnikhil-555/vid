import { Search } from "lucide-react";
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            onSearch(query);
        }, 300),
        [onSearch]
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    return (
        <div className="flex-1">
            <label className="input flex items-center px-4 py-2 gap-2 bg-background border border-input rounded-md hover:border-accent focus-within:border-ring">
                <input
                    className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground"
                    placeholder="Search Channel..."
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <Search className="h-4 w-4 text-muted-foreground" />
            </label>
        </div>
    );
}