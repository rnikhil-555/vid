import { Metadata } from "next";

interface MediaMetadataParams {
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  type: "movie" | "tv";
}

export function generateMediaMetadata({
  title,
  overview,
  posterPath,
  releaseDate,
  type,
}: MediaMetadataParams): Metadata {
  const imageUrl = `https://image.tmdb.org/t/p/original${posterPath}`;

  return {
    title: `${title}`,
    description: overview,
    openGraph: {
      title: `${title} | Vidbox`,
      description: overview,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "video.movie",
      releaseDate: releaseDate,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Vidbox`,
      description: overview,
      images: [imageUrl],
    },
  };
}
