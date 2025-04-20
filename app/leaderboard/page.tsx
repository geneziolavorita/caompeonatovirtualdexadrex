// Página do servidor
import { Suspense } from 'react';
import LeaderboardClient from './client';
import LoadingScreen from './loading';

export async function generateStaticParams() {
  // Retorna parâmetros vazios para permitir a exportação estática
  return [];
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LeaderboardClient />
    </Suspense>
  );
} 