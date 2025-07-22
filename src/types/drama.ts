export interface Result {
  id: string;
  title: string;
  episode?: string;
  image: string;
  original_id?: string;
  time?: string;
  media_type?: string;
  vote_average?: number;
}

export interface DramaApiResponse {
  success: boolean;
  data: {
    recently_added: Result[];
    recent_movie: Result[];
    recent_k_show: Result[];
    blog: any[];
    ongoing: Result[];
    upcoming: Result[];
    popular: Result[];
  };
}

export interface DramaData {
  data: {
    recently_added: DramaItem[];
    popular?: DramaItem[];
    upcoming?: DramaItem[];
  };
}

export interface DramaItem {
  id: string;
  title: string;
  image: string;
  updated_at: string;
  episode?: string;
  time?: string;
  vote_average?: number;
}

export interface DramaResponse {
  success: boolean;
  data: Drama[];
  pagination?: {
    nextpage: boolean;
    prevpage: boolean;
    maxpage: number;
    currentPage: number;
  };
}

export interface Drama extends DramaItem {
  original_id: string;
}

export interface Filters {
  search: string;
  type: string;
  genre: string;
  year: string;
  country: string;
}

export interface DramaInfo {
  title: string;
  thumbnail: string;
  episodes: Episode[];
  synopsis: string;
}

export interface Episode {
  title: string;
  episode_id: string;
  time: string;
  episodeNo?: number;
}

export interface ApiResponse {
  success: boolean;
  data: DramaInfo;
}

export interface StreamResponse {
  success: boolean;
  data: {
    url: string;
  };
}