"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  Bitcoin,
  Bookmark,
  Clapperboard,
  Clock,
  Home,
  Library,
  Menu,
  Moon,
  Smartphone,
  Sun,
  Sword,
  Tv,
  User,
  Film,
  Drama,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Search from "./search";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { useEffect, useState, memo, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DISCORD_URL } from "@/lib/constants";
import { MdSportsFootball } from "react-icons/md";
import { MdLiveTv } from "react-icons/md";
import AuthModal from "./AuthModal";
import { useAuthModal } from '@/store/use-auth-modal';
import { FaUserCircle } from "react-icons/fa";
import { useMediaStore } from "@/utils/store";
import { MdMenuBook } from "react-icons/md";
import { signOut } from "@/lib/auth.client";
import { createAuthClient } from "better-auth/react"
const { useSession } = createAuthClient();

const options = [
  { name: "Home", href: "/", icon: Home },
  { name: "Movies", href: "/search?type=movie", icon: Clapperboard },
  { name: "Series", href: "/search?type=tv", icon: Tv },
  { name: "Anime", href: "/search/anime", icon: Sword },
  { name: "Manga", href: "/manga", icon: MdMenuBook },
  { name: "Collection", href: "/collection", icon: Library },
  { name: "4k", href: "/4k", icon: Film },
  { name: "Drama", href: "/asian-drama", icon: Drama },
  { name: "Live TV", href: "/live-tv", icon: MdLiveTv },
  { name: "Live Sports", href: "/sports", icon: MdSportsFootball },
  { name: "History", href: "/history", icon: Clock },
  { name: "Watchlist", href: "/watchlist", icon: Bookmark },
  { name: "Donate", href: "/donate", icon: Bitcoin },
];

const Header = memo(function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useAuthModal();
  const {
    clearList
  } = useMediaStore();
  // UseEffect to set the initial theme to dark
  useEffect(() => {
    setMounted(true);
    // Only set theme to dark if it hasn't been set before
    if (!localStorage.getItem("theme")) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleSignOut = async () => {
    // Clear both watchlist and history from the store
    clearList('watchlist');
    clearList('history');
    // Sign out the user
    await signOut();
    router.push('/');
    router.refresh();
  };

  if (!mounted) return null;

  return (
    <header className="absolute top-0 z-[100] flex w-full items-center justify-between px-5 pt-5 md:px-10">
      {[
        "movie",
        "tv",
        "watch",
        "live-tv",
        "",
        "search",
        "history",
        "4k",
        "asian-drama",
        "drama",
        "sport",
        "sports",
        "collection",
        "watchlist",
        "anime",
        "privacy-policy",
        "terms",
        "donate",
        "contact",
        "android-movies-apk",
        "faqs",
        "manga",
      ].includes(pathname.split("/")[1]) ? (
        <>
          <div className="w-[150px]">
            <button className="" onClick={() => router.back()}>
              {pathname.split("/")[1] !== "" && (
                <ArrowLeft
                  className={cn(
                    "text-2xl font-bold text-white hover:scale-110 hover:transform",
                    [
                      "movie",
                      "tv",
                      "watch",
                      "live-tv",
                      "",
                      "watchlist",
                      "search",
                      "history",
                      "4k",
                      "asian-drama",
                      "drama",
                      "sport",
                      "sports",
                      "collection",
                      "anime",
                      "privacy-policy",
                      "terms",
                      "donate",
                      "contact",
                      "android-movies-apk",
                      "faqs",
                      "manga"
                    ].includes(pathname.split("/")[1]) &&
                    "text-black dark:text-white",
                  )}
                />
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <Link className="text-2xl font-bold text-red-500" href={"/home"}>
            <img src={"/logo.png"} alt="logo" width={150} height={36} />
          </Link>
          {pathname.split("/")[1] !== "search" && (
            <div className="hidden md:block">
              <Search />
            </div>
          )}
        </>
      )}
      <div className="flex items-center gap-x-2">
        {["home", ""].includes(pathname.split("/")[1]) && (
          <Link href={`/android-movies-apk`}>
            <Smartphone
              className={cn(
                pathname?.includes("home") ? "text-white" : "text-white dark:text-black",
                [
                  "movie",
                  "tv",
                  "watch",
                  "live-tv",
                  "",
                  "watchlist",
                  "search",
                  "history",
                  "4k",
                  "asian-drama",
                  "drama",
                  "sport",
                  "sports",
                  "collection",
                  "anime",
                  "privacy-policy",
                  "terms",
                  "donate",
                  "contact",
                  "android-movies-apk",
                  "faqs",
                ].includes(pathname.split("/")[1]) &&
                "text-black dark:text-white",
              )}
            />
          </Link>
        )}
        <ThemeToggle theme={theme || "dark"} pathname={pathname} toggleTheme={toggleTheme} />
        <MenuOps />
        <div>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="relative ml-1 h-8 w-8 rounded-full bg-[white] hover:bg-[white] dark:bg-[grey] dark:hover:bg-[grey] flex items-center justify-center"
                  variant="unstyled"
                >
                  <FaUserCircle className="h-full w-full dark:text-white text-black" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Link href="/watchlist">
                  <DropdownMenuItem>
                    <div className="flex items-center gap-2">
                      <Bookmark size={16} />
                      <span>Watchlist</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/history">
                  <DropdownMenuItem>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>History</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleSignOut}>
                  <div className="flex items-center gap-2">
                    <ArrowLeft size={16} />
                    <span>Sign Out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="icon"
              variant="unstyled"
              className={`${pathname?.includes("home") ? "text-white" : " text-black dark:text-white"} bg-transparent`}
              onClick={onOpen}
            >
              <User className={`${pathname?.includes("home") ? "text-white" : "text-black dark:text-white"}`} />
            </Button>
          )}
        </div>
      </div>
      {isOpen && <AuthModal onClose={onClose} />}
    </header>
  );
});
Header.displayName = "Header";

