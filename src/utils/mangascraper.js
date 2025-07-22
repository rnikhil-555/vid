import axios from "axios";
import * as cheerio from "cheerio";

const preferences = {
  mangafire_pref_content_view: "chapter",
};

const headers = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://mangafire.to',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  },
};

export class MangafireScraper {
  constructor() {
    this.source = {
      name: "Mangafire",
      langs: ["en", "ja", "fr", "es", "es-la", "pt", "pt-br"],
      baseUrl: "https://mangafire.to",
      iconUrl: "https://mangafire.to/assets/sites/mangafire/favicon.png?v3",
      lang: "en",
    };
  }

  getPreference(key) {
    return preferences[key];
  }

  setPreference(key, value) {
    preferences[key] = value;
    return preferences[key];
  }

  mangaListFromPage(html) {
    const $ = cheerio.load(html);
    const elements = $("div.unit");
    const list = [];

    elements.each((_, element) => {
      const name = $(element).find("div.info > a").text();
      const imageUrl = $(element).find("img").attr("src");
      const id = $(element).find("a").attr("href");
      const type = $(element).find(".type").text();
      list.push({ id, name, imageUrl, type });
    });

    const pagination = {
      currentPage: parseInt($("li.page-item.active span.page-link").text()) || 1,
      totalPages: 0,
      hasNextPage: false,
      pages: []
    };

    $("li.page-item").each((_, element) => {
      const pageNum = $(element).find("a.page-link").text();
      if (pageNum && !isNaN(pageNum)) {
        pagination.pages.push(parseInt(pageNum));
      }
    });

    const lastPageLink = $("li.page-item:last-child a.page-link").attr("href");
    if (lastPageLink) {
      const match = lastPageLink.match(/page=(\d+)/);
      if (match) {
        pagination.totalPages = parseInt(match[1]);
      }
    }

    pagination.hasNextPage = $("li.page-item.active + li").length > 0;

    return { 
      list, 
      pagination,
      hasNextPage: pagination.hasNextPage 
    };
  }

  parseDate(date) {
    const months = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    date = date.toLowerCase().replace(",", "").split(" ");

    if (!(date[0] in months)) {
      return String(new Date().valueOf());
    }

    date[0] = months[date[0]];
    date = [date[2], date[0], date[1]];
    date = date.join("-");
    return String(new Date(date).valueOf());
  }

  async getPopular(page, lang = "en") {
    try {
      const url = `${this.source.baseUrl}/filter?keyword=&language=${lang}&sort=trending&page=${page}`;
      const response = await axios.get(url, headers);
      return this.mangaListFromPage(response.data);
    } catch (error) {
      throw new Error(`Failed to get popular: ${error.message}`);
    }
  }

  async getLatestUpdates(page, lang = "en") {
    try {
      const url = `${this.source.baseUrl}/filter?keyword=&language=${lang}&sort=recently_updated&page=${page}`;
      const response = await axios.get(url, headers);
      return this.mangaListFromPage(response.data);
    } catch (error) {
      throw new Error(`Failed to get latest updates: ${error.message}`);
    }
  }

  async search(query, page, filters = {}, lang = "en") {
    try {
      query = query.trim().replace(/\s+/g, "+");
      let url = `${this.source.baseUrl}/filter?keyword=${query}`;

      if (filters.types && Array.isArray(filters.types)) {
        filters.types.forEach((type) => {
          url += `&type[]=${type}`;
        });
      }

      if (filters.genres) {
        if (filters.genres.include && Array.isArray(filters.genres.include)) {
          filters.genres.include.forEach((genreId) => {
            url += `&genre[]=${genreId}`;
          });
        }
      }

      if (filters.status && Array.isArray(filters.status)) {
        filters.status.forEach((status) => {
          url += `&status[]=${status}`;
        });
      }

      if (filters.minChapters) {
        url += `&minchap=${filters.minChapters}`;
      }

      if (filters.sort) {
        url += `&sort=${filters.sort}`;
      }

      if (filters.year) {
        url += `&year[]=${filters.year}`; 
      }

      url += `&language=${lang}`;
      url += `&page=${page}`;

      const response = await axios.get(url, headers);
      return this.mangaListFromPage(response.data);
    } catch (error) {
      throw new Error(`Failed to search: ${error.message}`);
    }
  }

  /**
   * Extracts available languages and their chapter counts from the manga detail page.
   * Returns an array: [{ code, title, count }]
   */
  extractLanguages($info) {
    const langs = [];
    $info('div.dropdown.responsive .dropdown-menu a.dropdown-item').each((_, el) => {
      const $el = $info(el);
      const code = ($el.attr('data-code') || '').toLowerCase();
      const title = $el.attr('data-title') || '';
      // Extract chapter count from text, e.g. "English (184 Chapters)"
      const match = $el.text().match(/\((\d+) Chapters?\)/i);
      const count = match ? parseInt(match[1]) : null;
      if (code && title && count) {
        langs.push({ code, title, count });
      }
    });
    return langs;
  }

