"use client";

import { Input } from "../ui/input";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useSearch } from "./search";

interface MobileSearchProps {
  isVisible: boolean;
  onClose: () => void;
}

const MobileSearch = ({ isVisible, onClose }: MobileSearchProps) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const searchHook = useSearch();
  const { query, showResults, results } = searchHook;

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 right-0 top-[70px] z-50 bg-black/90 px-4 py-2">
      <div className="relative" ref={searchRef}>
        <Input
          className={cn(
            "h-10 w-full rounded-3xl border-0 bg-black/50 font-semibold capitalize !text-white placeholder:text-center placeholder:text-gray-500 focus:placeholder:opacity-0",
            query && "pl-[85px]",
          )}
          placeholder="Search"
          value={query}
          onChange={searchHook.handleQueryChange}
          onFocus={searchHook.handleInputFocus}
          autoFocus
        />
      </div>
    </div>
  );
};

export default MobileSearch;
