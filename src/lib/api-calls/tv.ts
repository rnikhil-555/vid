import {
  MovieTrailer,
  TVCast,
  TVInfo,
  TVRecommendations,
  TVSeasonInfo,
} from "@/types/tmdbApi";

export const fetchTVInfo = async (id: number): Promise<TVInfo | null> => {
  const TVInfo = `https://api.themoviedb.org/3/tv/${id}?language=en-US&api_key=${process.env.TMDB_API_KEY}`;
  try {
    const initResTV = await fetch(TVInfo, {
      next: { revalidate: 3600 }, // 24 hours
    });
    const tvResponse = await initResTV.json();

    return tvResponse;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchCastInfo = async (id: number): Promise<TVCast[] | null> => {
  const castInfo = `https://api.themoviedb.org/3/tv/${id}/credits?language=en-US&api_key=${process.env.TMDB_API_KEY}`;
  try {
    const initResCast = await fetch(castInfo, {
      next: { revalidate: 3600 }, // 24 hours
    });
    const castResponse = await initResCast.json();
    return castResponse.cast;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchTVRecommendations = async (
  id: number,
): Promise<TVRecommendations[] | null> => {
  const recommendations = `https://api.themoviedb.org/3/tv/${id}/recommendations?language=en-US&api_key=${process.env.TMDB_API_KEY}`;
  try {
    const initResRec = await fetch(recommendations, {
      next: { revalidate: 3600 }, // 12 hours
    });
    const recResponse = await initResRec.json();
    return recResponse.results;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchSeasonInfo = async (
  id: number,
  seasonNo: number,
): Promise<TVSeasonInfo | null> => {
  const url = `https://api.themoviedb.org/3/tv/${id}/season/${seasonNo}?language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
  try {
    const initResSeason = await fetch(url, {
      next: { revalidate: 3600 }, // 24 hours
    });
    const seasonInfoResponse = await initResSeason.json();
    return seasonInfoResponse;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchTrailerInfo = async (
  id: number,
): Promise<MovieTrailer[] | null> => {
  const trailerInfo = `https://api.themoviedb.org/3/tv/${id}/season/1/videos?language=en-US&api_key=${process.env.TMDB_API_KEY}`;
  try {
    const initResTrailer = await fetch(trailerInfo, {
      next: { revalidate: 3600 }, // 24 hours
    });
    const trailerResponse = await initResTrailer.json();
    return trailerResponse.results;
  } catch (err) {
    console.log(err);
    return null;
  }
};