  /**
   * Extracts 'You may also like' recommendations from the sidebar.
   * Returns an array: [{ id, name, imageUrl, chapter, vol }]
   */
  extractRecommendations($info) {
    const recs = [];
    $info('section.side-manga .body a.unit').each((_, el) => {
      const $el = $info(el);
      try {
        const id = ($el.attr('href') || '').split('/manga/')[1];
        const name = $el.find('h6').text().trim();
        const imageUrl = $el.find('img').attr('src');
        const chapter = $el.find('.info span').first().text().trim();
        const vol = $el.find('.info span').eq(1).text().trim() || null;
        if (id && name && imageUrl) {
          recs.push({ id, name, imageUrl, chapter, vol });
        }
      } catch (err) {
        console.warn('Failed to parse recommendation:', err);
      }
    });
    return recs;
  }

  /**
   * Get manga detail, chapters, available languages, and recommendations.
   * @param {string} url
   * @param {string} [lang] - Optional language code (e.g. 'EN', 'FR')
   */
  async getDetail(url, lang = "en") {
    try {
      const viewType = this.getPreference("mangafire_pref_content_view");
      const id = url.split(".").pop();
      if (!id) throw new Error('Invalid manga ID');

      const detail = {};
      const infoUrl = `${this.source.baseUrl}/manga/${url}`;
      
      const infoResponse = await axios.get(infoUrl, headers);
      if (!infoResponse.data) throw new Error('No data received from manga page');
      
      const $info = cheerio.load(infoResponse.data);

      // Extract base info first
      detail.name = $info("div.info h1").text().trim();
      if (!detail.name) throw new Error('Could not find manga name');

      detail.status = $info("div.info p").text().trim();
      detail.imageUrl = $info("div.poster img").attr("src");
      detail.author = $info("aside.sidebar div.meta div").eq(0).find("a").text().trim();
      detail.description = $info("div#synopsis").text().trim();
      
      // Extract genres
      detail.genre = [];
      $info("aside.sidebar div.meta div")
        .eq(2)
        .find("a")
        .each((_, el) => {
          const genre = $info(el).text().trim();
          if (genre) detail.genre.push(genre);
        });

      // Extract languages and recommendations
      detail.languages = this.extractLanguages($info);
      detail.recommendations = this.extractRecommendations($info);

      // Determine which language to use for chapters
      let selectedLang = (lang || '').toLowerCase();
      if (!selectedLang && detail.languages.length > 0) {
        selectedLang = detail.languages[0].code.toLowerCase();
      }
      if (!selectedLang) selectedLang = 'en';

      // Fetch chapters
      detail.chapters = [];
      
      const chapterUrl = `${this.source.baseUrl}/ajax/read/${id}/${viewType}/${this.source.lang}`;
      const idResponse = await axios.get(chapterUrl, headers);
      const $id = cheerio.load(idResponse.data.result.html);
      const ids = $id("a");

      let chapElements = null;
      if (viewType === "chapter") {
        const chapResponse = await axios.get(
          `${this.source.baseUrl}/ajax/manga/${id}/${viewType}/${this.source.lang}`
        );
        const $chap = cheerio.load(chapResponse.data.result);
        chapElements = $chap(".scroll-sm").children();
      }

      detail.chapters = [];
      for (let i = 0; i < ids.length; i++) {
        const element = ids.eq(i);
        const name = element.text();
        const mangaId = element.attr("data-id");

        let scanlator = null;
        let dateUpload = null;

        if (viewType === "chapter" && chapElements) {
          const chapElement = chapElements.eq(i);
          const title = chapElement.find("a").attr("title").split(" - ");
          scanlator = title.length > 1 ? title[0] : "Vol 1";

          try {
            dateUpload = this.parseDate(chapElement.find("span + span").text());
          } catch (_) {
            dateUpload = null;
          }
        }

        const chapterUrl = `${this.source.baseUrl}/ajax/read/${viewType}/${mangaId}`;
        detail.chapters.push({ name, url: chapterUrl, dateUpload, scanlator });
      }

      return detail;

    } catch (error) {
      console.error('Manga detail error:', error);
      throw new Error(`Failed to get manga detail: ${error.message}`);
    }
  }

  async getPageList(url) {
    try {
      const response = await axios.get(url);
      const data = response.data;
      const pages = [];

      const headers = { Referer: this.source.baseUrl };
      data.result.images.forEach((img) => {
        pages.push({ url: img[0], headers });
      });

      return pages;
    } catch (error) {
      throw new Error(`Failed to get page list: ${error.message}`);
    }
  }

