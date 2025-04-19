import { connectToDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

// Cache para armazenar jogadores
let cachedPlayers = null;
let lastCacheTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minuto

// Função para validar dados do jogador
function validarDadosJogador(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, erro: 'Dados inválidos' };
  }

  if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim() === '') {
    return { valido: false, erro: 'Nome do jogador é obrigatório' };
  }

  if (dados.email && typeof dados.email !== 'string') {
    return { valido: false, erro: 'Email inválido' };
  }

  return { valido: true };
}

// Função para verificar se o jogador já existe
async function jogadorExiste(nome, db) {
  try {
    // Primeiro verifica no MongoDB se disponível
    if (db) {
      const existingPlayer = await db.collection('players').findOne({ 
        nome: { $regex: new RegExp(`^${nome}$`, 'i') } 
      });
      
      if (existingPlayer) {
        return true;
      }
    }
    
    // No servidor, não podemos acessar localStorage
    if (typeof window === 'undefined') {
      return false;
    }
    
    // No cliente, verificamos no localStorage
    try {
      const localPlayers = localStorage.getItem('localPlayers');
      if (localPlayers) {
        const players = JSON.parse(localPlayers);
        if (players.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
          return true;
        }
      }
    } catch (e) {
      console.error('Erro ao verificar jogadores locais:', e);
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar duplicata de jogador:', error);
    return false; // Em caso de erro, assume que não existe para permitir tentar cadastrar
  }
}

// Função para carregar jogadores (não exportada como rota)
async function carregarJogadores(forceRefresh = false) {
  const now = Date.now();
  
  // Se o cache ainda é válido e não foi solicitado refresh, retorna o cache
  if (cachedPlayers && !forceRefresh && now - lastCacheTime < CACHE_DURATION) {
    return cachedPlayers;
  }
  
  let jogadores = [];
  let dbConnection = null;

  try {
    // Tenta conectar ao MongoDB primeiro
    const { db } = await connectToDB();
    dbConnection = db;
    
    if (db) {
      const playersCollection = db.collection('players');
      const players = await playersCollection.find({}).toArray();
      
      if (players && players.length > 0) {
        jogadores = players.map(player => ({
          id: player._id.toString(),
          _id: player._id.toString(),
          nome: player.nome,
          name: player.nome, // Para compatibilidade
          email: player.email,
          pontuacao: player.pontuacao || 0,
          jogos: player.jogos || 0,
          vitorias: player.vitorias || 0,
          derrotas: player.derrotas || 0,
          empates: player.empates || 0,
          dataCriacao: player.dataCriacao || new Date().toISOString()
        }));
      }
    }
  } catch (error) {
    console.error('Erro ao buscar jogadores do MongoDB:', error);
    // Se falhar, continua e tenta usar dados mockados
  }
  
  // Atualiza o cache
  cachedPlayers = jogadores;
  lastCacheTime = now;
  
  return jogadores;
}

// GET - Obter lista de jogadores
export async function GET(request) {
  try {
    // Parâmetros de URL (opcionais)
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const skipCache = url.searchParams.get('skipCache') === 'true';
    
    // Carregar jogadores (do DB ou cache)
    const jogadores = await carregarJogadores(skipCache);
    
    return NextResponse.json({
      jogadores: jogadores.slice(0, limit),
      total: jogadores.length,
      origem: jogadores.length > 0 ? 'mongodb' : 'cache',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return NextResponse.json({ 
      erro: 'Erro ao buscar jogadores', 
      detalhes: error.message 
    }, { status: 500 });
  }
}

// POST - Cadastrar novo jogador
export async function POST(request) {
  try {
    // Extrair dados da requisição
    const dados = await request.json();
    
    // Validar dados
    const validacao = validarDadosJogador(dados);
    if (!validacao.valido) {
      return NextResponse.json({ erro: validacao.erro }, { status: 400 });
    }
    
    // Conectar ao MongoDB
    let dbConnection = null;
    
    try {
      const { db } = await connectToDB();
      dbConnection = db;
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error);
      return NextResponse.json({ 
        erro: 'Erro ao conectar ao banco de dados', 
        detalhes: error.message 
      }, { status: 503 });
    }
    
    // Verificar se jogador já existe
    if (await jogadorExiste(dados.nome, dbConnection)) {
      return NextResponse.json({ 
        erro: `Jogador com nome '${dados.nome}' já existe` 
      }, { status: 409 });
    }
    
    // Criar objeto de jogador
    const novoJogador = {
      nome: dados.nome,
      email: dados.email || '',
      pontuacao: 0,
      jogos: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      dataCriacao: new Date().toISOString()
    };
    
    // Inserir no banco de dados
    const result = await dbConnection.collection('players').insertOne(novoJogador);
    
    if (!result.acknowledged) {
      return NextResponse.json({ 
        erro: 'Falha ao inserir jogador no banco de dados' 
      }, { status: 500 });
    }
    
    // Atualizar cache
    novoJogador._id = result.insertedId.toString();
    novoJogador.id = result.insertedId.toString();
    
    // Invalidar cache
    cachedPlayers = null;
    
    // Retornar resposta de sucesso
    return NextResponse.json({ 
      mensagem: 'Jogador cadastrado com sucesso', 
      jogador: novoJogador 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar jogador:', error);
    return NextResponse.json({ 
      erro: 'Erro ao cadastrar jogador', 
      detalhes: error.message 
    }, { status: 500 });
  }
}

// PUT - Atualizar jogador existente
export async function PUT(request) {
  try {
    // Extrair dados da requisição
    const dados = await request.json();
    
    if (!dados.id) {
      return NextResponse.json({ erro: 'ID do jogador é obrigatório' }, { status: 400 });
    }
    
    // Conectar ao MongoDB
    let dbConnection = null;
    
    try {
      const { db } = await connectToDB();
      dbConnection = db;
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error);
      return NextResponse.json({ 
        erro: 'Erro ao conectar ao banco de dados', 
        detalhes: error.message 
      }, { status: 503 });
    }
    
    // Preparar a query com tratamento adequado para ObjectId
    let query;
    try {
      // Verificar se o ID parece ser um ObjectId válido
      if (/^[0-9a-fA-F]{24}$/.test(dados.id)) {
        query = { _id: new ObjectId(dados.id) };
      } else {
        query = { $or: [{ _id: dados.id }, { id: dados.id }] };
      }
    } catch (idErr) {
      // Se falhar na conversão, use como string
      query = { $or: [{ _id: dados.id }, { id: dados.id }] };
    }
    
    // Verificar se jogador existe
    const jogadorExistente = await dbConnection.collection('players').findOne(query);
    
    if (!jogadorExistente) {
      return NextResponse.json({ 
        erro: `Jogador com ID '${dados.id}' não encontrado` 
      }, { status: 404 });
    }
    
    // Atualizar dados do jogador
    const atualizacao = {};
    
    if (dados.nome) atualizacao.nome = dados.nome;
    if (dados.email !== undefined) atualizacao.email = dados.email;
    if (dados.pontuacao !== undefined) atualizacao.pontuacao = dados.pontuacao;
    if (dados.jogos !== undefined) atualizacao.jogos = dados.jogos;
    if (dados.vitorias !== undefined) atualizacao.vitorias = dados.vitorias;
    if (dados.derrotas !== undefined) atualizacao.derrotas = dados.derrotas;
    if (dados.empates !== undefined) atualizacao.empates = dados.empates;
    
    // Atualizar no banco de dados usando a mesma query
    const result = await dbConnection.collection('players').updateOne(
      query,
      { $set: atualizacao }
    );
    
    if (!result.acknowledged) {
      return NextResponse.json({ 
        erro: 'Falha ao atualizar jogador no banco de dados' 
      }, { status: 500 });
    }
    
    // Invalidar cache
    cachedPlayers = null;
    
    // Retornar resposta de sucesso
    return NextResponse.json({ 
      mensagem: 'Jogador atualizado com sucesso', 
      modificados: result.modifiedCount 
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error);
    return NextResponse.json({ 
      erro: 'Erro ao atualizar jogador', 
      detalhes: error.message 
    }, { status: 500 });
  }
}

// DELETE - Remover jogador existente
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ erro: 'ID do jogador é obrigatório' }, { status: 400 });
    }
    
    // Conectar ao MongoDB
    let dbConnection = null;
    
    try {
      const { db } = await connectToDB();
      dbConnection = db;
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error);
      return NextResponse.json({ 
        erro: 'Erro ao conectar ao banco de dados', 
        detalhes: error.message 
      }, { status: 503 });
    }
    
    // Preparar a query com tratamento adequado para ObjectId
    let query;
    try {
      // Verificar se o ID parece ser um ObjectId válido
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        query = { $or: [{ _id: id }, { id: id }] };
      }
    } catch (idErr) {
      // Se falhar na conversão, use como string
      query = { $or: [{ _id: id }, { id: id }] };
    }
    
    // Remover jogador
    const result = await dbConnection.collection('players').deleteOne(query);
    
    if (!result.acknowledged) {
      return NextResponse.json({ 
        erro: 'Falha ao remover jogador do banco de dados' 
      }, { status: 500 });
    }
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        erro: `Jogador com ID '${id}' não encontrado` 
      }, { status: 404 });
    }
    
    // Invalidar cache
    cachedPlayers = null;
    
    // Retornar resposta de sucesso
    return NextResponse.json({ 
      mensagem: 'Jogador removido com sucesso', 
      removidos: result.deletedCount 
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao remover jogador:', error);
    return NextResponse.json({ 
      erro: 'Erro ao remover jogador', 
      detalhes: error.message 
    }, { status: 500 });
  }
} 