import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

const headers = {
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
  'Cookie': "__pf=1; usertype=guest; session=1RZR8WdND9rHrTMwLGevwzDj5B1iLXFAM3AhUrnw; cf_clearance=CB4lmBovkd2NRtvI2mnVrxyKS2UyD6R0uTDeMIRS.fk-1747307255-1.2.1.1-8FNa2_UTEN9ioGwdNxkvnMxPyjG1I6ZYxQQhQYXV2o2iPKZsolUhSCeYM40Uq0zREHIRKf00ffoojpevTJfKl664NWxP8H_56wgofqc3S1fF._wybPvDIGEjZt5e9wPPGev5edBKucN4PL9K1.w27hTXHemi.P.4Dm1tmXpwtiz9_PdilqapT0neNKjKN3m6_Uau8jjy8T4DVmwxEqOMou4Q5OA92LxdrGWTYJsXqNpwAvXqJKRSCvAFWDoLn46T__ABctWsZr11EzdhLx3HYqsm.4LJn8lAerp3WRAOU5sc0QTMk_ljaWzvTEw8YUUhHuwWcK0ziZYcmvhtNZtoECbFGrlxhBd2tHDdFKmjNJ8"
};

const mangaListFromPage = (html: string) => {
  const $ = cheerio.load(html);
  const elements = $("div.unit");
  const list:any = [];

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

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const lang = searchParams.get('lang') || 'en';

  try {
    const url = `https://mangafire.to/filter?keyword=&language=${lang}&sort=trending&page=${page}`;
    const response = await fetch(url, { headers });
    const rawData = await response.text();
    const data = mangaListFromPage(rawData);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching popular manga:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular manga' },
      { status: 500 }
    );
  }
}
