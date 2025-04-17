interface GameControlsProps {
  resetGame: () => void
  showRules: boolean
  setShowRules: (show: boolean) => void
}

export default function GameControls({ 
  resetGame, 
  showRules, 
  setShowRules 
}: GameControlsProps) {
  // Função para reiniciar apenas o jogo atual sem voltar para a tela de configuração
  const restartCurrentGame = () => {
    if (confirm('Tem certeza que deseja reiniciar a partida atual?')) {
      const event = new CustomEvent('restart-current-game');
      window.dispatchEvent(event);
    }
  };

  // Função para confirmar antes de resetar o jogo completamente
  const handleResetGame = () => {
    if (confirm('Tem certeza que deseja sair da partida atual e voltar para a tela inicial?')) {
      resetGame();
    }
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-4">
        <button onClick={handleResetGame} className="button flex-1">
          Novo Jogo
        </button>
        <button 
          onClick={restartCurrentGame} 
          className="button flex-1 bg-wood-dark"
        >
          Reiniciar Partida
        </button>
      </div>
      
      <button 
        onClick={() => setShowRules(!showRules)} 
        className="button w-full mb-4"
      >
        {showRules ? 'Esconder Regras' : 'Ver Regras'}
      </button>
      
      {showRules && (
        <div className="bg-white p-4 rounded-lg shadow mt-4">
          <h3 className="font-bold mb-2">Regras Básicas do Xadrez</h3>
          <ul className="text-sm space-y-2">
            <li><strong>Objetivo:</strong> Dar xeque-mate ao rei adversário.</li>
            <li><strong>Peões:</strong> Movem-se uma casa para frente (ou duas no primeiro movimento) e capturam na diagonal.</li>
            <li><strong>Torres:</strong> Movem-se em linha reta, horizontal ou vertical.</li>
            <li><strong>Cavalos:</strong> Movem-se em "L" (2 casas em uma direção e 1 em outra).</li>
            <li><strong>Bispos:</strong> Movem-se na diagonal.</li>
            <li><strong>Rainha:</strong> Combina os movimentos da torre e do bispo.</li>
            <li><strong>Rei:</strong> Move-se uma casa em qualquer direção.</li>
            <li><strong>Xeque:</strong> Quando o rei está ameaçado.</li>
            <li><strong>Xeque-mate:</strong> Quando o rei está em xeque e não há como escapar.</li>
          </ul>
        </div>
      )}
    </div>
  )
} 