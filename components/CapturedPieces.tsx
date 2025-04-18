'use client'

import { Chess } from 'chess.js'
import ChessPiece from './ChessPiece'

interface CapturedPiecesProps {
  game: Chess
}

// Definir o tipo de símbolo de peça
type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'

// Função auxiliar para obter o valor das peças
const getPieceValue = (piece: PieceSymbol): number => {
  const values: Record<PieceSymbol, number> = {
    p: 1,   // peão
    n: 3,   // cavalo
    b: 3,   // bispo
    r: 5,   // torre
    q: 9,   // rainha
    k: 0    // rei (não deveria ser capturado)
  }
  return values[piece]
}

export default function CapturedPieces({ game }: CapturedPiecesProps) {
  // Todas as peças que deveriam estar no tabuleiro para cada cor
  const allPieces: Record<'w' | 'b', PieceSymbol[]> = {
    w: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q', 'k'],
    b: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q', 'k']
  }
  
  // Peças que ainda estão no tabuleiro
  const board = game.board()
  const piecesOnBoard: Record<'w' | 'b', PieceSymbol[]> = {
    w: [],
    b: []
  }
  
  // Contagem de peças no tabuleiro
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (piece) {
        piecesOnBoard[piece.color].push(piece.type as PieceSymbol)
      }
    }
  }
  
  // Calcular peças capturadas
  const capturedPieces: Record<'w' | 'b', PieceSymbol[]> = {
    w: [],
    b: []
  }
  
  // Para cada cor, encontrar as peças que estão faltando
  for (const color of ['w', 'b'] as const) {
    // Contagem de peças para esta cor
    const pieceCounts: Record<PieceSymbol, number> = {
      p: 0, n: 0, b: 0, r: 0, q: 0, k: 0
    }
    
    // Contar peças no tabuleiro
    piecesOnBoard[color].forEach(piece => {
      pieceCounts[piece]++
    })
    
    // Contar peças que deveriam estar
    const expectedCounts: Record<PieceSymbol, number> = {
      p: 8, n: 2, b: 2, r: 2, q: 1, k: 1
    }
    
    // Adicionar peças capturadas
    for (const piece of ['p', 'n', 'b', 'r', 'q'] as PieceSymbol[]) {
      const missing = expectedCounts[piece] - pieceCounts[piece]
      for (let i = 0; i < missing; i++) {
        capturedPieces[color === 'w' ? 'b' : 'w'].push(piece)
      }
    }
  }
  
  // Ordenar por valor
  capturedPieces.w.sort((a, b) => getPieceValue(b) - getPieceValue(a))
  capturedPieces.b.sort((a, b) => getPieceValue(b) - getPieceValue(a))
  
  // Calcular vantagem material
  const whiteMaterial = piecesOnBoard.w.reduce((sum, piece) => sum + getPieceValue(piece), 0)
  const blackMaterial = piecesOnBoard.b.reduce((sum, piece) => sum + getPieceValue(piece), 0)
  const advantage = whiteMaterial - blackMaterial
  
  return (
    <div className="captured-pieces p-3 bg-wood-lightest rounded-md shadow-md">
      <h3 className="text-sm font-bold mb-2 text-wood-dark">Peças Capturadas</h3>
      
      <div className="mb-3">
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 bg-white rounded-full border border-gray-300 mr-2"></div>
          <span className="text-xs font-medium text-wood-dark">Brancas</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {capturedPieces.w.map((piece, index) => (
            <div key={`white-${piece}-${index}`} className="h-6 w-6">
              <ChessPiece piece={{ type: piece, color: 'w' }} />
            </div>
          ))}
          {capturedPieces.w.length === 0 && (
            <span className="text-xs text-gray-500 italic">Nenhuma</span>
          )}
        </div>
      </div>
      
      <div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 bg-gray-800 rounded-full mr-2"></div>
          <span className="text-xs font-medium text-wood-dark">Pretas</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {capturedPieces.b.map((piece, index) => (
            <div key={`black-${piece}-${index}`} className="h-6 w-6">
              <ChessPiece piece={{ type: piece, color: 'b' }} />
            </div>
          ))}
          {capturedPieces.b.length === 0 && (
            <span className="text-xs text-gray-500 italic">Nenhuma</span>
          )}
        </div>
      </div>
      
      {advantage !== 0 && (
        <div className="mt-3 text-center">
          <p className="text-xs font-semibold">
            Vantagem Material: 
            <span className={`${advantage > 0 ? 'text-green-600' : 'text-red-600'} ml-1`}>
              {advantage > 0 ? '+' : ''}{advantage}
            </span>
          </p>
        </div>
      )}
    </div>
  )
} 