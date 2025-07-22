"use client";

import Link from "next/link";
import { memo } from "react";
import { Result } from "@/types/4k";

const ResultCard = memo(({ result, isFromCollection = false }: { result: Result, isFromCollection: boolean }) => {
  return (
    <Link href={`/movie/${result.id}`} prefetch={false}>
      <div className="group relative overflow-hidden rounded-md hover:text-white">
        <div className="relative aspect-[2/3] w-full rounded-sm">
          <img
            src={
              result.poster_path
                ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
                : "/placeholder.png"
            }
            alt={result.title || "Movie poster"}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover`}
            loading="lazy"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-sm bg-black/60 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
            <img
              src="/icon-play.png"
              alt="play"
              width={25}
              height={25}
              className="transform transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute bottom-2 px-1 text-center">
              <h3 className="mb-2 line-clamp-2 text-xs font-semibold sm:text-sm">
                {result.title}
              </h3>
              <p className="text-[10px] text-gray-300">
                {result?.media_type?.toUpperCase()} / {new Date(result.release_date || "").getFullYear()} / {result.original_language?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* HD Badge */}
          <div className="absolute left-0 top-2 rounded-r bg-yellow-500 px-1.5 py-0.5 text-xs font-semibold text-white">
            {isFromCollection ? "HD" : "4K"}
          </div>

          {/* Rating Badge */}
          <div className="absolute right-0 top-2 flex items-center gap-0.5 rounded-l bg-black/50 px-1.5 py-0.5 text-xs font-semibold text-white">
            <svg
              className="h-3.5 w-3.5 fill-yellow-500"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span>{result.vote_average?.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

ResultCard.displayName = "ResultCard";

export default ResultCard;