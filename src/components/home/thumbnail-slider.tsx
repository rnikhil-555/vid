import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import Link from "next/link";
import { ThumbnailInfo } from "@/types/slider";

interface ThumbnailSliderProps {
    thumbnails: ThumbnailInfo[];
    getGenreNames: (genreIds: number[], mediaType: string) => string[];
}

export const ThumbnailSlider = ({ thumbnails, getGenreNames }: ThumbnailSliderProps) => {
    const [loadedImages, setLoadedImages] = useState(new Set<string>());
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadImages = async () => {
            const imagePromises = thumbnails.map((thumb) => {
                return new Promise<void>((resolve, reject) => {
                    const img = document.createElement('img');
                    img.src = `https://image.tmdb.org/t/p/w500${thumb.poster_path}`;
                    img.onload = () => {
                        setLoadedImages(prev => new Set([...prev, thumb.id]));
                        resolve();
                    };
                    img.onerror = reject;
                });
            });

            try {
                await Promise.all(imagePromises);

            } catch (error) {
                console.error("Error loading images:", error);
            }
            setLoading(false);
        };

        loadImages();
    }, [thumbnails]);

    return (
        <Swiper
            modules={[Navigation, A11y, Autoplay]}
            spaceBetween={10}
            slidesPerView="auto"
            autoplay={{
                delay: 2500,
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
            <SwiperSlide key={thumb.id} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:max-w-[320px] lg:max-w-[267px] xl:max-w-[300px] md:mr-[10px]">
              <Link href={`/${thumb.media_type}/${thumb.id}`} prefetch={false}>
                <div className="relative h-52 md:max-w-[320px] lg:max-w-[267px] xl:max-w-[300px] overflow-hidden rounded-xl sm:h-40 md:h-32 lg:h-32 xl:h-44">
                  {loading ? (
                    <div className="absolute inset-0 bg-gray-700 animate-pulse" />
                  ) : (
                    <>
                      <img
                        src={`https://image.tmdb.org/t/p/w500${thumb.poster_path}`}
                        alt={thumb.title}
                        loading={index < 4 ? 'eager' : 'lazy'}
                        className="object-cover w-full h-full transition-all duration-300 hover:scale-105"
                        style={{ filter: "brightness(0.8)" }}
                      />
                      <div className="absolute inset-0 h-full w-full items-center justify-center rounded-2xl px-5 text-white transition duration-300 ease-in-out hover:text-red-500 hover:backdrop-blur-[2px]">
                        <div className="absolute inset-0 left-2 right-2 top-1/2 flex flex-col truncate font-semibold md:text-xl">
                          <span className="truncate">{thumb.title}</span>
                          <div className="flex gap-x-2 text-[10px] text-gray-400">
                            {getGenreNames(thumb.genre_ids, thumb.media_type).map((genre, idx) => (
                              <span key={idx} className="truncate">
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
    );
};