import Example from "@/components/movie-page/youtube-player";
import { Button } from "@/components/ui/button";
import WatchlistButton from "@/components/shared/watchlist-button";
import PlayMovieButton from "@/components/shared/play-movie-button";
import {
  fetchCastInfo,
  fetchMovieInfo,
  fetchMovieRecommendations,
  fetchTrailerInfo,
} from "@/lib/api-calls/shows";
import { Download, Play, Plus, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { generateMediaMetadata } from "@/lib/metadata-helpers";

type Props = Promise<{ id: string }>;

export async function generateMetadata(props: {
  params: Props;
}): Promise<Metadata> {
  const params = await props.params;
  const movieData = await fetch(
    `https://api.themoviedb.org/3/movie/${params.id}?api_key=${process.env.TMDB_API_KEY}`,
  ).then((res) => res.json());

  return generateMediaMetadata({
    title: movieData.title,
    overview: movieData.overview,
    posterPath: movieData.poster_path,
    releaseDate: movieData.release_date,
    type: "movie",
  });
}

const Page = async (props: { params: Props }) => {
  const params = await props.params;
  const [movieInfo, trailerInfo, recommendationsInfo, castInfo] =
    await Promise.all([
      fetchMovieInfo(parseInt(params.id)),
      fetchTrailerInfo(parseInt(params.id)),
      fetchMovieRecommendations(parseInt(params.id)),
      fetchCastInfo(parseInt(params.id)),
    ]);

  if (!movieInfo || !trailerInfo || !recommendationsInfo || !castInfo) {
    return (
      <div className="p-4 text-center text-red-500 dark:text-red-400">
        Error occurred, we're sorry
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-16 text-gray-900 dark:text-gray-100 bg-white dark:bg-black">
      {/* Large Screens */}
      <div className="hidden font-semibold sm:block">
        <div className="relative h-[100vh] w-full">
          <img
            src={`${process.env.TMDB_IMG}${movieInfo.backdrop_path || movieInfo.poster_path}`}
            alt={movieInfo.title}
            className="fixed object-cover"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/20 dark:to-black"></div>
        </div>
        <div className="relative z-10 mx-auto -mt-96 max-w-screen-xl px-4 md:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-32">
            <div className="flex-shrink-0 md:w-1/3 lg:w-1/4">
              <img
                className="mx-auto rounded-xl shadow-xl md:mx-0"
                src={`${process.env.TMDB_IMG}${movieInfo.poster_path}`}
                alt={movieInfo.title}
                width="300"
                height="450"
              />

            </div>
            <div className="mt-6 md:mt-0 md:w-2/3 lg:w-3/4">
              <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                {movieInfo.title}
              </h1>
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex items-center">
                  <h3 className="mr-4">Movie</h3>
                  <Star className="mr-1 h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span>{movieInfo.vote_average.toFixed(1)}</span>
                </div>
                <span>{movieInfo.release_date.split("-")[0]}</span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {movieInfo.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-slate-900 bg-opacity-40 px-3 py-1 text-sm text-white dark:bg-red-900 dark:bg-opacity-40 dark:text-red-400"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              <p className="mb-6 text-lg">{movieInfo.overview}</p>
              <div className="flex items-center space-x-4">
                <PlayMovieButton
                  movieId={params.id}
                  title={movieInfo.title}
                  backdrop_path={movieInfo.backdrop_path}
                  className="border border-white font-bold transition-transform hover:scale-110"
                />
                <WatchlistButton
                  mediaId={params.id}
                  mediaType="movie"
                  title={movieInfo.title}
                  backdrop_path={movieInfo.backdrop_path}
                  variant="secondary"
                  size="lg"
                  className="border border-black bg-transparent font-bold transition-transform hover:scale-110 dark:border-white dark:text-white"
                />
                <Link href={`https://dl.vidsrc.vip/movie/${params.id}`}>
                  {/* <Button
                    variant={"secondary"}
                    size={"lg"}
                    className="border border-black bg-transparent font-bold dark:border-white dark:text-white"
                  > */}
                  <Download className="pr-1" />
                  {/* Download
                  </Button> */}
                </Link>
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
                        : "https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-4-user-grey-d8fe957375e70239d6abdd549fd7568c89281b2179b5f4470e2e12895792dfa5.svg"
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

          {/* Trailer */}
          <div className="mt-16">
            {/* <Player trailerInfo={trailerInfo} name={movieInfo.title} /> */}
            <Example trailerInfo={trailerInfo} height="580" />
          </div>

          {/* Recommendations */}
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">You may also like</h2>
            <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {recommendationsInfo.map((recommendation) => (
                <Link
                  href={`/movie/${recommendation.id}`}
                  key={recommendation.id}
                >
                  <div className="relative overflow-hidden rounded-md hover:text-white">
                    <div className="relative rounded-sm">
                      <img
                        className="object-cover"
                        src={
                          recommendation.poster_path
                            ? `https://image.tmdb.org/t/p/original${recommendation.poster_path}`
                            : "/placeholder.png"
                        }
                        alt={recommendation.title || ""}
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
                            {recommendation.title || ""}
                          </h3>
                          <p className="-mt-2 text-[10px] text-gray-400">
                            Movie /{" "}
                            {new Date(
                              recommendation.release_date || "",
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
      {/* Small Screens */}
      <div className="sm:hidden">
        <div className="relative h-[100vh] w-full">
          {/* Replacing Next.js Image with <img> tag */}
          <img
            src={`${process.env.TMDB_IMG}${movieInfo.poster_path || movieInfo.backdrop_path}`}
            alt={movieInfo.title}
            className="object-cover w-full h-full"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-black"></div>
        </div>

        <div className="relative z-10 -mt-[120%] px-4 py-6">
          {/* Movie Title */}
          <h1 className="mb-2 text-2xl font-semibold">{movieInfo.title}</h1>

          {/* Movie Info */}
          <div className="mb-4 flex items-center space-x-4">
            <div className="flex items-center">
              <h3 className="mr-4">Movie</h3>
              <Star className="mr-1 h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span>{movieInfo.vote_average.toFixed(1)}</span>
            </div>
            <span>{movieInfo.release_date.split("-")[0]}</span>
          </div>

          {/* Genres */}
          <div className="mb-4 flex flex-wrap gap-2">
            {movieInfo.genres.slice(0, 2).map((genre) => (
              <span
                key={genre.id}
                className="rounded-full bg-slate-900 bg-opacity-40 px-3 py-1 text-sm text-white dark:bg-red-900 dark:bg-opacity-40 dark:text-red-400"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="mb-6 text-sm">{movieInfo.overview}</p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-y-2">
            <PlayMovieButton
              movieId={params.id}
              title={movieInfo.title}
              backdrop_path={movieInfo.backdrop_path}
              className="w-full border border-white font-bold lg:transition-transform lg:hover:scale-110"
            />

            <WatchlistButton
              mediaId={params.id}
              mediaType="movie"
              title={movieInfo.title}
              backdrop_path={movieInfo.backdrop_path}
              variant="secondary"
              size="lg"
              className="w-full border border-black bg-transparent font-bold dark:border-white dark:text-white lg:transition-transform lg:hover:scale-110"
            />

            <Link href={`https://dl.vidsrc.vip/movie/${params.id}`}>
              <Button
                variant="secondary"
                className="flex w-full items-center justify-center space-x-2 border border-black lg:transition-transform lg:hover:scale-110"
              >
                <Download className="h-5 w-5" />
                <span>Download</span>
              </Button>
            </Link>
          </div>


          {/* Trailer */}
          <div className="mt-8">
            {/* <Player trailerInfo={trailerInfo} name={movieInfo.title} /> */}
            <Example trailerInfo={trailerInfo} height="250" />
          </div>

          {/* Recommendations */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold">You may also like</h2>
            <div className="grid grid-cols-3 justify-items-center gap-3">
              {recommendationsInfo.map((recommendation) => (
                <Link
                  href={`/movie/${recommendation.id}`}
                  key={recommendation.id}
                >
                  <div className="relative overflow-hidden rounded-md hover:text-white">
                    <div className="relative rounded-sm">
                      <img
                        className="object-cover"
                        src={
                          recommendation.poster_path
                            ? `https://image.tmdb.org/t/p/original${recommendation.poster_path}`
                            : "/placeholder.png"
                        }
                        alt={recommendation.title || ""}
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
                            {recommendation.title || ""}
                          </h3>
                          <p className="-mt-2 text-[10px] text-gray-400">
                            Movie /{" "}
                            {new Date(
                              recommendation.release_date || "",
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
    </div>
  );
};

export default Page;
