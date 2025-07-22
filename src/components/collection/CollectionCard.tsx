import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "@/types/collection";

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${w}" height="${h}" fill="#1a1a1a">
    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
  </rect>
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

const CollectionCard = memo(({ collection }: { collection: Collection }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/collection/${collection.id}`} prefetch={false}>
      <div className="group relative overflow-hidden rounded-lg">
        <div className="relative aspect-[16/9] w-full">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800" />
          )}
          <Image
            src={
              collection.backdrop_path
                ? `https://image.tmdb.org/t/p/w780${collection.backdrop_path}`
                : `https://image.tmdb.org/t/p/w780${collection.poster_path}`
            }
            alt={collection.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              } group-hover:scale-110`}
            quality={80}
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(780, 439))}`}
            onLoadingComplete={() => setImageLoaded(true)}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <h2 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">
              {collection.name}
            </h2>
            <p className="mt-2 text-sm text-gray-300 line-clamp-2">
              {collection.overview}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded bg-yellow-500 px-2 py-1 text-xs font-semibold text-black">
                {collection.parts.length} Movies
              </span>
              <span className="text-xs text-gray-400">
                {collection.parts[0]?.release_date &&
                  `First Release: ${new Date(collection.parts[0].release_date).getFullYear()}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

CollectionCard.displayName = "CollectionCard";

export default CollectionCard;