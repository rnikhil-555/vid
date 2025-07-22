"use client";

import { Home, Search, Clapperboard, Tv, Sword, Ellipsis, Library } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import MobileMenu from "./mobile-menu";

const SearchComponent = dynamic(() => import("../header/search"), {
  ssr: false,
});

export default function MobileNav() {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {mounted &&
        pathname !== "/search" &&
        pathname !== "/search/anime" &&
        pathname !== "/" && (
          <div className="fixed left-0 right-0 top-[70px] z-50">
            <div className={showSearch ? "block md:hidden" : "hidden"}>
              <SearchComponent isMobile />
            </div>
          </div>
        )}
      {pathname !== "/" && (
        <>
          <MobileMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white px-4 py-2 text-black dark:bg-black dark:text-white md:hidden">
            <ul className="flex items-center justify-between">
              <li>
                <Link href="/home" className="flex flex-col items-center">
                  <Home className="h-6 w-6" />
                  <span className="mt-1 text-xs">Home</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex flex-col items-center"
                >
                  <Search className="h-6 w-6" />
                  <span className="mt-1 text-xs">Search</span>
                </button>
              </li>
              <li>
                <Link
                  href="/search?type=movie"
                  className="flex flex-col items-center"
                >
                  <Clapperboard className="h-6 w-6" />
                  <span className="mt-1 text-xs">Movies</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/search?type=tv"
                  className="flex flex-col items-center"
                >
                  <Tv className="h-6 w-6" />
                  <span className="mt-1 text-xs">Series</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/search/anime"
                  className="flex flex-col items-center"
                >
                  <Sword className="h-6 w-6" />
                  <span className="mt-1 text-xs">Anime</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="flex flex-col items-center"
                >
                  <Library className="h-6 w-6" />
                  <span className="mt-1 text-xs">Collection</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex flex-col items-center"
                >
                  <Ellipsis className="h-6 w-6" />
                  <span className="mt-1 text-xs">More</span>
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
