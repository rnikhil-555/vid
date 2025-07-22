import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface Drama {
  title: string;
  id: string;
  original_id: string;
  image: string;
  episode: string;
  time: string;
}
export const revalidate = 21600;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'drama';
  const country = searchParams.get('country');
  const genre = searchParams.get('genre');
  const releaseYear = searchParams.get('release-year');
  const page = searchParams.get('page') || '1';

  // console.log(
  //   `Discover query: type=${type}, country=${country}, genre=${genre}, releaseYear=${releaseYear}, page=${page}`
  // );

  try {
    // Determine the base URL based on the type parameter
    let baseUrl;
    if (type === "movie") {
      baseUrl = "https://dramacool.sh/category/movies/";
    } else {
      baseUrl = "https://dramacool.sh/category/asian-drama/";
    }

    // Construct the query string
    const queryParams = new URLSearchParams();
    if (country) queryParams.append("country", country);
    if (genre) queryParams.append("genre", genre);
    if (releaseYear) queryParams.append("release-year", releaseYear);

    // Construct the target URL
    const targetUrl = `${baseUrl}?${queryParams.toString()}&page=${page}`;

    // Fetch the HTML content of the provided URL
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

    // Extract pagination details
    const nextPage = $(".pagination .next.page-numbers").attr("href")
      ? true
      : false;
    const prevPage = $(".pagination .prev.page-numbers").attr("href")
      ? true
      : false;
    const maxPage = $(".pagination .page-numbers")
      .not(".dots, .prev, .next, .current")
      .last()
      .text();

    return NextResponse.json({
      success: true,
      data: dramas,
      pagination: {
        nextpage: nextPage,
        prevpage: prevPage,
        maxpage: parseInt(maxPage) || 1,
      }
    });

  } catch (error) {
    console.error("Error fetching or parsing the website:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data." },
      { status: 500 }
    );
  }
}