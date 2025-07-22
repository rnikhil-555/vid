"use server"

import * as cheerio from 'cheerio';

export const fetchDramas = async (
    url: string
  ): Promise<{ dramas: any[]; pagination: any }> => {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://dramacool.sh/",
      },
      next:{
        revalidate: 43200
      }
    });
    const data = await response.text()
    const html = data;
    const $ = cheerio.load(html);
  
    const dramas: {
      title: string;
      id: string;
      original_id: string;
      image: string;
      episode: string;
      time: string;
    }[] = [];
  
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
        image: image || "",
        episode,
        time,
      });
    });
  
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
  
    return {
      dramas,
      pagination: {
        nextpage: nextPage,
        prevpage: prevPage,
        maxpage: parseInt(maxPage) || 1,
      },
    };
  };
  
  export const fetchSearchResults = async (
    query: string,
    page: number
  ): Promise<{ dramas: any[]; pagination: any }> => {
    const targetUrl = `https://dramacool.sh/page/${page}/?s=${encodeURIComponent(
      query
    )}`;
  
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://dramacool.sh/",
      },
      next:{
        revalidate: 43200
      }
    });
    const data = await response.text()
    const html = data;
    const $ = cheerio.load(html);
  
    const dramas: {
      title: string;
      id: string;
      original_id: string;
      image: string | null;
      synopsis: string | null;
      releaseYear: string | null;
    }[] = [];
  
    $("#main.site-main.wrapper .list-thumb li").each((_, element) => {
      const title = $(element).find("h2 a").text().trim();
      const idAttr = $(element).find("h2 a").attr("href");
      const id = idAttr?.replace("https://dramacool.sh", "").replace(/\//g, "");
      const image =
        $(element).find("img").attr("data-original") ||
        $(element).find("img").attr("src") ||
        null;
      const synopsis =
        $(element).find("p").not(".post-info").text().trim() || null;
      const releaseYear =
        $(element)
          .find(".post-info strong:contains('Release Year:')")
          .next("a")
          .text()
          .trim() || null;
  
      const cleanLink = id?.replace(/-episode-\d+/i, "");
  
      if (title && id) {
        dramas.push({
          title,
          id: cleanLink || "",
          original_id: id || "",
          image,
          synopsis,
          releaseYear,
        });
      }
    });
  
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
  
    return {
      dramas,
      pagination: {
        hasNextPage: nextPage,
        hasPrevPage: prevPage,
        maxPage: parseInt(maxPage) || 1,
      },
    };
  };