export default Header;

const MenuOps = memo(function MenuOps() {
  const pathname = usePathname();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Menu
          className={cn(
            pathname?.includes("home") ? "text-white" : "text-white dark:text-black",
            [
              "movie",
              "tv",
              "watch",
              "live-tv",
              "",
              "search",
              "history",
              "4k",
              "asian-drama",
              "drama",
              "sport",
              "sports",
              "collection",
              "anime",
              "privacy-policy",
              "terms",
              "watchlist",
              "donate",
              "contact",
              "android-movies-apk",
              "faqs",
              "manga"
            ].includes(pathname.split("/")[1]) && "text-black dark:text-white",
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-2">
        {options.map((option) => (
          <Link href={option.href} key={option.name}>
            <DropdownMenuItem id={option.name}>
              <div className="flex items-center gap-2">
                <option.icon size={"16px"} />
                <p>{option.name}</p>
              </div>
            </DropdownMenuItem>
          </Link>
        ))}
        <a href={`${DISCORD_URL}`}>
          <DropdownMenuItem id="discord">
            <div className="flex items-center gap-2">
              <img
                src={"/discord.svg"}
                alt="discord"
                width={16}
                height={16}
              />
              <p>Discord</p>
            </div>
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
MenuOps.displayName = 'MenuOps';

const ThemeToggle = memo(function ThemeToggle({
  theme,
  pathname,
  toggleTheme
}: {
  theme: string;
  pathname: string;
  toggleTheme: () => void;
}) {
  return (
    <Button
      size="icon"
      variant="unstyled"
      onClick={toggleTheme}
      className="bg-transparent"
    >
      {theme === "dark" ? (
        <Sun className={cn(
          pathname?.includes("home") ? "text-white" : "text-white dark:text-black",
          [
            "movie",
            "tv",
            "watch",
            "live-tv",
            "",
            "search",
            "watchlist",
            "history",
            "4k",
            "asian-drama",
            "drama",
            "sport",
            "sports",
            "collection",
            "anime",
            "privacy-policy",
            "terms",
            "donate",
            "contact",
            "android-movies-apk",
            "faqs",
            "manga"
          ].includes(pathname.split("/")[1]) &&
          "text-black hover:text-black dark:text-white dark:hover:text-white",
        )} />
      ) : (
        <Moon className={cn(
          pathname?.includes("home") ? "text-white" : "text-white dark:text-black",
          [
            "movie",
            "tv",
            "watch",
            "live-tv",
            "",
            "search",
            "watchlist",
            "history",
            "4k",
            "asian-drama",
            "drama",
            "sport",
            "sports",
            "collection",
            "anime",
            "privacy-policy",
            "terms",
            "donate",
            "contact",
            "android-movies-apk",
            "faqs",
            "manga"
          ].includes(pathname.split("/")[1]) &&
          "text-black dark:text-white",
        )} />
      )}
    </Button>
  );
});
ThemeToggle.displayName = 'ThemeToggle';
