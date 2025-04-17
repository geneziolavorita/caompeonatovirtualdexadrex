import { saveGame, getGameById, getPlayerGames } from '../../../lib/models';
import { NextResponse } from 'next/server';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';

// Tratamento de CORS para permitir requisições no ambiente de desenvolvimento
export async function OPTIONS() {
  return NextResponse.json({}, { 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    
    if (playerId) {
      const games = getPlayerGames(playerId);
      return NextResponse.json(games, { 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Se não houver parâmetros, retorna erro
    return NextResponse.json(
      { error: 'Parâmetros de busca necessários' },
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Erro ao buscar partidas:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar partidas', message: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.whitePlayer || !data.blackPlayer || !data.result) {
      return NextResponse.json(
        { error: 'Dados incompletos para salvar a partida' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const game = saveGame(data);
    return NextResponse.json(game, { 
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao salvar partida:', error);
    return NextResponse.json(
      { error: 'Falha ao salvar partida', message: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 