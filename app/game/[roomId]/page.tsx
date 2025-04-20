// Página de servidor que gera parâmetros estáticos e carrega o componente cliente
import { Suspense } from 'react';
import LoadingScreen from './loading';
import ClientGameWrapper from './client';

// Esta função só pode ser usada em páginas de servidor
export async function generateStaticParams() {
  // Retorna alguns parâmetros padrão para permitir a exportação estática
  return [
    { roomId: 'default' },
    { roomId: 'lobby' }
  ];
}

// Página principal (componente servidor)
export default function GamePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ClientGameWrapper />
    </Suspense>
  );
}