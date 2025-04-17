import { createPlayer, getAllPlayers } from '../../../lib/models';
import { NextResponse } from 'next/server';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';

export function GET() {
  try {
    const players = getAllPlayers();
    return NextResponse.json(players);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar jogadores' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Nome do jogador é obrigatório' },
        { status: 400 }
      );
    }
    
    const player = createPlayer(data);
    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar jogador:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar jogador' },
      { status: 500 }
    );
  }
} 