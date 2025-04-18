import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';
import Player from '@/models/Player';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Função para atualizar as estatísticas de um jogador após um jogo
async function updatePlayerStats(playerId, resultado) {
  try {
    await dbConnect();
    
    const player = await Player.findById(playerId);
    
    if (!player) {
      console.warn(`Jogador com ID ${playerId} não encontrado`);
      return false;
    }
    
    // Atualizar estatísticas
    player.jogos = (player.jogos || 0) + 1;
    
    if (resultado === 'vitoria') {
      player.vitorias = (player.vitorias || 0) + 1;
      player.pontuacao = (player.pontuacao || 0) + 3; // 3 pontos por vitória
    } else if (resultado === 'derrota') {
      player.derrotas = (player.derrotas || 0) + 1;
      // Não adiciona pontos por derrota
    } else if (resultado === 'empate') {
      player.empates = (player.empates || 0) + 1;
      player.pontuacao = (player.pontuacao || 0) + 1; // 1 ponto por empate
    }
    
    await player.save();
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do jogador:', error);
    return false;
  }
}

// GET - Obter todos os jogos ou um jogo específico
export async function GET(request) {
  try {
    console.log('API: Obtendo jogos do MongoDB');
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Se um ID for fornecido, retornar apenas o jogo específico
    if (id) {
      const game = await Game.findById(id);
      
      if (!game) {
        return NextResponse.json({
          success: false,
          message: `Jogo com ID ${id} não encontrado`,
          timestamp: new Date().toISOString()
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: game,
        timestamp: new Date().toISOString()
      });
    }
    
    // Caso contrário, retornar todos os jogos
    const games = await Game.find({}).sort({ criado_em: -1 });
    
    return NextResponse.json({
      success: true,
      data: games,
      count: games.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter jogos:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST - Criar um novo jogo
export async function POST(request) {
  try {
    console.log('API: Criando novo jogo no MongoDB');
    
    let data;
    try {
      data = await request.json();
    } catch (jsonError) {
      return NextResponse.json({
        success: false,
        message: 'Dados de requisição inválidos',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Verificar campos obrigatórios
    if (!data.brancasId || !data.pretasId) {
      return NextResponse.json({
        success: false,
        message: 'Os IDs dos jogadores das peças brancas e pretas são obrigatórios',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Verificar se os IDs são iguais
    if (data.brancasId === data.pretasId) {
      return NextResponse.json({
        success: false,
        message: 'Os jogadores das peças brancas e pretas devem ser diferentes',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Verificar se os jogadores existem
    const brancasPlayer = await Player.findById(data.brancasId);
    const pretasPlayer = await Player.findById(data.pretasId);
    
    if (!brancasPlayer) {
      return NextResponse.json({
        success: false,
        message: `Jogador com ID ${data.brancasId} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    if (!pretasPlayer) {
      return NextResponse.json({
        success: false,
        message: `Jogador com ID ${data.pretasId} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    // Criar novo jogo
    const newGame = new Game({
      brancasId: data.brancasId,
      brancasNome: brancasPlayer.nome || brancasPlayer.name,
      pretasId: data.pretasId,
      pretasNome: pretasPlayer.nome || pretasPlayer.name,
      data_inicio: new Date(),
      data_fim: null,
      resultado: 'em_andamento',
      movimentos: [],
      notacao: ''
    });
    
    // Salvar no banco de dados
    await newGame.save();
    
    return NextResponse.json({
      success: true,
      data: newGame,
      message: 'Jogo criado com sucesso',
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar jogo:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PUT - Atualizar um jogo existente
export async function PUT(request) {
  try {
    console.log('API: Atualizando jogo no MongoDB');
    
    let data;
    try {
      data = await request.json();
    } catch (jsonError) {
      return NextResponse.json({
        success: false,
        message: 'Dados de requisição inválidos',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    if (!data.id) {
      return NextResponse.json({
        success: false,
        message: 'ID do jogo é obrigatório',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Buscar o jogo
    const game = await Game.findById(data.id);
    
    if (!game) {
      return NextResponse.json({
        success: false,
        message: `Jogo com ID ${data.id} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    // Atualizar os campos permitidos
    if (data.movimentos !== undefined) game.movimentos = data.movimentos;
    if (data.notacao !== undefined) game.notacao = data.notacao;
    
    const oldResultado = game.resultado;
    
    if (data.resultado !== undefined) {
      game.resultado = data.resultado;
    }
    
    // Se o jogo está sendo finalizado, atualizar a data de término
    if (oldResultado === 'em_andamento' && 
        ['vitoria_brancas', 'vitoria_pretas', 'empate'].includes(data.resultado)) {
      game.data_fim = new Date();
      
      // Atualizar estatísticas dos jogadores
      if (data.resultado === 'vitoria_brancas') {
        await updatePlayerStats(game.brancasId, 'vitoria');
        await updatePlayerStats(game.pretasId, 'derrota');
      } else if (data.resultado === 'vitoria_pretas') {
        await updatePlayerStats(game.brancasId, 'derrota');
        await updatePlayerStats(game.pretasId, 'vitoria');
      } else if (data.resultado === 'empate') {
        await updatePlayerStats(game.brancasId, 'empate');
        await updatePlayerStats(game.pretasId, 'empate');
      }
    }
    
    // Salvar as alterações
    await game.save();
    
    return NextResponse.json({
      success: true,
      data: game,
      message: 'Jogo atualizado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// DELETE - Excluir um jogo
export async function DELETE(request) {
  try {
    console.log('API: Excluindo jogo do MongoDB');
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do jogo é obrigatório',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Buscar e excluir o jogo
    const deletedGame = await Game.findByIdAndDelete(id);
    
    if (!deletedGame) {
      return NextResponse.json({
        success: false,
        message: `Jogo com ID ${id} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Jogo excluído com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao excluir jogo:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 