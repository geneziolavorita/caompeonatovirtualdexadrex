// Definição de tipos para chess.js
declare module 'chess.js' {
  export type Color = 'w' | 'b'
  export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
  export type Square = 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8' |
                     'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' |
                     'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' |
                     'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' |
                     'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' |
                     'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' |
                     'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' |
                     'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1'

  export interface Piece {
    type: PieceType
    color: Color
  }

  export interface Move {
    from: Square
    to: Square
    promotion?: PieceType
    piece?: PieceType
    color?: Color
    flags?: string
    san?: string
    captured?: PieceType
  }

  export interface MoveOptions {
    square?: Square
    verbose?: boolean
  }

  export class Chess {
    constructor(fen?: string)
    board(): (Piece | null)[][]
    load(fen: string): boolean
    fen(): string
    turn(): Color
    move(move: Move | string): Move | null
    undo(): Move | null
    moves(options?: MoveOptions): string[] | Move[]
    get(square: Square): Piece | null
    isCheck(): boolean
    isCheckmate(): boolean
    isDraw(): boolean
    isGameOver(): boolean
    history(): string[]
  }
}

// Definição global para JSX
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
} 