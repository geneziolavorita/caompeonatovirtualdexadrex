import { Chess } from 'chess.js'

interface PlayerInfoProps {
  player1Name: string
  player2Name: string
  game: Chess
}

interface PieceCount {
  [key: string]: number;
}

interface PieceCounts {
  w: PieceCount;
  b: PieceCount;
}

export default function PlayerInfo({ player1Name, player2Name, game }: PlayerInfoProps) {
  const currentTurn = game.turn() === 'w' ? player1Name : player2Name
  
  // Obter peças capturadas
  const board = game.board()
  const pieces: PieceCounts = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 }
  }
  
  // Contar peças restantes no tabuleiro
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (piece) {
        pieces[piece.color][piece.type]--
      }
    }
  }
  
  // Calcular peças capturadas
  const capturedByWhite: string[] = []
  const capturedByBlack: string[] = []
  
  for (const [type, count] of Object.entries(pieces.b)) {
    for (let i = 0; i < count; i++) {
      capturedByWhite.push(type)
    }
  }
  
  for (const [type, count] of Object.entries(pieces.w)) {
    for (let i = 0; i < count; i++) {
      capturedByBlack.push(type)
    }
  }
  
  const renderCapturedPieces = (pieces: string[]) => {
    return pieces.map((type, i) => {
      let value = 0
      switch (type) {
        case 'p': value = 1; break
        case 'n': case 'b': value = 3; break
        case 'r': value = 5; break
        case 'q': value = 9; break
      }
      
      return (
        <span 
          key={i} 
          className="inline-block w-6 h-6 text-center"
          title={`${type === 'p' ? 'Peão' : 
                   type === 'n' ? 'Cavalo' : 
                   type === 'b' ? 'Bispo' : 
                   type === 'r' ? 'Torre' : 
                   type === 'q' ? 'Rainha' : 'Rei'}`}
        >
          {type === 'p' ? '♟' : 
           type === 'n' ? '♞' : 
           type === 'b' ? '♝' : 
           type === 'r' ? '♜' : 
           type === 'q' ? '♛' : '♚'}
        </span>
      )
    })
  }
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Informações do Jogo</h2>
      
      <div className="mb-4">
        <div className={`p-2 rounded ${game.turn() === 'w' ? 'bg-amber-100' : ''}`}>
          <div className="font-bold">{player1Name} (Brancas)</div>
          <div className="text-sm">Peças capturadas:</div>
          <div className="flex flex-wrap">{renderCapturedPieces(capturedByBlack)}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className={`p-2 rounded ${game.turn() === 'b' ? 'bg-amber-100' : ''}`}>
          <div className="font-bold">{player2Name} (Pretas)</div>
          <div className="text-sm">Peças capturadas:</div>
          <div className="flex flex-wrap">{renderCapturedPieces(capturedByWhite)}</div>
        </div>
      </div>
      
      <div className="p-2 bg-white rounded shadow">
        <div className="text-center font-bold">
          Turno de: {currentTurn}
        </div>
        <div className="text-center text-sm">
          {game.history().length > 0 
            ? `Último movimento: ${game.history()[game.history().length - 1]}`
            : 'Nenhum movimento ainda'}
        </div>
      </div>
    </div>
  )
} 