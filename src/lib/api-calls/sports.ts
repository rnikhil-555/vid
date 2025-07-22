interface Sport {
    id: string;
    name: string;
}

interface Match {
    id: string;
    title: string;
    category: string;
    date: number;
    poster?: string;
    popular: boolean;
    teams?: {
        home?: {
            name: string;
            badge: string;
        };
        away?: {
            name: string;
            badge: string;
        };
    };
    sources: {
        source: string;
        id: string;
    }[];
}

const baseHeaders = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

export async function getSports(): Promise<Sport[]> {
    try {
        const response = await fetch('https://worker.vidlink.pro/proxy?url=https://streamed.su/api/sports', {
            headers: baseHeaders,
            next: { revalidate: 900 }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sports: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getSports:', error);
        return [];
    }
}

export async function getLiveSports(): Promise<Match[]> {
    try {
        const response = await fetch('https://worker.vidlink.pro/proxy?url=https://streamed.su/api/matches/live', {
            headers: baseHeaders,
            next: { revalidate: 900 }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch live sports: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getLiveSports:', error);
        return [];
    }
}

export async function getPopularLiveSports(): Promise<Match[]> {
    try {
        const response = await fetch('https://worker.vidlink.pro/proxy?url=https://streamed.su/api/matches/live/popular', {
            headers: baseHeaders,
            next: { revalidate: 900 }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch popular live sports: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getPopularLiveSports:', error);
        return [];
    }
}

export async function getMatches(): Promise<Match[]> {
    try {
        const response = await fetch(`https://worker.vidlink.pro/proxy?url=https://streamed.su/api/matches/all`, {
            headers: baseHeaders,
            next: { revalidate: 900 }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch matches: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getMatches:', error);
        return [];
    }
}

export async function getLiveChannels(): Promise<Match[]> {
    try {
        const allMatches = await getMatches();

        const liveChannels = allMatches
            .flat()
            .filter(match => match.date === 0);

        return liveChannels;
    } catch (error) {
        console.error('Error in getLiveChannels:', error);
        return [];
    }
}

