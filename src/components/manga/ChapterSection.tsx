"use client";

import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MangaCard from "./MangaCard";

// Simple spinner component
function Spinner() {
  return (
    <div className="flex justify-center items-center h-40">
      <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  );
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Add a mapping for language codes to flag emojis
const langFlags: Record<string, string> = {
  en: "🇺🇸",
  fr: "🇫🇷",
  es: "🇪🇸",
  "es-la": "🇲🇽",
  pt: "🇵🇹",
  "pt-br": "🇧🇷",
  ja: "🇯🇵",
  ru: "🇷🇺",
  de: "🇩🇪",
  it: "🇮🇹",
  zh: "🇨🇳",
  ko: "🇰🇷",
  th: "🇹🇭",
  ar: "🇸🇦",
  tr: "🇹🇷",
};

export function ChaptersSection({
  chapters,
  mangaId,
  languages,
  recommendations,
}: {
  chapters: any[];
  mangaId: string;
  languages: Array<{ code: string; title: string; count: number }>;
  recommendations: Array<{ id: string; name: string; imageUrl: string; type: string; chapter?: string; vol?: string }>;
}) {
  const [orderAsc, setOrderAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // SWR fetch for non-English languages
  const { data: fetchedChapters, isLoading } = useSWR(
    selectedLanguage !== "en"
      ? `/api/manga/chapters/${mangaId}?lang=${selectedLanguage}`
      : null,
    fetcher
  );

  // Use prop chapters for English, fetchedChapters for others
  const chaptersWithLang = useMemo(
    () =>
      (selectedLanguage === "en"
        ? chapters
        : fetchedChapters || []
      ).map((ch: any) => ({ ...ch, language: selectedLanguage })),
    [chapters, fetchedChapters, selectedLanguage]
  );

  const filteredChapters = useMemo(() => {
    let filtered = chaptersWithLang;
    filtered = filtered.filter((ch: any) => ch.language === selectedLanguage);

    if (searchTerm && searchTerm.trim() !== "") {
      filtered = filtered.filter((ch: any) => {
        const chapterNo =
          typeof ch.chapterNo !== "undefined"
            ? String(ch.chapterNo)
            : ch.name.match(/(\d+(\.\d+)?)/)?.[0] ?? "";
        return chapterNo.includes(searchTerm);
      });
    }
    return orderAsc ? filtered : [...filtered].reverse();
  }, [chaptersWithLang, orderAsc, searchTerm, selectedLanguage]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white/80 dark:bg-black/60 p-4 shadow-lg border dark:border-gray-800">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            {languages.length > 0 && (
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-44 bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#f3f4f6] dark:bg-[#2a2a30] border-0">
                  {languages.map((lang) => (
                    <SelectItem
                      key={lang.code}
                      value={lang.code}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xl mr-2">{langFlags[lang.code] || "🏳️"}</span>
                      {lang.title} ({lang.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              placeholder="Chapter no."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-32 rounded-md border bg-background px-2 py-[5px] text-sm"
              min="1"
            />
            <button
              onClick={() => setOrderAsc((o) => !o)}
              className="rounded-md px-2 py-1 text-xs font-medium"
              title={orderAsc ? "Descending" : "Ascending"}
              type="button"
            >
              {orderAsc ? (
                <ArrowUpNarrowWide className="cursor-pointer" />
              ) : (
                <ArrowDownWideNarrow className="cursor-pointer" />
              )}
            </button>
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto divide-y dark:divide-gray-800">
          {selectedLanguage !== "en" && isLoading ? (
            <Spinner />
          ) : filteredChapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              {searchTerm.trim() !== "" ? (
                <>
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    No chapters found matching number "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    type="button"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  No chapters found for this language.
                </p>
              )}
            </div>
          ) : (
            filteredChapters.map((chapter: any) => (
              <Link
                href={`/manga/${mangaId}/${chapter.url.split("/").pop()}?lang=${chapter.language}`}
                key={chapter.url}
              >
                <div className="mb-2 flex h-12 w-full md:w-[99%] cursor-pointer gap-2 overflow-hidden rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a30] dark:hover:bg-gray-700">
                  <div className="flex flex-col justify-center px-4">
                    <span className="font-medium">{chapter.name}</span>
                    {chapter.dateUpload && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(Number(chapter.dateUpload)).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((rec) => (
              <MangaCard
                key={rec.id}
                id={rec.id}
                name={rec.name}
                imageUrl={rec.imageUrl.includes('@100') ? rec.imageUrl?.replace("@100",'@1000') : rec.imageUrl}
                type={rec.type}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}