import { mockPlayers } from '@/lib/mock-data';

// Esta função é importante para a exportação estática
// Ela informa ao Next.js quais páginas de jogadores devem ser pré-renderizadas
export async function generateStaticParams() {
  // Combinar jogadores do banco com jogadores mockados
  // Isso garante que os jogadores mock também serão pré-renderizados
  const dbPlayerIds = ['6506a9d46c29dd9a40f2ee01', '6506a9d46c29dd9a40f2ee02', '6506a9d46c29dd9a40f2ee03',
    '6506a9d46c29dd9a40f2ee04', '6506a9d46c29dd9a40f2ee05', '6506a9d46c29dd9a40f2ee06', 
    '6506a9d46c29dd9a40f2ee07', '6506a9d46c29dd9a40f2ee08'];
  
  const mockPlayerIds = mockPlayers.map(player => player._id);
  
  // Combinar os dois arrays de IDs sem usar Set para evitar problemas de compatibilidade
  const allPlayerIds = [...dbPlayerIds];
  
  // Adicionar apenas IDs mockados que não estão nos IDs do banco
  mockPlayerIds.forEach(id => {
    if (!allPlayerIds.includes(id)) {
      allPlayerIds.push(id);
    }
  });
  
  // Retornar os parâmetros para todas as páginas que devem ser pré-renderizadas
  return allPlayerIds.map(id => ({
    id: id
  }));
}

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 