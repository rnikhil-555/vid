"use client";

import { useMediaList } from "@/hooks/use-media-list";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react"
const { useSession } = createAuthClient()
import type { MediaItem } from "@/hooks/use-media-list";
import { useAuthModal } from "@/store/use-auth-modal";

interface WatchlistButtonProps {
  mediaId: string;
  mediaType: "movie" | "tv" | "anime" | "drama" | "manga";
  title: string;
  backdrop_path: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function WatchlistButton({
  mediaId,
  mediaType,
  title,
  backdrop_path,
  className,
  variant = "outline",
  size = "default",
}: WatchlistButtonProps) {
  const { data: session } = useSession();

  const {
    addItem: addToWatchlist,
    removeItem: removeFromWatchlist,
    isInList: isInWatchlist,
    loading
  } = useMediaList("watchlist", false);

  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const { onOpen } = useAuthModal();

  useEffect(() => {
    if (!loading) {
      setIsWatchlisted(isInWatchlist(mediaId, mediaType));
    }
  }, [mediaId, mediaType, isInWatchlist, loading]);

  const handleWatchlistToggle = () => {
    if (!session) {
      onOpen();
      return;
    }

    if (isWatchlisted) {
      removeFromWatchlist(mediaId, mediaType);
    } else {
      addToWatchlist({
        mediaId,
        mediaType,
        title,
        backdrop_path,
        addedAt: new Date().toISOString(),
        _id: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as MediaItem);
    }
  };

  if (!session) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => onOpen()}
      >
        <Plus className="mr-2 h-4 w-4" />
        Watchlist
      </Button>
    );
  }

  return (
    <Button
      onClick={handleWatchlistToggle}
      variant={variant}
      size={size}
      className={className}
    >
      {isWatchlisted ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      Watchlist
    </Button>
  );
}
