"use client";

import { Button } from "@/components/ui/button";
import { useMediaList } from "@/hooks/use-media-list";
import { useSession } from "next-auth/react";
import type { MediaItem } from "@/hooks/use-media-list";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdMenuBook } from "react-icons/md";
import { useTopLoader } from "nextjs-toploader";

interface ReadMangaButtonProps {
  mangaId: string;
  title: string;
  imageUrl: string;
  firstChapter?: string;
  className?: string;
}

export default function ReadMangaButton({
  mangaId,
  title,
  imageUrl,
  firstChapter,
  className,
}: ReadMangaButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { start } = useTopLoader();
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("readHistoryPaused") === "true";
    }
    return false;
  });
  const { addItem: addToWatchlist } = useMediaList("watchlist", false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    start(); // Start the top loader
    
    if (!session) {
      router.push(`/manga/${mangaId}/${firstChapter}?lang=en`);
      return;
    }

    try {
      const now = new Date().toISOString();
      const mediaData: MediaItem = {
        mediaId: mangaId,
        mediaType: "manga",
        title,
        backdrop_path: imageUrl,
        chapter: firstChapter,
        _id: '',
        addedAt: now,
        watchedAt: now,
        createdAt: now,
        updatedAt: now
      };

      // Add to watchlist
      await addToWatchlist(mediaData);

      // Navigate to read page
      router.push(`/manga/${mangaId}/${firstChapter}?lang=en`);
    } catch (error) {
      console.error('Error saving manga data:', error);
      router.push(`/manga/${mangaId}/${firstChapter}?lang=en`);
    }
  };

  return (
    <Button
      variant="default"
      size="lg"
      className={className}
      onClick={handleClick}
    >
      <MdMenuBook className="mr-2 h-5 w-5" />
      Read Now
    </Button>
  );
}