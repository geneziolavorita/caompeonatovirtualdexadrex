import { Chess } from 'chess.js';

export interface GameResult {
  result: 'white' | 'black' | 'draw';
  whitePlayer: number;
  blackPlayer: number;
  whitePlayerName: string;
  blackPlayerName: string;
  pgn: string;
  moves: string[];
  startTime: Date;
  endTime: Date;
}

export async function saveGameResult(game: Chess, whitePlayer: string, blackPlayer: string, 
                                   whitePlayerName: string, blackPlayerName: string,
                                   startTime: Date): Promise<boolean> {
  try {
    // Determinar o resultado do jogo
    let result: 'white' | 'black' | 'draw';
    
    if (game.isCheckmate()) {
      // Se é checkmate, o jogador atual perdeu (porque ele está em checkmate)
      result = game.turn() === 'w' ? 'black' : 'white';
    } else if (game.isDraw()) {
      result = 'draw';
    } else {
      // Se o jogo não acabou, não deveria estar salvando
      console.error('Tentativa de salvar um jogo que não acabou');
      return false;
    }
    
    // Preparar dados para salvar
    const gameResult: GameResult = {
      result,
      whitePlayer: parseInt(whitePlayer),
      blackPlayer: parseInt(blackPlayer),
      whitePlayerName,
      blackPlayerName,
      pgn: game.toString(),
      moves: game.history(),
      startTime,
      endTime: new Date()
    };
    
    // Salvar no banco de dados
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameResult),
    });
    
    if (!response.ok) {
      throw new Error('Falha ao salvar o resultado do jogo');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar jogo:', error);
    return false;
  }
} 