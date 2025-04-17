import { Piece } from 'chess.js'

interface ChessPieceProps {
  piece: Piece
}

export default function ChessPiece({ piece }: ChessPieceProps) {
  const getPieceImage = () => {
    const color = piece.color === 'w' ? 'white' : 'black'
    let pieceName
    
    switch (piece.type) {
      case 'p': pieceName = 'pawn'; break
      case 'n': pieceName = 'knight'; break
      case 'b': pieceName = 'bishop'; break
      case 'r': pieceName = 'rook'; break
      case 'q': pieceName = 'queen'; break
      case 'k': pieceName = 'king'; break
      default: pieceName = 'unknown'
    }
    
    return `/pieces/${color}_${pieceName}.svg`
  }

  return (
    <div 
      className="chess-piece" 
      style={{ backgroundImage: `url(${getPieceImage()})` }}
    />
  )
} 