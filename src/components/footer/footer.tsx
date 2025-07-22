"use client"
import React from "react";
import Link from "next/link";

interface FooterProps {
  backgroundImage: string;
}

export default function Footer({ backgroundImage }: FooterProps) {
  return (
    <footer className="relative mb-12 overflow-hidden pt-10 text-white md:mb-0 z-[100]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-10 pt-20">
          <Link href="/home">
            <div className="mb-4 w-full">
              <img
                src="/logo.png"
                alt="Vidbox Logo"
                width={120}
                height={40}
                className="mx-auto h-10 w-auto sm:m-0"
              />
            </div></Link>
          <div className="mb-2 flex flex-row items-center justify-center gap-x-5 text-xs sm:flex-row sm:justify-between">
            <nav className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link
                href="/terms"
                className="transition-colors hover:text-red-500"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-red-500"
              >
                Policy
              </Link>
              <Link
                href="/faqs"
                className="transition-colors hover:text-red-500"
              >
                FAQs
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-red-500"
              >
                Contact
              </Link>
            </nav>
            <nav className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link
                href="/search?type=movie"
                className="transition-colors hover:text-red-500"
              >
                Movies
              </Link>
              <Link
                href="/search?type=tv"
                className="transition-colors hover:text-red-500"
              >
                Tv shows
              </Link>
              <Link
                href="/search/anime"
                className="transition-colors hover:text-red-500"
              >
                Animes
              </Link>
              <Link
                href="/watchlist"
                className="transition-colors hover:text-red-500"
              >
                Favorites
              </Link>
            </nav>
          </div>
          <div className="my-4 border-t border-red-500"></div>
          <div className="flex flex-col items-center justify-between text-sm md:flex-row">
            <p className="mx-auto mb-4 max-w-4xl text-center text-red-500 md:mb-0">
              vidbox.to is top of free streaming website, where to watch movies
              online free without registration required. With a big database and
              great features, we're confident. vidbox.to is the best free
              movies online website in the space that you can't simply miss!
            </p>
          </div>
          <div className="mt-4 text-center text-xs">
            <p>
              This site does not store any files on our server, we only linked
              to the media which is hosted on 3rd party services.
            </p>
            <p className="text-gray-400">Vidbox © 2024. All Rights Reserved</p>
          </div>
        </div>
      </div>
      {/* <div className="fixed bottom-4 right-4 z-20">
        <button className="flex items-center space-x-2 rounded-full bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span>Movie & Tv Shows Request</span>
        </button>
      </div> */}
    </footer>
  );
}
