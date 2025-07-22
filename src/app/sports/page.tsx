import { getLiveChannels, getPopularLiveSports, getSports } from '@/lib/api-calls/sports';
import Link from 'next/link';
import { BaseSlider } from '@/components/LiveMatchesSlider';
import { FaBasketball } from "react-icons/fa6";
import { IoFootball, IoAmericanFootball, IoGolfSharp } from "react-icons/io5";
import { PiHockeyFill } from "react-icons/pi";
import { IoIosBaseball } from "react-icons/io";
import { MdSportsMotorsports, MdOutlineSportsRugby } from "react-icons/md";
import { RiBoxingFill, RiBilliardsFill } from "react-icons/ri";
import { FaTableTennisPaddleBall } from "react-icons/fa6";
import { GiAmericanFootballBall } from "react-icons/gi";
import { TbTargetArrow } from "react-icons/tb";
import { BiSolidCricketBall } from "react-icons/bi";
import { MdOutlineExpandMore } from "react-icons/md";
import { JSX } from 'react';

const sportIcons: { [key: string]: JSX.Element } = {
  'basketball': <FaBasketball className="w-6 h-6" />,
  'football': <IoFootball className="w-6 h-6" />,
  'american-football': <IoAmericanFootball className="w-6 h-6" />,
  'hockey': <PiHockeyFill className="w-6 h-6" />,
  'baseball': <IoIosBaseball className="w-6 h-6" />,
  'motor-sports': <MdSportsMotorsports className="w-6 h-6" />,
  'fight': <RiBoxingFill className="w-6 h-6" />,
  'tennis': <FaTableTennisPaddleBall className="w-6 h-6" />,
  'rugby': <MdOutlineSportsRugby className="w-6 h-6" />,
  'golf': <IoGolfSharp className="w-6 h-6" />,
  'billiards': <RiBilliardsFill className="w-6 h-6" />,
  'afl': <GiAmericanFootballBall className="w-6 h-6" />,
  'darts': <TbTargetArrow className="w-6 h-6" />,
  'cricket': <BiSolidCricketBall className="w-6 h-6" />,
  'other': <MdOutlineExpandMore className="w-6 h-6" />,
};

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function SportsPage() {
  const sports = await getSports();
  const liveSports = await getPopularLiveSports();
  const liveChannels = await getLiveChannels();

  return (
    <div className="min-h-[90vh] mt-8">
      <div className="container mx-auto px-4 py-12 max-w-[1440px] space-y-4">
        <h1 className="text-xl md:text-2xl lg:text-4xl font-bold dark:text-white text-gray-900 mb-8 text-center">
          Premium Sports Selection
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sports?.map((sport) => (
            <Link
              key={sport.id}
              href={`/sport/${sport.id}`}
              className="group relative overflow-hidden rounded-xl 
                       dark:bg-white/5 bg-white/60 backdrop-blur-md p-4 sm:p-6
                       transform hover:scale-105 transition-all duration-300 ease-out 
                       dark:border-white/10 border-gray-200/50 border 
                       hover:shadow-lg hover:dark:border-white/20 hover:border-gray-300/60"
            >
              <div className="absolute inset-0 bg-gradient-to-r 
                            dark:from-blue-600/5 dark:to-purple-600/5 
                            from-blue-100/20 to-purple-100/20 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="dark:text-white text-gray-900 flex-shrink-0">
                    {sportIcons[sport.id]}
                  </span>
                  <div className="text-base sm:text-xl font-semibold dark:text-white text-gray-900 
                                group-hover:text-blue-600 dark:group-hover:text-blue-400 
                                transition-colors duration-300 truncate">
                    {sport.name}
                  </div>
                </div>
                <div className="mt-2 dark:text-gray-400 text-gray-600 text-sm hidden sm:block">
                  Click to explore →
                </div>
              </div>
            </Link>
          ))}
        </div>
        <BaseSlider matches={liveSports} title={"Popular Live"} isMatchLive={true} />
        <BaseSlider matches={liveChannels} title={"Live Channels"} isChannel={true} />
      </div>
    </div>
  );
}