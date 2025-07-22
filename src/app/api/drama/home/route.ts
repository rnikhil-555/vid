import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 43200; 

export async function GET() {  
    try {
      const response = await fetch("https://dramacool.sh/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://dramacool.sh/",
        },
        next: {
          revalidate: 1800, 
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
  
      const recentlyAddedDramas: any[] = [];
      const recentMovies: any[] = [];
      const recentKShows: any[] = [];
      const blogContent: any[] = [];
      const ongoingDramas: any[] = [];
      const upcomingEpisodes: any[] = [];
      const mostPopularDramas: any[] = [];
  
      $("#drama .box li").each((_, element) => {
        const title = $(element).find("h3").text().trim();
        const id = $(element)
          .find("a")
          .attr("href")
          ?.replace("https://dramacool.sh", "")
          .replace(/\//g, "");
        const image = $(element).find("img").attr("data-src");
        const episode = $(element).find(".ep").text().trim();
        const time = $(element).find(".time").text().trim();
        const cleanLink = id?.replace(/-episode-\d+/i, "");
  
        if (id && cleanLink) {
          recentlyAddedDramas.push({
            title,
            id: cleanLink,
            original_id: id,
            image,
            episode,
            time,
          });
        }
      });
  
      $("#movie .box li").each((_, element) => {
        const title = $(element).find("h3").text().trim();
        const id = $(element)
          .find("a")
          .attr("href")
          ?.replace("https://dramacool.sh", "")
          .replace(/\//g, "");
        const image = $(element).find("img").attr("src");
        const cleanLink = id?.replace(/-episode-\d+/i, "");
  
        if (id && cleanLink) {
          recentMovies.push({ title, id: cleanLink, original_id: id, image });
        }
      });
  
      $("#kshow .box li").each((_, element) => {
        const title = $(element).find("h3").text().trim();
        const id = $(element)
          .find("a")
          .attr("href")
          ?.replace("https://dramacool.sh", "")
          .replace(/\//g, "");
        const image = $(element).find("img").attr("src");
        const episode = $(element).find(".ep").text().trim();
        const time = $(element).find(".time").text().trim();
        const cleanLink = id?.replace(/-episode-\d+/i, "");
  
        if (id && cleanLink) {
          recentKShows.push({
            title,
            id: cleanLink,
            original_id: id,
            image,
            episode,
            time,
          });
        }
      });
  
      $(".blog-content .box li").each((_, element) => {
        const title = $(element).find("h3").text().trim();
        const link = $(element).find("a").attr("href");
        const image = $(element).find("img").attr("src");
        const cleanLink = link?.replace(/-episode-\d+/i, "");
  
        if (link && cleanLink) {
          blogContent.push({
            title,
            link: cleanLink,
            original_link: link,
            image,
          });
        }
      });
  
      $("#popular .short-list li h3 a").each((_, element) => {
        const title = $(element).text().trim();
        const id = $(element)
          .attr("href")
          ?.replace("https://dramacool.sh", "")
          .replace(/\//g, "");
        const cleanLink = id?.replace(/-episode-\d+/i, "");
  
        if (id && cleanLink) {
          ongoingDramas.push({ title, id: cleanLink, original_id: id });
        }
      });
  
      $("#upcoming .short-list li h3 a").each((_, element) => {
        const title = $(element).text().trim();
        const id = $(element)
          .attr("href")
          ?.replace("https://dramacool.sh", "")
          .replace(/\//g, "");
        const cleanLink = id?.replace(/-episode-\d+/i, "");
  
        if (id && cleanLink) {
          upcomingEpisodes.push({ title, id: cleanLink, original_id: id });
        }
      });
  
      $(".popular-mob .widget-list li").each((_, element) => {
        const title = $(element).find("h3 a").text().trim();
        const id = $(element)
          .find("h3 a")
          .attr("href")
          ?.replace("https://dramacool.sh", "")
          .replace(/\//g, "");
        const cleanLink = id?.replace(/-episode-\d+/i, "");
  
        if (id && cleanLink) {
          mostPopularDramas.push({ title, id: cleanLink, original_id: id });
        }
      });
  
      const data = {
        recently_added: recentlyAddedDramas,
        recent_movie: recentMovies,
        recent_k_show: recentKShows,
        blog: blogContent,
        ongoing: ongoingDramas,
        upcoming: upcomingEpisodes,
        popular: mostPopularDramas,
      };

      return NextResponse.json({ success: true, data },{
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