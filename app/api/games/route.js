import { saveGame, getGameById, getPlayerGames } from '../../../lib/models';
import { NextResponse } from 'next/server';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';

export function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    
    if (playerId) {
      const games = getPlayerGames(playerId);
      return NextResponse.json(games);
    }
    
    // Se não houver parâmetros, retorna erro
    return NextResponse.json(
      { error: 'Parâmetros de busca necessários' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao buscar partidas:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar partidas' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.whitePlayer || !data.blackPlayer || !data.result) {
      return NextResponse.json(
        { error: 'Dados incompletos para salvar a partida' },
        { status: 400 }
      );
    }
    
    const game = saveGame(data);
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar partida:', error);
    return NextResponse.json(
      { error: 'Falha ao salvar partida' },
      { status: 500 }
    );
  }
} 