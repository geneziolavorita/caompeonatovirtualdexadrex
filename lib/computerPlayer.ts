import { Chess, Piece, PieceType } from 'chess.js'

interface PieceValues {
  [key: string]: number;
}

// Função de avaliação simples para a posição do tabuleiro
function evaluateBoard(board: (Piece | null)[][], color: 'w' | 'b'): number {
  let evaluation = 0
  const pieceValues: PieceValues = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900
  }
  
  // Tabelas de posição simples para avaliação posicional
  const pawnTable = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ]
  
  const knightTable = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ]
  
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j]
      if (piece) {
        // Valor base da peça
        const value = pieceValues[piece.type]
        
        // Adicionar ou subtrair com base na cor da peça
        if (piece.color === color) {
          evaluation += value
          
          // Adicionar bônus posicional
          if (piece.type === 'p') {
            evaluation += pawnTable[piece.color === 'w' ? i : 7-i][j]
          } else if (piece.type === 'n') {
            evaluation += knightTable[piece.color === 'w' ? i : 7-i][j]
          }
        } else {
          evaluation -= value
          
          // Subtrair bônus posicional do oponente
          if (piece.type === 'p') {
            evaluation -= pawnTable[piece.color === 'w' ? i : 7-i][j]
          } else if (piece.type === 'n') {
            evaluation -= knightTable[piece.color === 'w' ? i : 7-i][j]
          }
        }
      }
    }
  }
  
  return evaluation
}

// Algoritmo minimax com poda alfa-beta
function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  // Caso base: se a profundidade é 0 ou jogo terminado
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game.board(), game.turn() === 'w' ? 'b' : 'w')
  }
  
  const moves = game.moves()
  
  // Jogador maximizador (computador)
  if (isMaximizing) {
    let maxEval = -Infinity
    
    for (const move of moves) {
      // Fazer movimento
      game.move(move)
      
      // Avaliar posição
      const evaluation = minimax(game, depth - 1, alpha, beta, false)
      
      // Desfazer movimento
      game.undo()
      
      // Atualizar melhor avaliação
      maxEval = Math.max(maxEval, evaluation)
      
      // Poda alfa-beta
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) {
        break
      }
    }
    
    return maxEval
  } 
  // Jogador minimizador (humano)
  else {
    let minEval = Infinity
    
    for (const move of moves) {
      // Fazer movimento
      game.move(move)
      
      // Avaliar posição
      const evaluation = minimax(game, depth - 1, alpha, beta, true)
      
      // Desfazer movimento
      game.undo()
      
      // Atualizar melhor avaliação
      minEval = Math.min(minEval, evaluation)
      
      // Poda alfa-beta
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) {
        break
      }
    }
    
    return minEval
  }
}

// Função para encontrar o melhor movimento para o computador
export function makeComputerMove(game: Chess): Chess {
  // Clonar o jogo para evitar modificar o original
  const gameCopy = new Chess(game.fen())
  
  // Obter todos os movimentos possíveis
  const moves = gameCopy.moves()
  
  // Se não houver movimentos, retornar o jogo inalterado
  if (moves.length === 0) {
    return gameCopy
  }
  
  let bestMove = null
  let bestEvaluation = -Infinity
  
  // Tentar cada movimento e encontrar o melhor
  for (const move of moves) {
    // Fazer movimento
    gameCopy.move(move)
    
    // Avaliar posição com minimax (profundidade 2 para desempenho razoável)
    const evaluation = minimax(gameCopy, 2, -Infinity, Infinity, false)
    
    // Desfazer movimento
    gameCopy.undo()
    
    // Atualizar melhor movimento se este for melhor
    if (evaluation > bestEvaluation) {
      bestEvaluation = evaluation
      bestMove = move
    }
  }
  
  // Fazer o melhor movimento
  if (bestMove) {
    gameCopy.move(bestMove)
  } else {
    // Fallback: fazer um movimento aleatório
    const randomIndex = Math.floor(Math.random() * moves.length)
    gameCopy.move(moves[randomIndex])
  }
  
  return gameCopy
} 