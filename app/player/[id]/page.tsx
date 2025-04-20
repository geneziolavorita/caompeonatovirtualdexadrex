import { Suspense } from 'react';
import PlayerDetailClient from './client';
import LoadingScreen from './loading';

// É necessário fornecer uma lista de parâmetros para exportação estática
export async function generateStaticParams() {
  // Retorne IDs específicos para pré-renderizar durante a build
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: 'default' }
  ];
}

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PlayerDetailClient params={params} />
    </Suspense>
  );
} 