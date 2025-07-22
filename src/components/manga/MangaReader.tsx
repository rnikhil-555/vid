"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTopLoader } from "nextjs-toploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useTheme } from "next-themes";

interface ImageData extends Array<string | number> {
  0: string;
  1: number;
  2: number;
}

interface MangaReaderProps {
  images: ImageData[];
  id: string;
  manga: any;
  chapterId: string;
  chapters: any[];
  lang: string;
}

export default function MangaReader({ images, id, manga, chapterId, chapters, lang }: MangaReaderProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserScroll = useRef(false);
  const [scrolled, setScrolled] = useState(false);
  const { start } = useTopLoader();
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const initialLoadingState = Object.fromEntries(
      images.map((_, idx) => [idx, true])
    );
    setImageLoading(initialLoadingState);
  }, [images]);

  // Scroll-based page detection
  useEffect(() => {
    const handleScroll = () => {
      if (isUserScroll.current) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Get all image containers
      const imageContainers = imgRefs.current.filter(Boolean);
      
      // Find the image most centered in the viewport
      let mostCenteredIdx = 0;
      let smallestDistance = Infinity;
      
      imageContainers.forEach((container, idx) => {
        if (container) {
          const rect = container.getBoundingClientRect();
          const distanceFromCenter = Math.abs(rect.top + rect.height / 2 - windowHeight / 2);
          
          if (distanceFromCenter < smallestDistance) {
            smallestDistance = distanceFromCenter;
            mostCenteredIdx = idx;
          }
        }
      });

      // Only update if the page has changed
      if (mostCenteredIdx + 1 !== currentPage) {
        setCurrentPage(mostCenteredIdx + 1);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Add resize event listener to handle window size changes
    window.addEventListener('resize', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
    };
  }, [currentPage]); // Only re-run if currentPage changes

  // Fullscreen handlers
  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  const handlePageChange = (value: string) => {
    const newPage = Number(value);
    isUserScroll.current = true;
    setCurrentPage(newPage);
  };

  const handleProgressBarClick = (idx: number) => {
    isUserScroll.current = true;
    setCurrentPage(idx + 1);
    imgRefs.current[idx]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    // Reset isUserScroll after animation completes
    setTimeout(() => {
      isUserScroll.current = false;
    }, 1000);
  };

  const handleChapterChange = (value: string) => {
    start();
    router.push(`/manga/${id}/${value.split("/").pop()}`);
  };

  const handleImageLoad = (idx: number) => {
    setImageLoading(prev => ({ ...prev, [idx]: false }));
  };

  const currentChapterIdx = chapters?.findIndex(
    (chapter: any) => chapter.url.split("/").pop() === chapterId
  );

  const prevChapter = currentChapterIdx > 0 ? chapters[currentChapterIdx - 1] : null;
  const nextChapter = currentChapterIdx < chapters.length - 1 ? chapters[currentChapterIdx + 1] : null;

  // Get chapter number for display
  const currentChapter = chapters?.[currentChapterIdx];
  const chapterNo =
    currentChapter?.chapterNo ??
    currentChapter?.name?.match(/(\d+(\.\d+)?)/)?.[0] ??
    currentChapter?.name ??
    "";

  // --- New: Page navigation handlers ---
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    } else if (nextChapter) {
      start();
      router.push(`/manga/${id}/${nextChapter.url.split("/").pop()}?lang=${lang}`);
    }
  };

  const goToNextPage = () => {
    if (currentPage < images.length) {
      setCurrentPage((p) => p + 1);
    } else if (prevChapter) {
      start();
      router.push(`/manga/${id}/${prevChapter.url.split("/").pop()}?lang=${lang}`);
    }
  };

  return (
    <>
      {/* Reader Section */}
      <div className={`max-w-5xl mx-auto px-4 pt-10`}>
        {images?.map((image, idx) => (
          <div
            key={`page-${idx}`}
            ref={el => { imgRefs.current[idx] = el; }}
            className="relative mb-4"
          >
            {/* Skeleton Loader */}
            {imageLoading[idx] && (
              <div className={`w-full aspect-[595/842] rounded-lg animate-pulse flex items-center justify-center
                ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
                <div className="inline-flex flex-col items-center gap-3">
                  <svg
                    className={`animate-spin h-8 w-8 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
                    Loading page {idx + 1}...
                  </span>
                </div>
              </div>
            )}

            {/* Image */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/api/image-proxy?url=${image[0]}` as string}
              alt={`Page ${idx + 1}`}
              className={`w-full h-auto select-none mx-auto transition-opacity duration-300 ${
                !imageLoading[idx] ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              draggable={false}
              onLoad={() => handleImageLoad(idx)}
              onError={() => handleImageLoad(idx)}
            />

            {/* Page Number Indicator */}
            <div className={`absolute bottom-4 right-4 px-2.5 py-1 text-xs rounded-md font-medium
              ${theme === "dark" ? "bg-black/70 text-white" : "bg-white/80 text-gray-900 border border-gray-300"}`}>
              {idx + 1} / {images.length}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Floating Controls */}
      <div
        className={`
          fixed bottom-[70px] md:bottom-2 left-1/2 -translate-x-1/2  z-[100] 
          flex flex-row items-center justify-center gap-1 sm:gap-6 pointer-events-auto
          w-[95vw] max-w-4xl px-2 sm:px-1
        `}
      >
        {/* Chapter Navigation */}
        <div
          className={`
            flex items-center gap-1 rounded-full px-2 font-semibold select-none
            ${theme === "dark"
              ? "bg-[#23272f] text-white"
              : "bg-gray-100 text-gray-900 border border-gray-300 shadow-md"
            }
            w-full sm:w-auto justify-center
          `}
        >
          <button
            className="rounded-full p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (nextChapter) {
                start();
                router.push(`/manga/${id}/${nextChapter.url.split("/").pop()}?lang=${lang}`);
              }
            }}
            disabled={!nextChapter}
            aria-label="Previous Chapter"
            style={{ display: "flex", alignItems: "center" }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="mx-1 sm:mx-2 truncate max-w-[60vw] sm:max-w-none">CH: {chapterNo}</span>
          <button
            className="rounded-full p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (prevChapter) {
                start();
                router.push(`/manga/${id}/${prevChapter.url.split("/").pop()}?lang=${lang}`);
              }
            }}
            disabled={!prevChapter}
            aria-label="Next Chapter"
            style={{ display: "flex", alignItems: "center" }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        {/* Page Navigation */}
        <div
          className={`
            flex items-center gap-1 rounded-full px-2 font-semibold select-none
            ${theme === "dark"
              ? "bg-[#23272f] text-white"
              : "bg-gray-100 text-gray-900 border border-gray-300 shadow-md"
            }
            w-full sm:w-auto justify-center
          `}
        >
          <button
            className="rounded-full p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage((p) => p - 1);
              } else if (nextChapter ) {
                start();
                router.push(`/manga/${id}/${nextChapter.url.split("/").pop()}?lang=${lang}`);
              }
            }}
            disabled={currentPage === 1 && !nextChapter}
            aria-label="Previous Page"
            style={{ display: "flex", alignItems: "center" }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="mx-1 sm:mx-2 whitespace-nowrap">{currentPage} / {images.length}</span>
          <button
            className="rounded-full p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (currentPage < images.length) {
                setCurrentPage((p) => p + 1);
              } else if (prevChapter) {
                start();
                router.push(`/manga/${id}/${prevChapter.url.split("/").pop()}?lang=${lang}`);
              }
            }}
            disabled={currentPage === images.length && !prevChapter}
            aria-label="Next Page"
            style={{ display: "flex", alignItems: "center" }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        {/* Fullscreen Button on the far right */}
        <div className="w-full flex justify-end sm:w-auto">
          <button
            className={`
              rounded-full shadow-lg pointer-events-auto p-2
              ${theme === "dark"
                ? "bg-[#23272f] text-white"
                : "bg-gray-100 text-gray-900 border border-gray-300 shadow-md"
              }
            `}
            onClick={() => setIsFullscreen((f) => !f)}
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Progress Bar (now vertical on the left) */}
      <div className="fixed top-0 left-0 h-[100vh] w-3 z-[101] flex flex-col justify-center items-center pointer-events-none">
        <div className="flex flex-col h-full w-full gap-1 pointer-events-auto">
          {images?.map((_, idx) => {
            const isCurrentPage = idx + 1 <= currentPage; // Changed from <= to ===
            return (
              <div
                key={`progress-${idx}`}
                className={`w-[6px] flex-1 rounded transition-all duration-200 cursor-pointer
                  ${isCurrentPage
                    ? ("bg-blue-600")
                    : (theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400")
                  }`}
                onClick={() => handleProgressBarClick(idx)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}