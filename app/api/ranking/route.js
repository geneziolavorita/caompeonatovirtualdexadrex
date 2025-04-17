import { getTournamentRanking } from '../../../lib/models';
import { NextResponse } from 'next/server';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ranking = getTournamentRanking();
    return NextResponse.json(ranking, { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar ranking', message: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 