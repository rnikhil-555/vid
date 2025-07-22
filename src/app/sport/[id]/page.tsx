import { SportsList } from '@/components/sports/SportsList';

export const revalidate = 3600;

type Props = { id: string };
export default async function SportPage({ params }: { params: Promise<Props> }) {
    const resolvedParams = await params;
    return <SportsList id={resolvedParams.id} />;
}