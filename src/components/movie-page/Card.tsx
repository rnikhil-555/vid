import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type CardProps = {
  type?: "anime";
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

const Card = ({ show }: { show: CardProps }) => {
  let type = "";
  let date = "";
  let name = "";
  if (show.title) {
    type = "Movie";
    name = show.original_title!;
    date = show.release_date!;
  } else {
    name = show.original_name!;
    date = show.first_air_date!;
    type = "TV";
  }
  return (
    <Link
      href={
        !show.type ? `/${type.toLowerCase()}/${show.id}` : `/anime/${show.id}`
      }
    >
      <div className="relative overflow-hidden hover:text-white">
  <div className="relative h-40 w-[104px] overflow-hidden rounded-sm sm:h-52 sm:w-32 md:h-44 md:w-28 lg:h-48 lg:w-32 xl:h-64 xl:w-44">
    <img
      className="object-cover transition-transform hover:scale-110"
      src={
        !show.type
          ? show.poster_path || show.backdrop_path
            ? `https://image.tmdb.org/t/p/original${
                show.poster_path ? show.poster_path : show.backdrop_path
              }`
            : "/placeholder.png"
          : show.poster_path!
      }
      alt={show.name ? show.name : show.title}
    />
    <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center rounded-sm bg-gray-900 bg-opacity-60 opacity-0 transition-opacity hover:opacity-100 hover:backdrop-blur-[2px]">
      <img src="/icon-play.png" alt="play" width={25} height={25} />
      <div className="absolute bottom-2 px-1 text-center text-sm font-semibold leading-snug sm:text-base">
        <h3 className="mb-2 line-clamp-2 text-xs font-semibold">
          {show.name ? show.name : show.title}
        </h3>
        <p className="-mt-2 text-[10px] text-gray-400">
          {!show.type ? type : show.type}
          {!show.type && (
            <>
              {" "}
              / {date ?? ""} /{" "}
              {show.original_language.toUpperCase() ?? ""}
            </>
          )}
        </p>
      </div>
    </div>
    <div className="absolute top-2 rounded-r bg-yellow-500 px-0.5 text-xs font-semibold text-white">
      HD
    </div>
    <div className="absolute right-0 top-2 flex gap-1 rounded-l bg-black bg-opacity-50 pl-1 text-xs font-semibold text-white">
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
};
export default Card;
