export interface MediaItem {
  mediaId: string;
  mediaType: "movie" | "tv" | "anime";
  title: string;
  backdrop_path?: string;
  season?: number;
  episode?: number;
  watchedAt: string;
}

export interface MediaList {
  items: MediaItem[];
  lastUpdated: string;
}
