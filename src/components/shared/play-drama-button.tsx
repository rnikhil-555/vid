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

interface PlayDramaButtonProps {
  dramaId: string;
  title: string;
  thumbnail: string;
  episodeId?: string;
  episodeNo?: number;
  className?: string;
}

export default function PlayDramaButton({
  dramaId,
  title,
  thumbnail,
  episodeId,
  episodeNo,
  className,
}: PlayDramaButtonProps) {
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
    e.preventDefault();

    if (!session) {
      return router.push(`/watch/drama/${dramaId}${episodeId ? `?epId=${episodeId}` : ''}`);;
    }

    try {
      const now = new Date().toISOString();
      const mediaData: MediaItem = {
        mediaId: dramaId,
        mediaType: "drama",
        title,
        backdrop_path: thumbnail,
        episode: episodeNo,
        _id: '',
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

      // Navigate to watch page
      router.push(`/watch/drama/${dramaId}${episodeId ? `?epId=${episodeId}` : ''}`);
    } catch (error) {
      console.error('Error saving drama data:', error);
      router.push(`/watch/drama/${dramaId}${episodeId ? `?epId=${episodeId}` : ''}`);
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