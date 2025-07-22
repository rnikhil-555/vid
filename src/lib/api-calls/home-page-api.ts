import { fetchShows } from "./homeApiCalls";

export async function fetchHomePageData() {
  try {
    const [
      trendingMovies,
      trendingTV,
      netflixShows,
      huluShows,
      amazonShows,
      appleShows,
      disneyShows,
      indianShows,
      peacockShows,
      paramountShows,
      hboShows,
    ] = await Promise.all([
      fetchShows(
        "https://api.themoviedb.org/3/trending/movie/day?language=en-US",
      ),
      fetchShows("https://api.themoviedb.org/3/trending/tv/day?language=en-US"),
      fetchShows("https://api.themoviedb.org/3/discover/tv?with_networks=213"),
      fetchShows(
        "https://api.themoviedb.org/3/discover/tv?with_watch_providers=387&watch_region=US",
      ),
      fetchShows(
        "https://api.themoviedb.org/3/discover/tv?with_watch_providers=9&watch_region=US",
      ),
      fetchShows(
        "https://api.themoviedb.org/3/discover/tv?with_watch_providers=2&watch_region=US",
      ),
      fetchShows(
        "https://api.themoviedb.org/3/discover/tv?with_watch_providers=337&watch_region=US",
      ),
      fetchShows(
        "https://api.themoviedb.org/3/discover/tv?with_origin_country=IN",
      ),
      fetchShows(
        "https://api.themoviedb.org/3/discover/tv?with_watch_providers=386&watch_region=US",
      ),
      fetchShows(
        "https://api.themoviedb.org/3/discover/tv?with_watch_providers=531&watch_region=US",
      ),
      fetchShows(
        "https://api.themoviedb.org/3/discover/tv?with_watch_providers=384",
      ),
    ]);

    return {
      trendingMovies,
      trendingTV,
      netflixShows,
      huluShows,
      amazonShows,
      appleShows,
      disneyShows,
      indianShows,
      peacockShows,
      paramountShows,
      hboShows,
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    throw error;
  }
}
