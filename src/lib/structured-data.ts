interface MediaStructuredDataParams {
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  type: "movie" | "tv";
  rating?: number;
}

export function generateMediaStructuredData({
  title,
  overview,
  posterPath,
  releaseDate,
  type,
  rating,
}: MediaStructuredDataParams) {
  const imageUrl = `https://image.tmdb.org/t/p/original${posterPath}`;

  return {
    "@context": "https://schema.org",
    "@type": type === "movie" ? "Movie" : "TVSeries",
    name: title,
    description: overview,
    image: imageUrl,
    datePublished: releaseDate,
    ...(rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        bestRating: "10",
        worstRating: "1",
      },
    }),
  };
}
