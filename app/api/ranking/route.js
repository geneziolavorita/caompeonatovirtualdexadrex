import { getTournamentRanking } from '../../../lib/models';
import { NextResponse } from 'next/server';

export function GET() {
  try {
    const ranking = getTournamentRanking();
    return NextResponse.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar ranking' },
      { status: 500 }
    );
  }
} 