"use client"
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMediaStore } from "@/utils/store";

export interface MediaItem {
  _id: string;
  mediaId: string;
  mediaType: "movie" | "tv" | "anime" | "drama" | "manga";
  title: string;
  backdrop_path: string;
  season?: number;
  episode?: number;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
  watchedAt?: string;
  chapter?: any;
}

export function useMediaList(type: "watchlist" | "history", isPaused: boolean) {
  const { data: session } = useSession();
  const { 
    [type]: items, 
    loading,
    setLoading,
    initializeStore,
    addItem: addToStore,
    removeItem: removeFromStore,
    isInList
  } = useMediaStore();

  useEffect(() => {
    const loadItems = async () => {
      if (!loading) return;

      try {
        if (session?.user) {
          const response = await fetch(`/api/${type}`);
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          const data = await response.json();
          initializeStore(type, data);
        }
      } catch (error) {
        console.error("Error loading items:", error);
        initializeStore(type, []);
      }
    };

    loadItems();
  }, [session, type]);

  const addItem = async (item: MediaItem) => {
    if (isPaused) return;

    try {
      if (session?.user) {
        const response = await fetch(`/api/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const newItem = await response.json();
        addToStore(type, newItem);
      } else {
        addToStore(type, item);
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const removeItem = async (mediaId: string, mediaType: string, all?: boolean) => {
    try {
      if (session?.user) {
        const response = await fetch(`/api/${type}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId, mediaType, removeAll: all }),
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }
      }

      removeFromStore(type, mediaId, mediaType);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return {
    items,
    loading,
    addItem,
    removeItem,
    isInList: (mediaId: string, mediaType: string) => isInList(type, mediaId, mediaType)
  };
}
