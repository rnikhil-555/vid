import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface Channel {
    name: string;
    embed: string;
}

const BASE_URL = "https://daddylive.mp";
export const revalidate = 21600;
async function scrapeChannels(): Promise<Channel[]> {
    try {
        const url = `${BASE_URL}/24-7-channels.php`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);
        const result: Channel[] = [];

        $(".grid-item a").each((_, ele) => {
            const href = $(ele).attr("href");
            if (!href) return;

            const cleanHref = href.replace(".php", "");
            const parts = cleanHref.split("-");

            if (parts.length < 2) return;

            const embedUrl = `${BASE_URL}/embed/stream-${parts[1]}.php`;
            result.push({
                name: $(ele).text(),
                embed: embedUrl
            });
        });

        return result;
    } catch (err) {
        console.error('Error scraping channels:', err);
        return [];
    }
}

export async function GET() {
    try {
        const channels = await scrapeChannels();

        return NextResponse.json(
            { success: true, data: channels },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
                }
            }
        );
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch channels' },
            { status: 500 }
        );
    }
}