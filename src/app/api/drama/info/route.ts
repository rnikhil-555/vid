import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 43200;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: "Missing required query parameter: id" },
      { status: 400 }
    );
  }

  try {
    const targetUrl = `https://dramacool.sh/${id}/`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://dramacool.sh/",
      },
      next: {
        revalidate: 43200 // 12 hours in seconds
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // Extract details
    const title = $("#drama-details .entry-header h1").text().trim() || null;
    const thumbnail =
      $("#drama-details .drama-thumbnail img").attr("src") || null;
    const synopsis =
      $("#drama-details .synopsis p.synopsis").text().trim() || null;
    const other_name =
      $("#drama-details .synopsis p.aka")
        .text()
        .replace("Other name: ", "")
        .trim() || null;

    const synopsisHtml = $("#drama-details .synopsis").html();
    const total_episode = synopsisHtml
      ? synopsisHtml.match(/Episodes: (\d+)/)?.[1] || null
      : null;
    const duration = synopsisHtml
      ? synopsisHtml.match(/Duration: ([^<]+)/)?.[1]?.trim() || null
      : null;
    const rating = synopsisHtml
      ? synopsisHtml.match(/Content Rating: ([^<]+)/)?.[1]?.trim() || null
      : null;
    const airs = synopsisHtml
      ? synopsisHtml.match(/Airs On: ([^<]+)/)?.[1]?.trim() || null
      : null;

    const country = $("#drama-details p.country a").text().trim() || null;
    const status = $("#drama-details p.status a").text().trim() || null;
    const release_year =
      $("#drama-details p.release-year a").text().trim() || null;
    const genres =
      $("#drama-details p.genres a")
        .map((_, el) => $(el).text().trim())
        .get() || null;
    const starring =
      $("#drama-details p.starring a")
        .map((_, el) => $(el).text().trim())
        .get() || null;

    const trailerElement = $("#drama-details .trailer iframe");
    const trailer =
      trailerElement.length > 0 ? trailerElement.attr("src") : null;

    // Extract episode list with deduplication
    const episodesSet = new Set();
    const episodes = $("#episode-list .episode-list li")
      .map((_, el) => {
        const episodeTitle = $(el).find("h3 a").text().trim();
        const episodeLink = $(el)
          .find("h3 a")
          .attr("href")
          ?.replace("https://dramacool.sh", "")
          .replace(/\//g, "");
        const episodeTime = $(el).find(".time").text().trim();
        const episodeKey = `${episodeTitle}-${episodeLink}`;

        if (!episodesSet.has(episodeKey)) {
          episodesSet.add(episodeKey);
          return {
            title: episodeTitle,
            episode_id: episodeLink,
            time: episodeTime,
            episodeNo: parseInt(episodeLink?.split("-").pop() || "NaN"),
          };
        }
      })
      .get();

    return NextResponse.json({
      success: true,
      data: {
        title,
        thumbnail,
        synopsis,
        other_name,
        total_episode,
        duration,
        rating,
        airs,
        country,
        status,
        release_year,
        genres,
        starring,
        trailer,
        episodes,
      },

    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=59',
      },
    });

  } catch (error) {
    console.error("Error fetching or parsing the website:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data." },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}