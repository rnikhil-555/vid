import * as cheerio from 'cheerio';

export const headers = {
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
};

export const baseUrl = 'https://mangafire.to';

interface MangaItem {
  id: string | undefined;
  name: string;
  imageUrl: string | undefined;
  type: string;
}

export const mangaListFromPage = (html: string) => {
  const $ = cheerio.load(html);
  const elements = $("div.unit");
  const list: MangaItem[] = [];

  elements.each((_, element) => {
    const name = $(element).find("div.info > a").text();
    const imageUrl = $(element).find("img").attr("src");
    const id = $(element).find("a").attr("href");
    const type = $(element).find(".type").text();
    list.push({ id, name, imageUrl, type });
  });

  const hasNextPage = $("li.page-item.active + li").text() !== "";
  return { list, hasNextPage };
};

export const parseDate = (date: string) => {
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04",
    may: "05", jun: "06", jul: "07", aug: "08",
    sep: "09", oct: "10", nov: "11", dec: "12",
  };
  
  const dateParts = date.toLowerCase().replace(",", "").split(" ");
  
  if (!(dateParts[0] in months)) {
    return String(new Date().valueOf());
  }
  
  const month = months[dateParts[0]];
  const formattedDate = `${dateParts[2]}-${month}-${dateParts[1]}`;
  return String(new Date(formattedDate).valueOf());
};
