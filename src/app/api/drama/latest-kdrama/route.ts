import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

interface Drama {
  title: string;
  id: string;
  original_id: string;
  image: string;
  episode: string;
  time: string;
}
export const revalidate = 900;
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";

  try {
    const baseUrl = "https://dramacool.sh/category/asian-drama/";

    const targetUrl = `${baseUrl}?sort=popular&country=korean&year=${new Date().getFullYear()}&page=${page}`

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://dramacool.sh/",
      },
      next: {
        revalidate: 1800
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // Initialize an array to store data for the dramas
    const dramas: Drama[] = [];

    // Extract drama details
    $("#primary .box li").each((_, element) => {
      const title = $(element).find("h3").text().trim();
      let id = $(element)
        .find("a")
        .attr("href")
        ?.replace("https://dramacool.sh", "")
        .replace(/\//g, "");
      const image =
        $(element).find("img").attr("data-original") ||
        $(element).find("img").attr("src") ||
        "";
      const episode = $(element).find(".ep").text().trim();
      const time = $(element).find(".time").text().trim();

      const cleanLink = id?.replace(/-episode-\d+/i, "");

      dramas.push({
        title,
        id: cleanLink || "",
        original_id: id || "",
        image,
        episode,
        time,
      });
    });

    return NextResponse.json({
      success: true,
      data: dramas,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=59',
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
