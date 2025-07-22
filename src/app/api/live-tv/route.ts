import { NextResponse } from 'next/server';
import { Channel, Stream } from '@/types/live-tv';

const CACHE_DURATION_STREAMS = 2 * 60 * 60 * 1000;
const CACHE_DURATION_OTHER = 12 * 60 * 60 * 1000;

interface CacheData {
    streams: {
        data: Stream[];
        timestamp: number;
    };
    other: {
        channels: Channel[];
        categories: any[];
        countries: any[];
        timestamp: number;
    } | null;
}

let cache: CacheData = {
    streams: {
        data: [],
        timestamp: 0
    },
    other: null
};

async function fetchAndProcessData(forceRefreshAll = false) {
    try {
        const now = Date.now();
        const needStreamsRefresh = !cache.streams.data.length ||
            (now - cache.streams.timestamp) >= CACHE_DURATION_STREAMS;
        const needOtherRefresh = !cache.other || forceRefreshAll ||
            (now - cache.other.timestamp) >= CACHE_DURATION_OTHER;

        let validStreams = cache.streams.data;
        let channelsData = cache.other?.channels || [];
        let categoriesData = cache.other?.categories || [];
        let countriesData = cache.other?.countries || [];

        if (needStreamsRefresh) {
            const streamsRes = await fetch('https://iptv-org.github.io/api/streams.json');
            const streamsData = await streamsRes.json();
            validStreams = streamsData.filter((stream: Stream) =>
                stream.url && stream.url.trim() !== ''
            );
            cache.streams = {
                data: validStreams,
                timestamp: now
            };
        }

        if (needOtherRefresh) {
            const [channelsRes, categoriesRes, countriesRes] = await Promise.all([
                fetch('https://iptv-org.github.io/api/channels.json'),
                fetch('https://iptv-org.github.io/api/categories.json'),
                fetch('https://iptv-org.github.io/api/countries.json'),
            ]);

            [channelsData, categoriesData, countriesData] = await Promise.all([
                channelsRes.json(),
                categoriesRes.json(),
                countriesRes.json(),
            ]);

            cache.other = {
                channels: channelsData,
                categories: categoriesData,
                countries: countriesData,
                timestamp: now
            };
        }

        const streamMap = new Map<string, Stream>();
        validStreams.forEach((stream: Stream) => {
            streamMap.set(stream.channel, stream);
        });

        const activeChannels = channelsData
            .filter((channel: Channel) => !channel.closed && streamMap.has(channel.id))
            .map((channel: Channel) => ({
                ...channel,
                stream: streamMap.get(channel.id)
            }));

        return {
            channels: activeChannels,
            streams: validStreams,
            categories: categoriesData,
            countries: countriesData,
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function GET() {
    try {
        const data = await fetchAndProcessData();

        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=7200',
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch channels' },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        }
    );
}