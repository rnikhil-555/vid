import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { memo, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

type CardProps = {
  id: number;
  name?: string;
  title?: string;
  original_name?: string;
  original_title?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  original_language: string;
};

const Card = memo(({ show }: { show: CardProps }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const type = show.title ? "Movie" : "TV";
  const name = show.title ? show.original_title! : show.original_name!;
  const date = show.title ? show.release_date! : show.first_air_date!;
  const imageUrl =
    show.poster_path || show.backdrop_path
      ? `https://image.tmdb.org/t/p/w342${show.poster_path ?? show.backdrop_path}`
      : "/placeholder.png";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Link href={`/${type.toLowerCase()}/${show.id}`} prefetch={false}>
      <div className="group relative" ref={cardRef}>
        <div className="relative mr-2 h-52 w-32 overflow-hidden rounded-sm transition-transform duration-300 will-change-transform sm:h-52 sm:w-32 md:h-48 md:w-32 lg:h-48 lg:w-32 xl:h-48 xl:w-[135px]">
          {!isVisible || imageLoading ? (
            <div className="absolute inset-0 z-10">
              <Skeleton className="h-full w-full animate-pulse bg-gray-200/80" />
            </div>
          ) : null}
          {isVisible && (
            <img
              className={cn(
                "h-full w-full bg-gray-500/10 object-cover transition-opacity duration-300",
                imageLoading ? "opacity-0" : "opacity-100",
              )}
              src={imageUrl}
              alt={(show.name ?? show.title)!}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              style={{
                aspectRatio: '2/3',
              }}
            />
          )}

          {/* Hover overlay */}
          <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center rounded-sm bg-gray-900/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <img
              src="/icon-play.png"
              alt="play"
              width={25}
              height={25}
              loading="lazy"
              className="transform transition-transform duration-300"
            />
            <div className="absolute bottom-2 px-1 text-center text-sm font-semibold leading-snug sm:text-base">
              <h3 className="mb-2 line-clamp-2 text-xs font-semibold">
                {show.name ?? show.title}
              </h3>
              <p className="-mt-2 text-[10px] text-gray-400">
                {type} / {date.split("-")[0]} /{" "}
                {show.original_language.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 rounded-r bg-yellow-500 px-0.5 text-xs font-semibold text-white">
            HD
          </div>
          <div className="absolute right-0 top-2 flex gap-1 rounded-l bg-black/50 pl-1 text-xs font-semibold text-white">
            <Star
              size={16}
              strokeWidth={0.5}
              className="border-0 fill-yellow-500"
            />
            {show.vote_average.toPrecision(2)}
          </div>
        </div>
      </div>
    </Link>
  );
});

Card.displayName = "Card";

export default Card;
