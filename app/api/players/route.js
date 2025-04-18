import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Player from '@/models/Player';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Listar todos os jogadores
export async function GET() {
  try {
    console.log('API: Obtendo lista de jogadores do MongoDB');
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Buscar todos os jogadores
    const players = await Player.find({}).sort({ pontuacao: -1 });
    
    return NextResponse.json({
      success: true,
      data: players,
      count: players.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter jogadores:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Erro interno ao buscar jogadores',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST - Criar um novo jogador
export async function POST(request) {
  try {
    console.log('API: Criando novo jogador no MongoDB');
    
    // Obter dados do request
    let data;
    try {
      data = await request.json();
      console.log('Dados recebidos do frontend:', data);
    } catch (parseError) {
      console.error('Erro ao fazer parse dos dados da requisição:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Dados inválidos no corpo da requisição',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Validar dados mínimos
    if (!data.nome) {
      return NextResponse.json({
        success: false,
        message: 'Nome do jogador é obrigatório',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Verificar se o jogador já existe
    const playerExists = await Player.findOne({
      $or: [
        { nome: { $regex: new RegExp(`^${data.nome}$`, 'i') } },
        { name: { $regex: new RegExp(`^${data.nome}$`, 'i') } }
      ]
    });
    
    if (playerExists) {
      return NextResponse.json({
        success: false,
        message: `Jogador com nome '${data.nome}' já existe`,
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }
    
    // Criar novo jogador
    const newPlayer = new Player({
      nome: data.nome,
      name: data.nome, // Para compatibilidade
      email: data.email || undefined,
      pontuacao: 0,
      jogos: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0
    });
    
    // Salvar no banco de dados
    await newPlayer.save();
    
    return NextResponse.json({
      success: true,
      message: 'Jogador criado com sucesso',
      data: newPlayer,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar jogador:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Erro interno ao criar jogador',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PUT - Atualizar um jogador
export async function PUT(request) {
  try {
    console.log('API: Atualizando jogador no MongoDB');
    
    // Obter dados do request
    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: 'Dados inválidos no corpo da requisição',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Validar ID do jogador
    if (!data.id) {
      return NextResponse.json({
        success: false,
        message: 'ID do jogador é obrigatório',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Encontrar o jogador
    const player = await Player.findById(data.id);
    
    if (!player) {
      return NextResponse.json({
        success: false,
        message: `Jogador com ID ${data.id} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    // Se estiver tentando atualizar o nome, verificar se já existe
    if (data.nome && data.nome !== player.nome) {
      const nameExists = await Player.findOne({
        _id: { $ne: data.id },
        $or: [
          { nome: { $regex: new RegExp(`^${data.nome}$`, 'i') } },
          { name: { $regex: new RegExp(`^${data.nome}$`, 'i') } }
        ]
      });
      
      if (nameExists) {
        return NextResponse.json({
          success: false,
          message: `Jogador com nome '${data.nome}' já existe`,
          timestamp: new Date().toISOString()
        }, { status: 409 });
      }
    }
    
    // Atualizar campos
    if (data.nome) {
      player.nome = data.nome;
      player.name = data.nome; // Para compatibilidade
    }
    
    if (data.email !== undefined) {
      player.email = data.email;
    }
    
    // Atualizar estatísticas se fornecidas
    if (data.pontuacao !== undefined) player.pontuacao = data.pontuacao;
    if (data.jogos !== undefined) player.jogos = data.jogos;
    if (data.vitorias !== undefined) player.vitorias = data.vitorias;
    if (data.derrotas !== undefined) player.derrotas = data.derrotas;
    if (data.empates !== undefined) player.empates = data.empates;
    
    // Salvar alterações
    await player.save();
    
    return NextResponse.json({
      success: true,
      message: 'Jogador atualizado com sucesso',
      data: player,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Erro interno ao atualizar jogador',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// DELETE - Remover um jogador
export async function DELETE(request) {
  try {
    console.log('API: Removendo jogador do MongoDB');
    
    // Obter URL da requisição
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do jogador é obrigatório',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Encontrar e remover o jogador
    const deletedPlayer = await Player.findByIdAndDelete(id);
    
    if (!deletedPlayer) {
      return NextResponse.json({
        success: false,
        message: `Jogador com ID ${id} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Jogador removido com sucesso',
      data: deletedPlayer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao remover jogador:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Erro interno ao remover jogador',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 