"use client";

import { Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

interface Episode {
  air_date: string;
  episode_number: number;
  episode_type: string;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null; // Add this line
  guest_stars: Array<any>;
}

interface ListItemProps {
  props: Episode;
  viewMode: "list" | "grid" | "thumbnail";
  tvId: number;
  backdrop: string;
  poster: string;
  description: string;
  isWrappedInAnchor: boolean;
  isActive: boolean;
  onClick?: () => Promise<void>;
}

export default function ListItem({
  props,
  viewMode,
  tvId,
  backdrop,
  poster,
  description,
  isWrappedInAnchor,
  isActive,
  onClick,
}: ListItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");
  const isActiveProp =
    isActive ||
    (parseInt(season! as string) == props.season_number &&
      parseInt(episode! as string) == props.episode_number);

  const handleNavigate = () => {
    router.push(
      `/watch/tv/${tvId}?season=${props.season_number}&episode=${props.episode_number}`,
    );
  };

  const handleClick = async () => {
    if (onClick) {
      await onClick(); 
    }
    handleNavigate(); 
  };

  const downloadLink = (
    <Link
      className="flex items-center justify-center pr-2"
      href={`https://dl.vidsrc.vip/tv/${tvId}/${props.season_number}/${props.episode_number}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Download className="z-50" />
    </Link>
  );

  if (viewMode === "list") {
    return (
      <div
        onClick={handleClick}
        className={`mb-2 flex h-20 w-full cursor-pointer gap-2 overflow-hidden rounded-md transition-colors ${
          isActiveProp
            ? "bg-gray-400 dark:bg-gray-900"
            : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a30] dark:hover:bg-gray-700"
        }`}
      >
        <div className="relative h-full min-w-36">
          <img
            className={`rounded-l-md object-cover ${isActiveProp ? "blur-[1.3px]" : ""}`}
            src={
              props.still_path
                ? `https://image.tmdb.org/t/p/original${props.still_path}`
                : `https://image.tmdb.org/t/p/original${backdrop || poster}`
            }
            alt={props.name}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              objectFit: "cover",
            }}
          />

          <div className="absolute inset-0">
            {isActiveProp && (
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  className="absolute left-1/2 top-1/2 mx-auto shrink-0 -translate-x-1/2 -translate-y-1/2 fill-slate-50"
                  viewBox="0 0 24 24"
                >
                  <rect width="24" height="24" fill="none"></rect>
                  <path d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"></path>
                </svg>
              </div>
            )}
            <div className="absolute left-0 top-0 rounded-br-md rounded-tl-md bg-black bg-opacity-70 px-2 py-1 text-sm text-white">
              {props.episode_number}
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center p-2">
          <h2 className="text-sm font-semibold">{props.name}</h2>
          <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
            {props.overview || description}
          </p>
        </div>
        <Link
          className="flex items-center justify-center pr-2"
          href={`https://dl.vidsrc.vip/tv/${tvId}/${props.season_number}/${props.episode_number}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="z-50" />
        </Link>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div
        onClick={handleClick}
        className={`mb-2 flex h-12 w-full cursor-pointer gap-2 overflow-hidden rounded-md transition-colors ${
          isActiveProp
            ? "bg-gray-400 dark:bg-gray-900"
            : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a30] dark:hover:bg-gray-700"
        }`}
      >
        <div className="flex flex-1 items-center justify-center p-2">
          <div className="flex flex-1 text-sm font-semibold">
            Episode {props.episode_number}: {props.name}
          </div>
          {downloadLink}
        </div>
      </div>
    );
  }

  if (viewMode === "thumbnail") {
    return (
      <div
        onClick={handleClick}
        className="relative aspect-video cursor-pointer transition-opacity hover:opacity-80"
      >
        <img
          className={`rounded-md ${isActiveProp ? "blur-[1.3px]" : ""}`}
          src={
            props.still_path
              ? `https://image.tmdb.org/t/p/original${props.still_path}`
              : `https://image.tmdb.org/t/p/original${backdrop || poster}`
          }
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          alt={props.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        <div className="absolute inset-0">
          {isActiveProp && (
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                className="absolute left-1/2 top-1/2 mx-auto shrink-0 -translate-x-1/2 -translate-y-1/2 fill-slate-50"
                viewBox="0 0 24 24"
              >
                <rect width="24" height="24" fill="none"></rect>
                <path d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"></path>
              </svg>
            </div>
          )}
          <div className="absolute left-0 top-0 rounded-br-md rounded-tl-md bg-black bg-opacity-70 px-2 py-1 text-sm text-white">
            {props.episode_number}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
