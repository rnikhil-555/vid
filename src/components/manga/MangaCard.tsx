import Link from 'next/link';

interface MangaCardProps {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
}

export default function MangaCard({ id, name, imageUrl, type }: MangaCardProps) {
  return (
        <Link href={`${id}`}>
      <div className="relative overflow-hidden rounded-md hover:text-white">
        <div className="relative rounded-sm">
        
          <img
            className="object-cover"
            src={imageUrl || "/placeholder.png"}
            alt={name}
            style={{ width: "100%", height: "100%" }}
          />
          <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center rounded-sm bg-gray-900 bg-opacity-60 opacity-0 transition-opacity hover:opacity-100 hover:backdrop-blur-[2px]">
            <img src="/icon-play.png" alt="play" width={25} height={25} />
            <div className="absolute bottom-2 px-1 text-center text-sm font-semibold leading-snug sm:text-base">
              <h3 className="mb-2 line-clamp-2 text-xs font-semibold">
                {name}
              </h3>
              <p className="-mt-2 text-[10px] text-gray-400">
                {type}
              </p>
            </div>
          </div>
          <div className="absolute top-2 rounded-r bg-yellow-500 px-0.5 text-xs font-semibold text-white">
            {type}
          </div>
        </div>
      </div>
    </Link>
  );
}
