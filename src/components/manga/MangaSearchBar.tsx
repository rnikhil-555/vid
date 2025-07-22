"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

export default function MangaSearchBar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (search.trim()) {
      router.push(`/search/manga?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center justify-center w-full"
    >
      <div className="relative w-full max-w-xl">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search manga..."
          className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 pl-6 pr-12 text-base shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full p-2 shadow transition"
        >
          <FiSearch size={20} />
        </button>
      </div>
    </form>
  );
}