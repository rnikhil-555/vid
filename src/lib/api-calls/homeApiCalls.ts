import { Shows, TrendingMovies, TrendingTV } from "@/types/tmdbApi";

export const fetchShows = async (url: string): Promise<Shows[] | null> => {
  try {
    const initialResponse = await fetch(
      `${url}&api_key=${process.env.TMDB_API_KEY}`,
      {
        next: { revalidate: 3600 }, // 1 hours
      },
    );
    const response = await initialResponse.json();
    // console.log(response.results);
    return response.results;
  } catch (err) {
    // console.log(err);
    return null;
  }
};

export const fetchPopularMovies = async (
  url: string,
): Promise<TrendingMovies[] | null> => {
  try {
    const initialResponse = await fetch(
      `${url}&api_key=${process.env.TMDB_API_KEY}`,
      {
        next: { revalidate: 3600 }, // 1 hours
      },
    );
    const response = await initialResponse.json();
    return response.results;
  } catch (err) {
    // console.log(err);
    return null;
  }
};

export const fetchPopularTV = async (
  url: string,
): Promise<TrendingTV[] | null> => {
  try {
    const initialResponse = await fetch(
      `${url}&api_key=${process.env.TMDB_API_KEY}`,
      {
        next: { revalidate: 3600 }, // 1 hours
      },
    );
    const response = await initialResponse.json();
    // console.log(response.results);
    return response.results;
  } catch (err) {
    // console.log(err);
    return null;
  }
};
