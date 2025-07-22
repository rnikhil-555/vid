import Image from "next/image";
import { Collection, CollectionPart } from "@/types/collection";
import ResultCard from "@/components/4k/ResultCard";

interface CollectionResponse extends Omit<Collection, 'parts'> {
  parts: Array<CollectionPart & {
    media_type?: 'movie';
    adult?: boolean;
    genre_ids?: number[];
    original_language?: string;
    original_title?: string;
    popularity?: number;
    video?: boolean;
    vote_count?: number;
  }>;
}

async function getCollection(id: string): Promise<CollectionResponse> {
  const res = await fetch(
    `https://api.themoviedb.org/3/collection/${id}?api_key=${process.env.TMDB_API_KEY}`,
    {
      headers: {
        'accept': 'application/json'
      },
      next: { revalidate: 86400 }
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch collection');
  }

  return res.json();
}

type Props = { id: string };

const CollectionPage = async ({ params }: { params: Promise<Props> }) => {
  const resolvedParams = await params;
  const collection = await getCollection(resolvedParams.id);

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <img
          src={`https://image.tmdb.org/t/p/original${collection.backdrop_path}`}
          alt={collection.name}
          className="object-cover opacity-10 top-0 left-0 w-full h-full min-h-screen min-w-screen fixed"
        />
      </div>

      <div className="container mx-auto mt-16 min-h-[80vh] w-full max-w-[1440px] pt-20 space-y-4 px-4 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-gray-200">{collection.name}</h1>
          <p className="mt-4 text-black dark:text-gray-400 max-w-3xl">{collection.overview}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {collection.parts.map((movie) => (
            <ResultCard
              key={movie.id}
              result={{
                ...movie,
                media_type: 'movie'
              }}
              isFromCollection
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;