'use client';

import { Chess } from 'chess.js'
import CapturedPieces from './CapturedPieces'

interface PlayerInfoProps {
  player1Name: string
  player2Name: string
  game: Chess
}

export default function PlayerInfo({ player1Name, player2Name, game }: PlayerInfoProps) {
  const currentTurn = game.turn() === 'w' ? player1Name : player2Name
  
  // Verificar status do jogo
  let gameStatus = '';
  if (game.isCheckmate()) {
    gameStatus = `Xeque-mate! ${game.turn() === 'w' ? player2Name : player1Name} venceu!`;
  } else if (game.isDraw()) {
    // Simplificando a verificação de empate já que alguns métodos não estão disponíveis diretamente
    gameStatus = 'Empate!';
  } else if (game.isCheck()) {
    gameStatus = `Xeque ao rei ${game.turn() === 'w' ? 'branco' : 'preto'}!`;
  }
  
  return (
    <div className="info-panel bg-wood-lightest rounded-lg shadow-md p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4 text-wood-dark">Informações do Jogo</h2>
      
      <div className="mb-4">
        <div className={`p-3 rounded ${game.turn() === 'w' ? 'bg-amber-100 border-2 border-amber-300' : 'bg-white border border-gray-200'}`}>
          <div className="font-bold text-wood-dark mb-1">{player1Name} (Brancas)</div>
          <div className="text-sm text-gray-600">
            {game.turn() === 'w' && <span className="text-amber-600 font-medium">Aguardando jogada...</span>}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className={`p-3 rounded ${game.turn() === 'b' ? 'bg-amber-100 border-2 border-amber-300' : 'bg-white border border-gray-200'}`}>
          <div className="font-bold text-wood-dark mb-1">{player2Name} (Pretas)</div>
          <div className="text-sm text-gray-600">
            {game.turn() === 'b' && <span className="text-amber-600 font-medium">Aguardando jogada...</span>}
          </div>
        </div>
      </div>
      
      <CapturedPieces game={game} />
      
      <div className="p-3 bg-white rounded shadow border border-gray-200">
        <div className="text-center font-bold text-wood-dark">
          Turno de: {currentTurn}
        </div>
        <div className="text-center text-sm text-gray-600 mt-1">
          {game.history().length > 0 
            ? `Último movimento: ${game.history()[game.history().length - 1]}`
            : 'Nenhum movimento ainda'}
        </div>
        {gameStatus && (
          <div className="text-center font-bold mt-2 text-red-600">
            {gameStatus}
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-wood-dark mt-4">
        <div>Total de movimentos: {Math.floor(game.history().length / 2)}</div>
        <div>Jogadas desde o início: {game.history().length}</div>
      </div>
    </div>
  )
} 