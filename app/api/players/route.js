import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLAYERS_FILE_PATH = path.join(process.cwd(), 'data/players.json');

// Função auxiliar para ler o arquivo de jogadores
function readPlayersFile() {
  try {
    console.log(`Lendo arquivo de jogadores em: ${PLAYERS_FILE_PATH}`);
    
    // Verifica se o arquivo existe
    if (!fs.existsSync(PLAYERS_FILE_PATH)) {
      console.log(`Arquivo de jogadores não encontrado. Criando arquivo vazio.`);
      // Certifique-se de que o diretório data existe
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      // Cria o arquivo com um array vazio
      fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify([]));
      return [];
    }
    
    // Lê o arquivo
    const fileContent = fs.readFileSync(PLAYERS_FILE_PATH, 'utf8');
    console.log(`Conteúdo do arquivo: ${fileContent.substring(0, 100)}${fileContent.length > 100 ? '...' : ''}`);
    
    // Trata o caso de arquivo vazio
    if (!fileContent.trim()) {
      return [];
    }
    
    // Parse do conteúdo JSON
    try {
      const players = JSON.parse(fileContent);
      console.log(`Número de jogadores encontrados: ${players.length}`);
      return players;
    } catch (parseError) {
      console.error(`Erro ao fazer parse do JSON: ${parseError.message}`);
      // Se houver erro no parse, retorna um array vazio e reescreve o arquivo
      fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error(`Erro ao ler arquivo de jogadores: ${error.message}`);
    // Em caso de erro, retorna um array vazio
    return [];
  }
}

// Função auxiliar para salvar no arquivo de jogadores
function writePlayersFile(players) {
  try {
    console.log(`Salvando ${players.length} jogadores no arquivo`);
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Garante que o arquivo seja salvo com UTF-8 e formatação
    fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify(players, null, 2), 'utf8');
    console.log('Arquivo salvo com sucesso');
    return true;
  } catch (error) {
    console.error(`Erro ao salvar arquivo de jogadores: ${error.message}`);
    return false;
  }
}

// Valida dados do jogador
function validatePlayerData(data) {
  const errors = [];
  
  if (!data) {
    errors.push('Dados do jogador não fornecidos');
    return { valid: false, errors };
  }
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Nome do jogador é obrigatório');
  } else if (data.name.length < 2) {
    errors.push('Nome do jogador deve ter pelo menos 2 caracteres');
  } else if (data.name.length > 50) {
    errors.push('Nome do jogador não pode exceder 50 caracteres');
  }
  
  if (data.email !== undefined && data.email !== '') {
    if (typeof data.email !== 'string') {
      errors.push('Email deve ser uma string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Formato de email inválido');
    }
  }
  
  return { 
    valid: errors.length === 0,
    errors
  };
}

export async function GET(request) {
  console.log('Recebendo requisição GET para /api/players');
  
  try {
    const players = readPlayersFile();
    console.log(`Retornando ${players.length} jogadores para o cliente`);
    
    // Adiciona cabeçalhos para evitar caching
    return NextResponse.json(players, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error(`Erro ao processar requisição GET: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Falha ao buscar jogadores', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  console.log('Recebendo requisição POST para /api/players');
  
  try {
    // Processar o corpo da requisição
    const data = await request.json();
    console.log('Dados recebidos:', data);
    
    // Validação básica
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      console.log('Nome inválido fornecido');
      return NextResponse.json(
        { error: 'Nome do jogador é obrigatório' },
        { status: 400 }
      );
    }
    
    // Buscar jogadores existentes
    const players = readPlayersFile();
    
    // Verificar se já existe um jogador com o mesmo nome
    const existingPlayerWithName = players.find(
      p => p.name.toLowerCase() === data.name.toLowerCase()
    );
    if (existingPlayerWithName) {
      console.log(`Jogador com nome "${data.name}" já existe`);
      return NextResponse.json(
        { error: 'Jogador com este nome já está registrado' },
        { status: 409 }
      );
    }
    
    // Verificar se já existe jogador com mesmo email (se fornecido)
    if (data.email) {
      const existingPlayerWithEmail = players.find(
        p => p.email && p.email.toLowerCase() === data.email.toLowerCase()
      );
      if (existingPlayerWithEmail) {
        console.log(`Jogador com email "${data.email}" já existe`);
        return NextResponse.json(
          { error: 'Email já está em uso por outro jogador' },
          { status: 409 }
        );
      }
    }
    
    // Criar novo jogador
    const newPlayer = {
      id: `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      email: data.email ? data.email.trim() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      games: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
    
    // Adicionar à lista de jogadores
    players.push(newPlayer);
    
    // Salvar no arquivo
    const saved = writePlayersFile(players);
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Falha ao salvar os dados do jogador' },
        { status: 500 }
      );
    }
    
    console.log('Jogador registrado com sucesso:', newPlayer);
    return NextResponse.json(newPlayer, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error(`Erro ao processar requisição POST: ${error.message}`);
    
    // Verificar se é um erro de parsing JSON
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Formato JSON inválido' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Falha ao registrar jogador', details: error.message },
      { status: 500 }
    );
  }
} 