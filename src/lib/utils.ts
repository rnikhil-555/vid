import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TVBookmark {
  id: string;
  season: number;
  episode: number;
}

export interface MovieBookmark {
  id: string;
}

export const DEFAULT_MOVIE_PROVIDER = {
  name: "Max",
  url: "https://ythd.org/embed/",
  countryUrl: `https://flagsapi.com/US/flat/24.png`,
};

export const DEFAULT_TV_PROVIDER = {
  name: "Max",
  url: "https://ythd.org/embed/",
  countryUrl: `https://flagsapi.com/US/flat/24.png`,
};

export function setItem(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(error);
  }
}

export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function toggleTVBookmark(id: string, season: number, episode: number) {
  const bookmarks = getItem<TVBookmark[]>("tvBookmarks") || [];
  const existingIndex = bookmarks.findIndex((b) => b.id === id);

  if (existingIndex >= 0) {
    bookmarks.splice(existingIndex, 1);
  } else {
    bookmarks.push({ id, season, episode });
  }

  setItem("tvBookmarks", bookmarks);
  return existingIndex < 0;
}

export function toggleMovieBookmark(id: string) {
  const bookmarks = getItem<MovieBookmark[]>("movieBookmarks") || [];
  const existingIndex = bookmarks.findIndex((b) => b.id === id);

  if (existingIndex >= 0) {
    bookmarks.splice(existingIndex, 1);
  } else {
    bookmarks.push({ id });
  }

  setItem("movieBookmarks", bookmarks);
  return existingIndex < 0;
}

export function isBookmarked(id: string, type: "movie" | "tv"): boolean {
  const key = type === "movie" ? "movieBookmarks" : "tvBookmarks";
  const bookmarks = getItem<(MovieBookmark | TVBookmark)[]>(key) || [];
  return bookmarks.some((b) => b.id === id);
}
