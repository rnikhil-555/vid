"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import Card from "./card";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";

type CarouselProps = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  original_language: string;
};

export function CarouselComponent({ shows }: { shows: CarouselProps[] }) {
  const [slideWidth, setSlideWidth] = useState("28vw");

  const getSlideWidth = () => {
    const width = window.innerWidth;

    if (width >= 1400) return "12vw";
    if (width >= 1100) return "16vw";
    if (width >= 800) return "22vw";
    if (width >= 550) return "28vw";
    if (width >= 450) return "40vw";
    return "47vw";
  };

  useEffect(() => {
    setSlideWidth(getSlideWidth());

    const handleResize = () => {
      setSlideWidth(getSlideWidth());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="mx-auto w-full min-w-[350px] overflow-hidden px-2 md:px-0 lg:max-w-screen-xl xl:overflow-visible">
      <Swiper
        modules={[Navigation, A11y, FreeMode]}
        // spaceBetween={12}
        slidesPerView="auto"
        navigation={true}
        className=""
      >
        {shows?.map((show) => (
          <SwiperSlide key={show.id} className="!w-auto">
            <Card show={show} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
