'use client';

import { Chess } from 'chess.js';
import { mockGames } from './mock-data';
import toast from 'react-hot-toast';

export interface GameResult {
  result: 'white' | 'black' | 'draw';
  whitePlayer: string;
  blackPlayer: string;
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
      result = game.turn() === 'w' ? 'black' : 'white';
    } else if (game.isDraw()) {
      result = 'draw';
    } else {
      toast.error('O jogo ainda não terminou');
      return false;
    }
    
    // Preparar dados para salvar
    const gameResult: GameResult = {
      result,
      whitePlayer,
      blackPlayer,
      whitePlayerName,
      blackPlayerName,
      pgn: game.fen(),
      moves: game.history(),
      startTime,
      endTime: new Date()
    };
    
    try {
      // Tentar salvar no servidor
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameResult),
      });
      
      if (response.ok) {
        toast.success('Resultado do jogo salvo com sucesso');
        return true;
      } else {
        throw new Error('Falha ao salvar o resultado do jogo');
      }
    } catch (err) {
      console.log('Erro ao se comunicar com o servidor, salvando localmente', err);
      toast('Servidor offline. Resultado salvo localmente', {
        icon: '⚠️'
      });
      
      // Modo offline - salvar no localStorage
      try {
        const localGames = JSON.parse(localStorage.getItem('localGames') || '[]');
        localGames.push({
          ...gameResult,
          _id: Date.now().toString()
        });
        localStorage.setItem('localGames', JSON.stringify(localGames));
        return true;
      } catch (error) {
        console.error('Erro ao salvar localmente:', error);
        toast.error('Falha ao salvar o resultado localmente');
        return false;
      }
    }
  } catch (error) {
    console.error('Erro ao salvar jogo:', error);
    toast.error('Erro ao salvar o resultado do jogo');
    return false;
  }
} 