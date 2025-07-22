import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";
import { defaultMetadata } from "@/lib/metadata";
import HomeSearchBar from "@/components/home/search-bar";
import { WEBSITE_NAME, WEBSITE_URL } from "@/lib/constants";
import Image from "next/image";

export const metadata: Metadata = {
  ...defaultMetadata,
  alternates: {
    canonical: "https://vidbox.to",
  },
  openGraph: {
    ...defaultMetadata.openGraph,
    title: `${WEBSITE_NAME} - Watch Movies Online in HD for Free`,
    description:
      "Stream the latest movies and TV shows in HD quality for free. Your ultimate destination for online entertainment.",
  },
};

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-cover bg-fixed bg-center dark:bg-[#1a1a1c] md:bg-[url('/home-bg.jpg')]">
      <div className="flex min-h-screen items-center justify-center p-0 pt-8 md:p-5">
        <main className="relative w-full max-w-6xl rounded-lg bg-white/95 p-6 dark:bg-[#1a1a1c] md:p-12 md:dark:bg-black/70">
          {/* Logo Section */}
          <div className="mb-8 text-center">
            <h1 className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              <img
                src={"/logo.png"}
                alt="Logo"
                width={150}
                height={40}
                className="mx-auto drop-shadow-xl"
              />
            </h1>
            <h2 className="mt-4 text-xl text-gray-700 dark:text-gray-300 md:text-2xl">
              Watch Movies Online in HD for Free!
            </h2>
          </div>

          {/* Search Section */}
          <HomeSearchBar />

          {/* Homepage Button */}
          <div className="mt-8 text-center">
            <Link href="/home">
              <Button className="mx-auto flex items-center gap-2 rounded-lg bg-black px-8 py-2 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600">
                Explore Now
                <span className="ml-1">▶</span>
              </Button>
            </Link>
          </div>

          {/* Description Section */}
          <div className="mt-16 space-y-6 text-gray-700 dark:text-gray-300">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-300">
              {WEBSITE_NAME} - Watch Movies Online in HD for Free!
            </h2>

            <p className="leading-relaxed">
              {WEBSITE_URL} - the ultimate online movie streaming website that
              brings the magic of cinema to your fingertips. With a vast and
              diverse database, as well as a multitude of exciting features,
              {WEBSITE_URL} offers an unparalleled movie-watching experience for
              film enthusiasts worldwide.
            </p>

            <p className="leading-relaxed">
              At {WEBSITE_URL}, we take pride in our extensive database that
              encompasses a wide range of movies from various genres, eras, and
              countries. From Hollywood blockbusters to independent gems, we
              have something for everyone. Our database is continuously updated
              with the latest releases, ensuring that you stay up-to-date with
              the hottest films in the industry.
            </p>

            <p className="leading-relaxed">
              One of the standout features of {WEBSITE_URL} is our personalized
              recommendation system. Our sophisticated algorithms analyze your
              viewing history, preferences, and ratings to curate a customized
              list of movie recommendations tailored specifically to your
              tastes. Discover new films you'll love and embark on exciting
              cinematic adventures you never knew existed.
            </p>

            <p className="leading-relaxed">
              In addition to our large database and personalized
              recommendations, {WEBSITE_URL} offers high-quality streaming for
              an immersive viewing experience. Enjoy movies in stunning
              high-definition resolution, accompanied by crisp audio, bringing
              the theater experience right to your home. Our adaptive streaming
              technology ensures smooth playback, adjusting to your internet
              connection for uninterrupted enjoyment.
            </p>

            <p className="leading-relaxed">
              {WEBSITE_URL} also understands the importance of convenience and
              accessibility. Our platform is compatible with various devices,
              including laptops, tablets, and smartphones, allowing you to watch
              movies anytime, anywhere. Whether you're at home or on the go,{" "}
              {WEBSITE_URL} keeps you connected to your favorite films.
            </p>

            <p className="leading-relaxed">
              Furthermore, {WEBSITE_URL} fosters a vibrant community of movie
              enthusiasts. Engage in discussions, share reviews, and interact
              with fellow cinephiles through our dedicated forums and social
              features. Connect with like-minded individuals, exchange
              recommendations, and dive deeper into the world of cinema.
            </p>

            <p className="leading-relaxed">
              In summary, {WEBSITE_URL} is the ultimate online movie streaming
              destination, offering a vast database, personalized
              recommendations, high-quality streaming, device compatibility, and
              an engaging community. Prepare to be captivated by the world of
              cinema as you embark on a cinematic journey like no other. Welcome
              to {WEBSITE_URL}, where movies come to life.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
