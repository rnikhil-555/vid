"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useMediaList } from "@/hooks/use-media-list";
import { createAuthClient } from "better-auth/react"
const { useSession } = createAuthClient()
import type { MediaItem } from "@/hooks/use-media-list";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthModal } from "@/store/use-auth-modal";

interface PlayMovieButtonProps {
  movieId: string;
  title: string;
  backdrop_path: string;
  className?: string;
}

export default function PlayMovieButton({
  movieId,
  title,
  backdrop_path,
  className,
}: PlayMovieButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("watchHistoryPaused") === "true";
    }
    return false;
  });

  const { addItem: addToHistory } = useMediaList("history", isPaused);
  const { addItem: addToWatchlist } = useMediaList("watchlist", false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default Link behavior

    if (!session) {
      return router.push(`/watch/movie/${movieId}`);
    }

    try {
      const now = new Date().toISOString();
      const mediaData: MediaItem = {
        mediaId: movieId,
        mediaType: "movie",
        title,
        backdrop_path,
        _id: '', // MongoDB will generate this
        addedAt: now,
        watchedAt: now,
        createdAt: now,
        updatedAt: now
      };

      // Add to both history and watchlist
      await Promise.all([
        addToHistory(mediaData),
        addToWatchlist(mediaData)
      ]);

      // Navigate to watch page after successful save
      router.push(`/watch/movie/${movieId}`);
    } catch (error) {
      console.error('Error saving media data:', error);
      // Navigate anyway even if save fails
      router.push(`/watch/movie/${movieId}`);
    }
  };

  return (
    <Button
      variant="default"
      size="lg"
      className={className}
      onClick={handleClick}
    >
      <Play className="fill-black pr-1" />
      Play
    </Button>
  );
}