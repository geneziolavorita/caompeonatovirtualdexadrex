import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Player from '@/models/Player';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Obter ranking de jogadores
export async function GET() {
  try {
    console.log('API: Obtendo ranking de jogadores do MongoDB');
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Buscar todos os jogadores e ordenar por pontuação (decrescente)
    const players = await Player.find({})
      .sort({ pontuacao: -1, vitorias: -1, jogos: 1 })
      .select('id nome name email pontuacao jogos vitorias derrotas empates');
    
    // Adicionar posição no ranking
    const playersWithRanking = players.map((player, index) => ({
      ...player.toObject(),
      posicao: index + 1
    }));
    
    return NextResponse.json({
      success: true,
      data: playersWithRanking,
      count: playersWithRanking.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Erro interno ao obter ranking',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 