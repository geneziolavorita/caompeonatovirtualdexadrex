'use client'

import { useState, useEffect } from 'react'
import ChessPiece from './ChessPiece'
import { Chess, Square, Move } from 'chess.js'
import { makeComputerMove } from '@/lib/computerPlayer'

interface ChessboardProps {
  game: Chess
  setGame: (game: Chess) => void
  gameMode: 'player' | 'computer'
}

export default function Chessboard({ game, setGame, gameMode }: ChessboardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([])
  const [lastMove, setLastMove] = useState<{from: Square, to: Square} | null>(null)
  const [kingInCheck, setKingInCheck] = useState<Square | null>(null)

  // Verificar xeque e atualizar o estado do rei em xeque
  useEffect(() => {
    if (game.isCheck()) {
      // Encontrar a posição do rei em xeque
      const board = game.board();
      const turn = game.turn();
      let kingPosition: Square | null = null;
      
      // Procurar o rei da cor atual no tabuleiro
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const piece = board[rank][file];
          if (piece && piece.type === 'k' && piece.color === turn) {
            const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
            kingPosition = `${files[file]}${ranks[rank]}` as Square;
            break;
          }
        }
        if (kingPosition) break;
      }
      
      setKingInCheck(kingPosition);
    } else {
      setKingInCheck(null);
    }
  }, [game]);

  // Fazer o movimento do computador quando for a vez dele
  useEffect(() => {
    if (gameMode === 'computer' && game.turn() === 'b' && !game.isGameOver()) {
      // Adicionar um pequeno atraso para o movimento do computador parecer mais natural
      const timeoutId = setTimeout(() => {
        const newGame = makeComputerMove(game);
        
        // Como não podemos acessar o último movimento diretamente,
        // vamos apenas definir o último movimento com base no estado atual do tabuleiro
        // em uma implementação real, você poderia rastrear o histórico completo de movimentos
        
        setGame(new Chess(newGame.fen()));
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [game, setGame, gameMode]);

  const handleSquareClick = (square: Square) => {
    // Se nenhuma casa estiver selecionada, selecione esta casa se tiver uma peça
    if (!selectedSquare) {
      const piece = game.get(square)
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square)
        // Encontrar movimentos possíveis para esta peça
        const moves = game.moves({ square, verbose: true }) as Move[]
        setPossibleMoves(moves.map(move => move.to as Square))
      }
    } 
    // Se uma casa já estiver selecionada
    else {
      // Se clicar na mesma casa, desmarque-a
      if (square === selectedSquare) {
        setSelectedSquare(null)
        setPossibleMoves([])
      } 
      // Tentar fazer um movimento
      else {
        try {
          // Clone o jogo para fazer o movimento
          const gameCopy = new Chess(game.fen())
          gameCopy.move({
            from: selectedSquare,
            to: square,
            promotion: 'q' // Auto-promover para rainha para simplificar
          })
          
          // Registrar o último movimento
          setLastMove({
            from: selectedSquare,
            to: square
          });
          
          // Se o movimento for válido, atualize o jogo
          setGame(gameCopy)
          
          // Resetar seleção
          setSelectedSquare(null)
          setPossibleMoves([])
        } catch (e) {
          // Se for um movimento inválido, mas a casa clicada tem uma peça própria, selecione-a
          const piece = game.get(square)
          if (piece && piece.color === game.turn()) {
            setSelectedSquare(square)
            const moves = game.moves({ square, verbose: true }) as Move[]
            setPossibleMoves(moves.map(move => move.to as Square))
          }
        }
      }
    }
  }

  const renderSquare = (square: Square, i: number) => {
    const file = square.charCodeAt(0) - 97 // 'a' é 97 em ASCII
    const rank = 8 - parseInt(square[1])
    const isLight = (file + rank) % 2 === 1
    const isSelected = square === selectedSquare
    const isPossibleMove = possibleMoves.includes(square)
    const isLastMoveFrom = lastMove?.from === square
    const isLastMoveTo = lastMove?.to === square
    const isKingInCheck = kingInCheck === square
    
    let className = `square ${isLight ? 'light' : 'dark'}`
    if (isSelected || isPossibleMove) {
      className += ' highlight'
    }
    if (isLastMoveFrom || isLastMoveTo) {
      className += ' last-move'
    }
    if (isKingInCheck) {
      className += ' check'
    }

    const piece = game.get(square)
    
    return (
      <div 
        key={i} 
        className={className}
        onClick={() => handleSquareClick(square)}
      >
        {piece && (
          <ChessPiece piece={piece} />
        )}
        {isPossibleMove && !piece && (
          <div className="w-3 h-3 rounded-full bg-black opacity-20"></div>
        )}
        
        {/* Mostrar coordenadas nas casas dos cantos */}
        {file === 0 && rank === 7 && (
          <span className="coordinate file-coordinate">{square[0]}</span>
        )}
        {file === 7 && rank === 7 && (
          <span className="coordinate rank-coordinate">{square[1]}</span>
        )}
      </div>
    )
  }

  // Criar as casas do tabuleiro
  const squares: JSX.Element[] = []
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  // Criar todas as 64 casas
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = `${files[file]}${ranks[rank]}` as Square
      squares.push(renderSquare(square, rank * 8 + file))
    }
  }

  // Obter o status do jogo
  let status = ''
  if (game.isCheckmate()) {
    status = `Xeque-mate! ${game.turn() === 'w' ? 'Pretas' : 'Brancas'} venceram!`
  } else if (game.isDraw()) {
    status = 'Empate!'
  } else if (game.isCheck()) {
    status = `Xeque ao rei ${game.turn() === 'w' ? 'branco' : 'preto'}!`
  }

  return (
    <div>
      {/* Coordenadas superiores */}
      <div className="flex justify-between px-8 mb-1">
        {files.map(file => (
          <div key={file} className="w-8 text-center font-bold text-wood-dark">
            {file.toUpperCase()}
          </div>
        ))}
      </div>
      
      <div className="flex">
        {/* Coordenadas laterais esquerda */}
        <div className="flex flex-col justify-between py-3 mr-1">
          {ranks.map(rank => (
            <div key={rank} className="h-8 flex items-center font-bold text-wood-dark">
              {rank}
            </div>
          ))}
        </div>
        
        {/* Tabuleiro */}
        <div className="chess-board">
          {squares}
        </div>
        
        {/* Coordenadas laterais direita */}
        <div className="flex flex-col justify-between py-3 ml-1">
          {ranks.map(rank => (
            <div key={rank} className="h-8 flex items-center font-bold text-wood-dark">
              {rank}
            </div>
          ))}
        </div>
      </div>
      
      {/* Coordenadas inferiores */}
      <div className="flex justify-between px-8 mt-1">
        {files.map(file => (
          <div key={file} className="w-8 text-center font-bold text-wood-dark">
            {file.toUpperCase()}
          </div>
        ))}
      </div>
      
      {status && (
        <div className="mt-4 p-3 text-center font-bold bg-white rounded-lg shadow">
          {status}
        </div>
      )}
    </div>
  )
} 