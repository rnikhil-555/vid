"use server"

interface TMDBItem {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  backdrop_path: string;
  overview: string;
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

interface LogoResponse {
  logos?: Array<{
    file_path: string;
    iso_639_1?: string;
  }>;
}

export async function fetchExplorePageDataFirst() {
  try {
    const baseUrl = 'https://api.themoviedb.org/3';
    const urls = [
      `${baseUrl}/trending/movie/day?language=en-US`,
      `${baseUrl}/trending/tv/day?language=en-US`,
      `${baseUrl}/discover/tv?with_networks=213`,
      `${baseUrl}/discover/tv?with_watch_providers=387&watch_region=US`,
      `${baseUrl}/discover/tv?with_watch_providers=9&watch_region=US`,
      `${baseUrl}/discover/tv?with_watch_providers=2&watch_region=US`,
      `${baseUrl}/discover/movie?include_adult=true&page=1&release_date.lte=2024-03-03&sort_by=popularity.desc&watch_region=IN&with_origin_country=IN`,
      `${baseUrl}/discover/tv?with_watch_providers=386&watch_region=US`,
      `${baseUrl}/discover/tv?with_watch_providers=531&watch_region=US`,
      `${baseUrl}/discover/movie?include_adult=true&language=en-US&page=1&release_date.gte=2022-01-01&release_date.lte=2024-03-03&sort_by=popularity.desc&vote_count.gte=200&watch_region=US&with_watch_providers=15`,
    ];

    const results = await Promise.all(
      urls.map(url =>
        fetch(`${url}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
          next: {
            revalidate: 28800 // 8 hours in seconds
          }
        }).then(res => res.json())
      )
    );

    return {
      trendingMovies: results[0],
      trendingTV: results[1],
      netflixShows: results[2],
      amazonShows: results[3],
      appleTVShows: results[4],
      disneyShows: results[5],
      indianShows: results[6],
      peacockShows: results[7],
      paramountShows: results[8],
      maxShows: results[9],
    };
  } catch (error) {
    console.error("Error fetching explore page data:", error);
    throw error;
  }
}

export async function getTopSliderData() {
  const movieGenresUrl = `https://api.themoviedb.org/3/genre/movie/list?language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
  const tvGenresUrl = `https://api.themoviedb.org/3/genre/tv/list?language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
  const trendingDayUrl = `https://api.themoviedb.org/3/trending/all/day?language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
  const trendingWeekUrl = `https://api.themoviedb.org/3/trending/all/week?language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;

  try {
    const [movieGenres, tvGenres, trendingDay, trendingWeek] = await Promise.all([
      fetch(movieGenresUrl, { next: { revalidate: 3600 } }).then(res => res.json()),
      fetch(tvGenresUrl, { next: { revalidate: 3600 } }).then(res => res.json()),
      fetch(trendingDayUrl, { next: { revalidate: 3600 } }).then(res => res.json()),
      fetch(trendingWeekUrl, { next: { revalidate: 3600 } }).then(res => res.json())
    ]);

    const trendingDayWithLogos = await Promise.all(
      trendingDay.results.map(async (item: TMDBItem) => {
        const logoUrl = `https://api.themoviedb.org/3/${item.media_type}/${item.id}/images?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
        const logoResponse = await fetch(logoUrl, { next: { revalidate: 3600 } });
        const logoData: LogoResponse = await logoResponse.json();

        const logo = logoData.logos?.find(logo => logo.iso_639_1 === "en")?.file_path
          || logoData.logos?.[0]?.file_path
          || null;
        return {
          ...item,
          logo_path: logo
        };
      })
    );

    return {
      movieGenres: movieGenres.genres,
      tvGenres: tvGenres.genres,
      trendingDay: trendingDayWithLogos,
      trendingWeek: trendingWeek.results
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}