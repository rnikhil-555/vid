"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { Result } from "@/types/drama";

const DramaCard = memo(({ result }: { result: Result}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/drama/${result.id}`} prefetch={false}>
      <div className="group relative overflow-hidden rounded-md hover:text-white">
        <div className="relative aspect-[2/3] w-full rounded-sm">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-sm" />
          )}
          <img
            src={result.image || "/placeholder.png"}
            alt={result.title || "Drama poster"}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover w-full h-full transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          
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
                {result.episode ? `Episode ${result.episode}` : ''} 
                {result.time && ` • ${result.time}`}
              </p>
            </div>
          </div>

          {result.episode && (
            <div className="absolute left-0 top-2 rounded-r bg-yellow-500 px-1.5 py-0.5 text-xs font-semibold text-white">
              {result.episode}
            </div>
          )}

          {result.vote_average && (
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
          )}
        </div>
      </div>
    </Link>
  );
});

DramaCard.displayName = "DramaCard";

export default DramaCard;