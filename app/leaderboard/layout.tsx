// Esta função é importante para a exportação estática
export async function generateStaticParams() {
  // A página de leaderboard não tem parâmetros dinâmicos,
  // mas ainda precisamos da função para pré-renderização
  return [{}];
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 