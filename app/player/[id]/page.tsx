import { Suspense } from 'react';
import PlayerDetailClient from './client';
import LoadingScreen from './loading';

export async function generateStaticParams() {
  // Return empty params to allow static export
  return [];
}

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PlayerDetailClient params={params} />
    </Suspense>
  );
} 