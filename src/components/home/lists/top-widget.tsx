import {
  fetchPopularMovies,
  fetchPopularTV,
} from "@/lib/api-calls/homeApiCalls";
import TopList from "../widget";

const TopWidget = async () => {
  const topMovies = await fetchPopularMovies(
    "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
  );
  const topTVShows = await fetchPopularTV(
    "https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1",
  );

  if (topMovies == null) {
    return (
      <div className="text-center text-red-700">Failed to load content</div>
    );
  }

  return (
    <div>
      <TopList movieItems={topMovies} tvItems={topTVShows!} type="Movie" />
    </div>
  );
};

export default TopWidget;
