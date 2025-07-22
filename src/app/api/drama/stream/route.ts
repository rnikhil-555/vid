import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 21600;

interface ServerData {
  embeded_link: string;
  m3u8: boolean;
  skipped?: boolean;
  stream?: string | null;
  sub?: string | null;
  error?: string;
}

interface Servers {
  [key: string]: ServerData;
}

// URL extraction function
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^"\s]+\.[^"\s]+)/g;
  return text.match(urlRegex) || [];
}

// URL filtering function
function findSpecificUrls(urls: string[]): {
  stream: string | null;
  sub: string | null;
  m3u8: boolean;
} {
  const streamUrl = urls.find((url) => url.includes(".m3u8")) || null;
  const subUrl = urls.find((url) => url.includes(".vtt")) || null;
  const m3u8 = !!streamUrl;
  return { stream: streamUrl, sub: subUrl, m3u8 };
}

// M3U8 check helper
function didFindM3U8(serversObj: any): boolean {
  return Object.values(serversObj).some(
    (server: any) => server.m3u8 === true
  );
}
// Deobfuscation function
function deobfuscateCode(
  p: string,
  a: number,
  c: number,
  k: string[],
  e?: any,
  d?: any
): string {
  while (c--) {
    if (k[c]) {
      p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
    }
  }
  return p;
}
// Server processing function
async function processServer(serverUrl: string): Promise<{
  stream: string | null;
  sub: string | null;
  m3u8: boolean;
  error?: string;
}> {
  try {
    const serverResponse = await fetch(serverUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://dramacool.sh/",
      },
      next: {
        revalidate: 3600
      }
    });

    if (!serverResponse.ok) {
      throw new Error(`HTTP error! status: ${serverResponse.status}`);
    }

    const serverHtml = await serverResponse.text();
    const $ = cheerio.load(serverHtml);
    let scriptContent: string | undefined;

    $("script").each((_, scriptTag) => {
      const scriptData = $(scriptTag).html() || "";
      if (scriptData.includes("eval(function(p,a,c,k,e,d)")) {
        scriptContent = scriptData;
        return false;
      }
    });

    if (!scriptContent) {
      return {
        stream: null,
        sub: null,
        m3u8: false,
        error: "Obfuscated script not found in server HTML.",
      };
    }

    const evalRegex = /eval\(function\(p,a,c,k,e,d\)\{.*?\}\('(.+?)',(\d+),(\d+),'(.+?)'\.split\('\|'\)\)\)/;
    const obfuscatedMatch = scriptContent.match(evalRegex);

    if (!obfuscatedMatch) {
      return {
        stream: null,
        sub: null,
        m3u8: false,
        error: "Failed to parse obfuscated code.",
      };
    }

    const [_, obfuscatedCode, deobfuscationKey, arrayLength, deobfuscationArray] = obfuscatedMatch;

    const deobfuscatedOutput = deobfuscateCode(
      obfuscatedCode,
      parseInt(deobfuscationKey, 10),
      parseInt(arrayLength, 10),
      deobfuscationArray.split("|")
    );

    const urls = extractUrls(deobfuscatedOutput);
    return findSpecificUrls(urls);

  } catch (error: any) {
    return {
      stream: null,
      sub: null,
      m3u8: false,
      error: `Error processing server: ${error.message}`,
    };
  }
}
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const episodeId = searchParams.get('episodeId');

  if (!episodeId) {
    return NextResponse.json(
      { error: "Missing required query parameter: episodeId" },
      { status: 400 }
    );
  }

  // console.log(`Fetching stream for episodeId: ${episodeId}`);

  try {
    const episodeURL = `https://dramacool.sh/${encodeURIComponent(episodeId)}/`;
    const episodeResponse = await fetch(episodeURL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://dramacool.sh/",
      },
      next: {
        revalidate: 21600 // 12 hours in seconds
      }
    });

    if (!episodeResponse.ok) {
      throw new Error(`HTTP error! status: ${episodeResponse.status}`);
    }

    const episodeHtml = await episodeResponse.text();

    const serverRegex = /<div class="serverslist\s+([^"\s]+).*?"[^>]*data-server="([^"\s]+)"/gi;
    let serverMatch;
    const servers: Servers = {};

    while ((serverMatch = serverRegex.exec(episodeHtml)) !== null) {
      const serverName = serverMatch[1].split(" ")[0].toLowerCase();
      const serverLink = serverMatch[2];
      servers[serverName] = { embeded_link: serverLink, m3u8: false };
    }

    if (Object.keys(servers).length === 0) {
      return NextResponse.json(
        { success: false, error: "No servers found in episode HTML." },
        { status: 400 }
      );
    }

    // Process each server
    for (const [serverName, serverData] of Object.entries(servers)) {
      if (["doodstream", "mixdrop", "mp4upload"].includes(serverName)) {
        serverData.skipped = true;
        serverData.m3u8 = false;
        continue;
      }

      const result = await processServer(serverData.embeded_link);
      Object.assign(serverData, result);
    }

    // Handle standard server sub-servers if needed
    const foundAnyM3U8 = didFindM3U8(servers);
    if (!foundAnyM3U8 && servers["standard"]?.embeded_link) {
      const standardRes = await fetch(servers["standard"].embeded_link, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://dramacool.sh/",
        },
        next: {
          revalidate: 21600 // 12 hours in seconds
        }
      });

      if (!standardRes.ok) {
        throw new Error(`HTTP error! status: ${standardRes.status}`);
      }

      const standardHtml = await standardRes.text();
      const $ = cheerio.load(standardHtml);
      const subServers: Servers = {};

      $("#list-server-more .list-server-items li.linkserver").each((_, el) => {
        const provider = ($(el).attr("data-provider") || "").toLowerCase();
        const videoLink = $(el).attr("data-video") || "";

        if (["doodstream", "mixdrop", "mp4upload"].includes(provider)) {
          subServers[provider] = {
            embeded_link: videoLink,
            skipped: true,
            m3u8: false,
          };
        } else if (videoLink) {
          subServers[provider] = { embeded_link: videoLink, m3u8: false };
        }
      });

      for (const [subServerName, subServerData] of Object.entries(subServers)) {
        if (subServerData.skipped) {
          servers[subServerName] = subServerData;
          continue;
        }

        const result = await processServer(subServerData.embeded_link);
        Object.assign(subServerData, result);
        servers[subServerName] = subServerData;
      }
    }

    return NextResponse.json({ success: true, data: servers }, {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=59',
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Error processing episode ID: ${error.message}`
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}