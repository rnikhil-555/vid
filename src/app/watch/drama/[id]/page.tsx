import DramaPlayer from "@/components/watch/drama-player";
import { ApiResponse } from "@/types/drama";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export const dynamic = "force-dynamic"

const fetchDramaInfo = async (id: string): Promise<ApiResponse | null> => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/drama/info?id=${id}`);
        const result: ApiResponse = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching drama info:', error);
        return null;
    }
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const id = params.id;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/drama/info?id=${id}`);
        const result: ApiResponse = await response.json();
        return {
            title: `Watch ${result.data.title}`,
            description: result.data.synopsis,
        };
    } catch (error) {
        console.error('Error fetching drama info:', error);
        return {
            title: `Watch Drama ${id}`
        }
    }
}

export default async function WatchPage(props: PageProps) {
    const params = await props.params;
    const dramaInfo = await fetchDramaInfo(params.id);

    if (!dramaInfo) {
        return (
            <div>
                <p className="p-4 text-center text-red-500 dark:text-red-400">
                    Error occurred, we're sorry
                </p>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen bg-gray-800 ">
            {/* Background Image */}
            <div className="absolute inset-0 blur-md">
                <img
                    src={`${dramaInfo.data.thumbnail}`}
                    className="object-cover object-center w-screen h-screen blur-sm"
                    alt={dramaInfo.data.title}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-black/60 dark:to-black"></div>
            </div>

            {/* Player */}
            <div className="relative z-10">
                <DramaPlayer dramaInfo={dramaInfo.data} id={params.id} />
            </div>

        </main>
    );
}
