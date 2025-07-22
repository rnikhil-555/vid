import { Metadata } from "next";
import { Suspense } from "react";
import ListRow from "@/components/home/lists/list-item";
import TopWidget from "@/components/home/lists/top-widget";
import PopularWidget from "@/components/home/lists/popular-widget";
import { fetchExplorePageDataFirst, getTopSliderData } from "@/lib/api-calls/explore-page-api";
import { defaultMetadata } from "@/lib/metadata";
import { Shows } from "@/types/tmdbApi";
import { TopSliderClient } from "@/components/home/top-slider";

export const metadata: Metadata = {
  ...defaultMetadata,
  alternates: {
    canonical: "https://vidbox.to/home",
  },
  openGraph: {
    ...defaultMetadata.openGraph,
    title: "Vidbox - Explore Movies & TV Shows Across All Platforms",
    description:
      "Find trending movies, TV shows, and exclusive content from Netflix, Disney+, Amazon Prime, and more. Your one-stop destination for streaming entertainment.",
  },
};

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function ExplorePage() {
  const data = await fetchExplorePageDataFirst();
  const sliderData = await getTopSliderData();
  const {
    trendingMovies: { results: trendingMovies },
    trendingTV: { results: trendingTV },
    netflixShows: { results: netflixShows },
    amazonShows: { results: amazonShows },
    appleTVShows: { results: appleTVShows },
    disneyShows: { results: disneyShows },
    indianShows: { results: indianShows },
    peacockShows: { results: peacockShows },
    paramountShows: { results: paramountShows },
    maxShows: { results: maxShows },
  } = data as {
    [K in keyof typeof data]: {
      results: Shows[];
    };
  };

  return (
    <main className="bg-white pb-32 text-gray-900 dark:bg-black dark:text-white">
      <TopSliderClient initialData={sliderData} />
      <div className="mx-auto max-w-[1440px] px-2 pt-28">
        <div className="md:grid md:grid-cols-12">
          <div className="pt-5 md:col-span-8">
            <div className="">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Trending Movies
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={trendingMovies} />
              </Suspense>
            </div>
            <div className="mt-5">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-purple-400 dark:to-purple-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Trending TV Shows
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={trendingTV} />
              </Suspense>
            </div>
            <div className="mt-5">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-red-400 dark:to-red-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Netflix Originals
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={netflixShows} />
              </Suspense>
            </div>
            <div className="mt-5">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-green-400 dark:to-green-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Amazon Prime Shows
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={amazonShows} />
              </Suspense>
            </div>
            <div className="mt-5">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-orange-400 dark:to-orange-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Apple TV+ Shows
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={appleTVShows} />
              </Suspense>
            </div>
            <div className="mt-5">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Disney+ Shows
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={disneyShows} />
              </Suspense>
            </div>
            <div className="mt-5">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-pink-400 dark:to-pink-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Indian TV Shows
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={indianShows} />
              </Suspense>
            </div>
            <div className="mt-5">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Peacock TV Shows
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={peacockShows} />
              </Suspense>
            </div>
            <div className="mt-5">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-lime-400 dark:to-lime-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Paramount+ Shows
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={paramountShows} />
              </Suspense>
            </div>
            <div className="mt-5">
              <h1 className="inline-block pl-2 text-lg font-bold text-black dark:bg-gradient-to-r dark:from-amber-400 dark:to-amber-800 dark:bg-clip-text dark:text-transparent sm:text-2xl lg:px-0">
                Max Shows
              </h1>
              <Suspense fallback={<div className="h-52 md:h-48">Loading</div>}>
                <ListRow items={maxShows} />
              </Suspense>
            </div>
          </div>
          <div className="md:col-span-4">
            <TopWidget />
            <PopularWidget />
          </div>
        </div>
      </div>
    </main>
  );
}
