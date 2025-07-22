export interface Channel {
    id: string;
    name: string;
    logo?: string;
    closed?: boolean;
    website?: string;
    categories?: string[];
    country?: string;
    languages?: string[];
    alt_names?: string[];
    stream?: {
        channel: string;
        url: string;
        http_referrer?: string;
        user_agent?: string;
        timeshift?: string;
    };
}

export interface Stream {
    channel: string;
    url: string;
    http_referrer?: string;
    user_agent?: string;
    timeshift?: string;
}

export interface Category {
    id: string;
    name: string;
    count?: number;
}

export interface Country {
    name: string;
    code: string;
    flag: string;
}

export interface Language {
    name: string;
    code: string;
}