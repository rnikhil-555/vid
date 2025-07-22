import { Button } from "@/components/ui/button";
import {
  fetchCastInfo,
  fetchTVInfo,
  fetchTVRecommendations,
  fetchTrailerInfo,
} from "@/lib/api-calls/tv";
import { Play, Plus, Star } from "lucide-react";
import Image from "next/image";
import { Combobox } from "../../../components/tv-page/EpisodesSection";
import Example from "@/components/movie-page/youtube-player";
import Link from "next/link";
import { Metadata } from "next";
import { generateMediaMetadata } from "@/lib/metadata-helpers";
import WatchlistButton from "@/components/shared/watchlist-button";

type Props = Promise<{ id: string }>;

// Generate metadata
export async function generateMetadata(props: {
  params: Props;
}): Promise<Metadata> {
  // Fetch TV show data
  const tvId = await props.params;
  const tvData = await fetch(
    `https://api.themoviedb.org/3/tv/${tvId.id}?api_key=${process.env.TMDB_API_KEY}`,
  ).then((res) => res.json());

  return generateMediaMetadata({
    title: tvData.name,
    overview: tvData.overview,
    posterPath: tvData.poster_path,
    releaseDate: tvData.first_air_date,
    type: "tv",
  });
}

const Page = async (props: { params: Props }) => {
  const tvId = await props.params;

  const [tvInfo, trailerInfo, recommendationsInfo, castInfo] =
    await Promise.all([
      fetchTVInfo(parseInt(tvId.id)),
      fetchTrailerInfo(parseInt(tvId.id)),
      fetchTVRecommendations(parseInt(tvId.id)),
      fetchCastInfo(parseInt(tvId.id)),
    ]);

  if (!tvInfo || !trailerInfo || !recommendationsInfo || !castInfo) {
    return (
      <div className="p-4 text-center text-red-500 dark:text-red-400">
        Error occurred, we're sorry
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-16 text-gray-900 dark:text-gray-100 bg-white dark:bg-black">
      {/* Background Image */}
      <div className="relative h-[95vh] overflow-hidden w-full">
        <img
          src={`${process.env.TMDB_IMG}${tvInfo.backdrop_path || tvInfo.poster_path}`}
          alt={tvInfo.name}
          className="object-cover w-full h-full"
          loading="lazy"
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/60 dark:to-black"></div>
      </div>


      {/* Content */}
      <div className="relative z-10 mx-auto -mt-96 max-w-screen-xl px-4 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-32">
          {/* Poster */}
          <div className="hidden flex-shrink-0 md:block md:w-1/3 lg:w-1/4">
            <img
              className="mx-auto rounded-xl shadow-xl md:mx-0"
              src={`${process.env.TMDB_IMG}${tvInfo.poster_path}`}
              alt={tvInfo.name}
              width="300"
              height="450"
            />

          </div>

          {/* Details */}
          <div className="mt-6 md:mt-0 md:w-2/3 lg:w-3/4">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {tvInfo.name}
            </h1>
            <div className="mb-4 flex items-center space-x-4">
              <div className="flex items-center">
                <h3 className="mr-4">Tv</h3>
                <Star className="mr-1 h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span>{tvInfo.vote_average.toFixed(1)}</span>
              </div>
              <span>{tvInfo.first_air_date.split("-")[0]}</span>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {tvInfo.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-slate-900 bg-opacity-40 px-3 py-1 text-sm text-white dark:bg-red-900 dark:bg-opacity-40 dark:text-red-400"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <p className="mb-6 text-lg">{tvInfo.overview}</p>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link href={`/watch/tv/${tvId.id}?season=1&episode=1`}>
                  <Button
                    variant={"default"}
                    size={"lg"}
                    className="border border-white font-bold transition-transform hover:scale-110"
                  >
                    <Play className="fill-black pr-1" />
                    Play
                  </Button>
                </Link>
                <WatchlistButton
                  mediaId={tvId.id}
                  mediaType="tv"
                  title={tvInfo.name}
                  backdrop_path={tvInfo.backdrop_path}
                  variant="secondary"
                  size="lg"
                  className="border border-black bg-transparent font-bold dark:border-white dark:text-white lg:transition-transform lg:hover:scale-110"
                />
              </div>
            </div>
            <div className="space-y-3 md:hidden">
              <Link href={`/watch/tv/${tvId.id}?season=1&episode=1`}>
                <Button
                  variant={"default"}
                  size={"lg"}
                  className="w-full border border-white font-bold lg:transition-transform lg:hover:scale-110"
                >
                  <Play className="fill-black pr-1" />
                  Play
                </Button>
              </Link>
              <WatchlistButton
                mediaId={tvId.id}
                mediaType="tv"
                title={tvInfo.name}
                backdrop_path={tvInfo.backdrop_path}
                variant="secondary"
                size="lg"
                className="w-full border border-black bg-transparent font-bold dark:border-white dark:text-white lg:transition-transform lg:hover:scale-110"
              />
            </div>
          </div>
        </div>

        {/* Cast */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Cast</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {castInfo.slice(0, 8).map((cast) => (
              <div key={cast.id} className="flex items-center space-x-4">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={
                    cast.profile_path
                      ? `${process.env.TMDB_IMG}${cast.profile_path}`
                      : `https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-4-user-grey-d8fe957375e70239d6abdd549fd7568c89281b2179b5f4470e2e12895792dfa5.svg`
                  }
                  width="64"
                  height="64"
                  alt={cast.name}
                />

                <div>
                  <h3 className="font-semibold">{cast.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cast.character}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mb-8 mt-16">
          <Combobox props={{
            ...tvInfo,
            name: tvInfo.name // Make sure to pass the name
          }} />
        </div>

        {/* Trailer */}
        <div className="mt-8 sm:hidden">
          {/* <Player trailerInfo={trailerInfo} name={tvInfo.name} /> */}
          <Example trailerInfo={trailerInfo} height="250" />
        </div>
        <div className="hidden sm:block">
          {/* <Player trailerInfo={trailerInfo} name={tvInfo.name} /> */}
          <Example trailerInfo={trailerInfo} height="580" />
        </div>

        {/* Recommendations */}
        <div className="mt-16">
          <h2 className="mb-4 text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-3 justify-items-center gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {recommendationsInfo.slice(0, 12).map((recommendation) => (
              <Link href={`/tv/${recommendation.id}`} key={recommendation.id}>
                <div className="relative overflow-hidden rounded-md hover:text-white">
                  <div className="relative rounded-sm">
                    <img
                      className="object-cover"
                      src={
                        recommendation.poster_path
                          ? `https://image.tmdb.org/t/p/original${recommendation.poster_path}`
                          : "/placeholder.png"
                      }
                      alt={recommendation.name || ""}
                      style={{ width: "100%", height: "100%" }}
                    />
                    <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center rounded-sm bg-gray-900 bg-opacity-60 opacity-0 transition-opacity hover:opacity-100 hover:backdrop-blur-[2px]">
                      <img
                        src="/icon-play.png"
                        alt="play"
                        width={25}
                        height={25}
                      />
                      <div className="absolute bottom-2 px-1 text-center text-sm font-semibold leading-snug sm:text-base">
                        <h3 className="mb-2 line-clamp-2 text-xs font-semibold">
                          {recommendation.name || ""}
                        </h3>
                        <p className="-mt-2 text-[10px] text-gray-400">
                          Tv /{" "}
                          {new Date(
                            recommendation.first_air_date || "",
                          ).getFullYear()}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 rounded-r bg-yellow-500 px-0.5 text-xs font-semibold text-white">
                      HD
                    </div>
                    <div className="absolute right-0 top-2 flex gap-1 rounded-l bg-black bg-opacity-50 pl-1 text-xs font-semibold text-white">
                      <svg
                        className="h-4 w-4 fill-yellow-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      {recommendation.vote_average.toFixed(1)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
