"use client";

import { MovieTrailer } from "@/types/tmdbApi";
import React from "react";
import YouTube, { YouTubeProps } from "react-youtube";

export default function Example({
  trailerInfo,
  height,
}: {
  height: string;
  trailerInfo: MovieTrailer[];
}) {
  let source;
  let findTrailer = trailerInfo.filter((trailer) => trailer.type == "Trailer");
  if (findTrailer.length) source = findTrailer[0].key;
  else source = "";
  if (source == "" && trailerInfo[0]) source = trailerInfo[0].key;

  if (source == "") return <div></div>;

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  };

  const opts: YouTubeProps["opts"] = {
    className: "h-full w-full",
    height: height,
    width: "100%",
    // playerVars: {
    //   // https://developers.google.com/youtube/player_parameters
    //   autoplay: 1,
    // },
  };

  return (
    <div>
      <h1 className="pb-5 text-2xl font-bold">Trailer</h1>
      <YouTube videoId={source} opts={opts} />
    </div>
  );
}