  getFilterList() {
    return [
      {
        type_name: "GroupFilter",
        name: "Type",
        state: [
          ["Manga", "manga"],
          ["One-Shot", "one_shot"],
          ["Doujinshi", "doujinshi"],
          ["Novel", "novel"],
          ["Manhwa", "manhwa"],
          ["Manhua", "manhua"],
        ].map((x) => ({ type_name: "CheckBox", name: x[0], value: x[1] })),
      },
      {
        type_name: "GroupFilter",
        name: "Genre",
        state: [
          ["Action", "1"],
          ["Adventure", "78"],
          ["Avant Garde", "3"],
          ["Boys Love", "4"],
          ["Comedy", "5"],
          ["Demons", "77"],
          ["Drama", "6"],
          ["Ecchi", "7"],
          ["Fantasy", "79"],
          ["Girls Love", "9"],
          ["Gourmet", "10"],
          ["Harem", "11"],
          ["Horror", "530"],
          ["Isekai", "13"],
          ["Iyashikei", "531"],
          ["Josei", "15"],
          ["Kids", "532"],
          ["Magic", "539"],
          ["Mahou Shoujo", "533"],
          ["Martial Arts", "534"],
          ["Mecha", "19"],
          ["Military", "535"],
          ["Music", "21"],
          ["Mystery", "22"],
          ["Parody", "23"],
          ["Psychological", "536"],
          ["Reverse Harem", "25"],
          ["Romance", "26"],
          ["School", "73"],
          ["Sci-Fi", "28"],
          ["Seinen", "537"],
          ["Shoujo", "30"],
          ["Shounen", "31"],
          ["Slice of Life", "538"],
          ["Space", "33"],
          ["Sports", "34"],
          ["SuperPower", "75"],
          ["Supernatural", "76"],
          ["Suspense", "37"],
          ["Thriller", "38"],
          ["Vampire", "39"],
        ].map((x) => ({ type_name: "TriState", name: x[0], value: x[1] })),
      },
      {
        type_name: "GroupFilter",
        name: "Status",
        state: [
          ["Releasing", "releasing"],
          ["Completed", "completed"],
          ["Hiatus", "on_hiatus"],
          ["Discontinued", "discontinued"],
          ["Not Yet Published", "info"],
        ].map((x) => ({ type_name: "CheckBox", name: x[0], value: x[1] })),
      },
      {
        type_name: "SelectFilter",
        type: "length",
        name: "Length",
        values: [
          [">= 1 chapters", "1"],
          [">= 3 chapters", "3"],
          [">= 5 chapters", "5"],
          [">= 10 chapters", "10"],
          [">= 20 chapters", "20"],
          [">= 30 chapters", "30"],
          [">= 50 chapters", "50"],
        ].map((x) => ({ type_name: "SelectOption", name: x[0], value: x[1] })),
      },
      {
        type_name: "SelectFilter",
        type: "sort",
        name: "Sort",
        state: 3,
        values: [
          ["Added", "recently_added"],
          ["Updated", "recently_updated"],
          ["Trending", "trending"],
          ["Most Relevance", "most_relevance"],
          ["Name", "title_az"],
        ].map((x) => ({ type_name: "SelectOption", name: x[0], value: x[1] })),
      },
      {
        type_name: "SelectFilter",
        type: "year",
        name: "Year",
        values: Array.from({ length: new Date().getFullYear() - 1940 + 1 }, (_, i) => {
          const year = new Date().getFullYear() - i;
          return [year.toString(), year.toString()];
        }).map((x) => ({ type_name: "SelectOption", name: x[0], value: x[1] })),
      },
    ];
  }

  getSourcePreferences() {
    return [
      {
        key: "mangafire_pref_content_view",
        listPreference: {
          title: "View manga as",
          summary: "",
          valueIndex: 0,
          entries: ["Chapters", "Volumes"],
          entryValues: ["chapter", "volume"],
        },
      },
    ];
  }
}

/**
 * Fetch chapters for a manga by id and language
 * @param {string} mangaId
 * @param {string} lang
 * @returns {Promise<Array>}
 */
export async function fetchChaptersByLanguage(mangaId, lang = "en") {
  const baseUrl = "https://mangafire.to";
  const viewType = "chapter";
  const chapterUrl = `${baseUrl}/ajax/read/${mangaId.split(".")?.[1]}/${viewType}/${lang}`;
  const headersObj = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://mangafire.to',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    }
  };

  // Fetch chapter list
  const idResponse = await axios.get(chapterUrl, headersObj);
  const $id = cheerio.load(idResponse.data.result.html);
  const ids = $id("a");

  // Fetch chapter details (for scanlator and date)
  const chapResponse = await axios.get(
    `${baseUrl}/ajax/manga/${mangaId.split(".")?.[1]}/${viewType}/${lang}`,
    headersObj
  );
  const $chap = cheerio.load(chapResponse.data.result);
  const chapElements = $chap(".scroll-sm").children();

  // Parse chapters
  const chapters = [];
  for (let i = 0; i < ids.length; i++) {
    const element = ids.eq(i);
    const name = element.text();
    const chapterId = element.attr("data-id");

    let scanlator = null;
    let dateUpload = null;

    const chapElement = chapElements.eq(i);
    const title = (chapElement.find("a").attr("title") || "").split(" - ");
    scanlator = title.length > 1 ? title[0] : "Vol 1";

    try {
      const dateText = chapElement.find("span + span").text();
      // Simple parse: fallback to timestamp if not parseable
      dateUpload = Date.parse(dateText) || null;
    } catch (_) {
      dateUpload = null;
    }

    const url = `${baseUrl}/ajax/read/chapter/${chapterId}`;
    chapters.push({ name, url, dateUpload, scanlator });
  }

  return chapters;
}


