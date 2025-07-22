import { AnimeInfo } from "@/types/anilist";

export async function fetchAnimeInfo(id: number): Promise<AnimeInfo | null> {
  try {
    const response = await fetch(
      process.env.ANIME_API + "/meta/anilist/info/" + id,
    );
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return null;
  }
}
