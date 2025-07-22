import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title: {
    default: "Vidbox - Your Ultimate Streaming Guide",
    template: "%s | Vidbox",
  },
  description:
    "Discover and track your favorite movies and TV shows across all streaming platforms. Get personalized recommendations, trending content, and streaming availability information.",
  keywords: [
    "streaming",
    "movies",
    "TV shows",
    "Netflix",
    "Amazon Prime",
    "Disney+",
    "HBO Max",
    "watch guide",
  ],
  authors: [{ name: "Vidbox" }],
  creator: "Vidbox",
  publisher: "Vidbox",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vidbox.to",
    siteName: "Vidbox",
    title: "Vidbox - Your Ultimate Streaming Guide",
    description:
      "Discover and track your favorite movies and TV shows across all streaming platforms.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vidbox Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidbox - Your Ultimate Streaming Guide",
    description:
      "Discover and track your favorite movies and TV shows across all streaming platforms.",
    images: ["/og-image.png"],
    creator: "@vidbox",
  },
};
