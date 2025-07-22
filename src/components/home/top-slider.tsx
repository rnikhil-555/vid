"use client";

import { useState, memo, useCallback, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Info, Play, Star } from "lucide-react";
import { GenreIds, SlideInfo, ThumbnailInfo, TMDBTrendingResponse } from "@/types/slider";

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect id="r" width="${w}" height="${h}" fill="#1a1a1a">
    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
  </rect>
</svg>`;

const toBase64 = (str: string) => typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

interface TopSliderClientProps {
  initialData: {
    movieGenres: GenreIds[];
    tvGenres: GenreIds[];
    trendingDay: Array<TMDBTrendingResponse['results'][0] & { logo_path?: string }>;
    trendingWeek: TMDBTrendingResponse['results'];
  };
}

function transformSlideData(data: TopSliderClientProps['initialData']): {
  slides: SlideInfo[];
  thumbnails: ThumbnailInfo[];
} {
  const slides = data.trendingDay
    .filter(item => item.logo_path)
    .map(item => ({
      id: item.id.toString(),
      backdrop_path: item.backdrop_path,
      title: item.title || item.name || '',
      overview: item.overview,
      media_type: item.media_type,
      genre_ids: item.genre_ids,
      release_date: item.release_date || item.first_air_date || '',
      vote_average: item.vote_average,
      logo_path: item.logo_path || '',
    }));

  const thumbnails = data.trendingWeek.map(item => ({
    id: item.id.toString(),
    poster_path: item.backdrop_path,
    title: item.title || item.name || '',
    media_type: item.media_type,
    genre_ids: item.genre_ids,
  }));

  return { slides, thumbnails };
}

export const TopSliderClient = memo(function TopSliderClient({ initialData }: TopSliderClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { slides, thumbnails } = transformSlideData(initialData);

  const getGenreNames = useCallback((genreIds: number[], mediaType: string) => {
    const genres = mediaType === 'movie' ? initialData.movieGenres : initialData.tvGenres;
    return genreIds
      .map(id => genres.find(genre => genre.id === id)?.name)
      .filter(Boolean)
      .slice(0, 2);
  }, [initialData.movieGenres, initialData.tvGenres]);

  useEffect(() => {
  const loadImages = async () => {
    const imagePromises = thumbnails.map((thumb) => {
      return new Promise<void>((resolve, reject) => {
        const img = new (window.Image as new () => HTMLImageElement)();
        img.src = `https://image.tmdb.org/t/p/w500${thumb.poster_path}`;
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
      });
    });

    try {
      await Promise.all(imagePromises);
      setImagesLoaded(true);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  loadImages();
}, [thumbnails]);

  return (
    <div className="relative h-screen w-full">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}  // Enable loop to prevent blank frames
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        scrollbar={{ draggable: true }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
            <Image
                src={`https://image.tmdb.org/t/p/original${slide.backdrop_path}`}
                alt={slide.title}
                fill
                priority={index === 0}
                quality={85}
                sizes="100vw"
                className="object-cover"
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(1920, 1080))}`}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50" />
              <div className="absolute bottom-[20%] left-1/2 z-10 w-[90%] -translate-x-1/2 text-white sm:left-5 sm:-translate-x-0 sm:px-5">
                {slide.logo_path && (
                  <div className="mb-6">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${slide.logo_path}`}
                      alt={slide.title || "Movie logo"}
                      width={300}
                      height={100}
                      className="max-h-[100px] w-auto object-contain"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                )}
                <div className="mx-auto mb-2 flex items-center">
                  <span className="mr-3 flex items-center capitalize text-gray-300">
                    {slide.media_type}
                  </span>
                  <span className="mr-2 flex items-center gap-x-1 text-gray-300">
                    <Star className="h-4 w-4 fill-white text-white" /> {slide.vote_average.toFixed(1)}
                  </span>
                  <span className="ml-2 flex items-center gap-x-1 text-gray-300">
                    <Calendar className="h-4 w-4" />
                    {new Date(slide.release_date).getFullYear()}
                  </span>
                </div>
                <p className="line-clamp-3 max-w-2xl text-lg">{slide.overview}</p>
                <div className="mt-4">
                  <Link href={`/watch/${slide.media_type}/${slide.id}`} prefetch={false}>
                    <Button
                      variant="default"
                      size="lg"
                      className="mr-4 border border-white bg-white px-6 py-2 font-bold text-black transition-transform hover:scale-110 hover:bg-gray-200"
                    >
                      <Play className="fill-black pr-1" />
                      Play
                    </Button>
                  </Link>
                  <Link href={`/${slide.media_type}/${slide.id}`} prefetch={false}>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="border border-white bg-transparent px-6 py-2 font-bold text-white transition-transform hover:scale-110"
                    >
                      <Info className="pr-1" />
                      See More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute -bottom-20 left-0 right-0 px-4 lg:px-8">
      <Swiper
        modules={[Navigation, A11y, Autoplay]}
        spaceBetween={10}
        loop={true}  // Enable loop to prevent blank frames
        slidesPerView="auto"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 4 },
          1440: { slidesPerView: 5 },
        }}
        className="mx-auto h-full"
      >
        {thumbnails.map((thumb, index) => (
          <SwiperSlide
            key={thumb.id}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:max-w-[320px] lg:max-w-[267px] xl:max-w-[300px] md:mr-[10px]"
          >
            <Link href={`/${thumb.media_type}/${thumb.id}`} prefetch={false}>
              <div className="relative h-52 md:max-w-[320px] lg:max-w-[267px] xl:max-w-[300px] overflow-hidden rounded-xl sm:h-40 md:h-32 lg:h-32 xl:h-44">
                <img
                  src={`https://image.tmdb.org/t/p/w500${thumb.poster_path}`}
                  alt={thumb.title}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  className="object-cover w-full h-full transition-all duration-300 hover:scale-105"
                  style={{ filter: 'brightness(0.8)' }}
                />
                <div className="absolute inset-0 h-full w-full items-center justify-center rounded-2xl px-5 text-white transition duration-300 ease-in-out hover:text-red-500 hover:backdrop-blur-[2px]">
                  <div className="absolute inset-0 left-2 right-2 top-1/2 flex flex-col truncate font-semibold md:text-xl">
                    <span className="truncate">{thumb.title}</span>
                    <div className="flex gap-x-2 text-[10px] text-gray-400">
                      {getGenreNames(thumb.genre_ids, thumb.media_type)?.map((genre, idx) => (
                        <span key={idx} className="truncate">
                          {genre}
                        </span>
                      )) || "Unknown Genre"}

                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
    </div>
  );
});
