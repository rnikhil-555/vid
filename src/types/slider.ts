export type SlideInfo = {
    id: string;
    backdrop_path: string;
    title: string;
    overview: string;
    media_type: string;
    genre_ids: number[];
    release_date: string;
    vote_average: number;
    logo_path: string;
};

export type ThumbnailInfo = {
    id: string;
    poster_path: string;
    title: string;
    media_type: string;
    genre_ids: number[];
};

export type GenreIds = {
    id: number;
    name: string;
};

export interface TMDBResponse {
    results: Array<{
        id: number;
        backdrop_path: string;
        original_language: string;
        name?: string;
        title?: string;
        release_date?: string;
        first_air_date?: string;
        vote_average: number;
        overview: string;
        media_type: string;
    }>;
}

export interface GenreResponse {
    genres: GenreIds[];
}

export interface TMDBImageResponse {
    logos: Array<{
        file_path: string;
        iso_639_1?: string;
    }>;
}

export interface TMDBTrendingResponse {
    results: Array<{
        id: number;
        backdrop_path: string;
        original_language: string;
        name?: string;
        title?: string;
        release_date?: string;
        first_air_date?: string;
        vote_average: number;
        overview: string;
        media_type: string;
        genre_ids: number[];
    }>;
}