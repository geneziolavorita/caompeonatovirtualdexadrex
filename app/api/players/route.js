import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLAYERS_FILE_PATH = path.join(process.cwd(), 'data/players.json');
const DATA_DIR = path.join(process.cwd(), 'data');

// Função para garantir que o diretório de dados existe
function ensureDataDirectoryExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log('Diretório de dados criado:', DATA_DIR);
    }
    return true;
  } catch (error) {
    console.error('Erro ao criar diretório de dados:', error);
    return false;
  }
}

// Função para verificar e corrigir arquivo JSON
function fixJsonFile(filePath) {
  console.log(`Verificando arquivo: ${filePath}`);
  
  // Garantir que o diretório existe
  ensureDataDirectoryExists();
  
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`Arquivo ${filePath} não existe, criando novo arquivo vazio`);
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
      return true;
    }
    
    // Tentar ler o arquivo
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Verificar se o conteúdo está vazio
      if (!fileContent || fileContent.trim() === '') {
        console.log(`Arquivo ${filePath} está vazio, inicializando com array vazio`);
        fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
        return true;
      }
      
      // Verificar se o JSON é válido
      try {
        JSON.parse(fileContent);
        console.log(`Arquivo ${filePath} é válido`);
        return true;
      } catch (jsonError) {
        console.error(`Erro ao fazer parse do arquivo ${filePath}: ${jsonError.message}`);
        console.log(`Corrigindo arquivo ${filePath}`);
        fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
        return true;
      }
    } catch (readError) {
      console.error(`Erro ao ler arquivo ${filePath}: ${readError.message}`);
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
      return true;
    }
  } catch (error) {
    console.error(`Erro ao verificar/corrigir arquivo ${filePath}: ${error.message}`);
    return false;
  }
}

// Função para ler o arquivo de jogadores
function readPlayersFile() {
  try {
    // Verificar e corrigir o arquivo antes de ler
    fixJsonFile(PLAYERS_FILE_PATH);
    
    // Ler o conteúdo do arquivo
    const fileContent = fs.readFileSync(PLAYERS_FILE_PATH, 'utf8');
    
    // Verificar se o conteúdo está vazio
    if (!fileContent || fileContent.trim() === '') {
      return [];
    }
    
    // Tentar fazer o parse do JSON
    try {
      const players = JSON.parse(fileContent);
      
      // Verificar se o resultado é um array
      if (!Array.isArray(players)) {
        console.warn('Arquivo de jogadores não contém um array. Inicializando com array vazio.');
        fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
        return [];
      }
      
      return players;
    } catch (parseError) {
      console.error('Erro ao fazer parse do arquivo de jogadores:', parseError);
      // Se não conseguir fazer o parse, criar um arquivo novo com array vazio
      fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
  } catch (error) {
    console.error('Erro ao ler arquivo de jogadores:', error);
    return [];
  }
}

// Função para escrever no arquivo de jogadores
function writePlayersFile(players) {
  try {
    if (!players || !Array.isArray(players)) {
      console.error('Tentativa de salvar dados inválidos em players.json');
      return false;
    }
    
    ensureDataDirectoryExists();
    
    try {
      fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify(players, null, 2), 'utf8');
      console.log(`Dados de ${players.length} jogadores salvos com sucesso`);
      return true;
    } catch (writeError) {
      console.error('Erro ao escrever arquivo de jogadores:', writeError);
      return false;
    }
  } catch (error) {
    console.error('Erro ao preparar dados para salvar em players.json:', error);
    return false;
  }
}

// Normalizar dados do jogador para garantir compatibilidade
function normalizePlayerData(data) {
  // Aceitar tanto "nome" quanto "name" no input
  const normalizedData = { ...data };
  
  // Priorizar "nome" sobre "name" (para APIs atualizadas)
  if (!normalizedData.nome && normalizedData.name) {
    normalizedData.nome = normalizedData.name;
  } else if (!normalizedData.name && normalizedData.nome) {
    normalizedData.name = normalizedData.nome;
  }
  
  return normalizedData;
}

// Verificar e corrigir arquivo na inicialização
fixJsonFile(PLAYERS_FILE_PATH);

// GET - Listar todos os jogadores
export async function GET() {
  try {
    console.log('API: Obtendo lista de jogadores');
    const players = readPlayersFile();
    
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
    console.log('API: Criando novo jogador');
    
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
    
    // Normalizar dados para garantir compatibilidade com diferentes versões do frontend
    data = normalizePlayerData(data);
    
    // Validar dados mínimos
    if (!data.nome) {
      return NextResponse.json({
        success: false,
        message: 'Nome do jogador é obrigatório',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Ler jogadores existentes
    const players = readPlayersFile();
    
    // Verificar se o jogador já existe
    const playerExists = players.some(player => 
      (player.nome && player.nome.toLowerCase() === data.nome.toLowerCase()) ||
      (player.name && player.name.toLowerCase() === data.nome.toLowerCase())
    );
    
    if (playerExists) {
      return NextResponse.json({
        success: false,
        message: `Jogador com nome '${data.nome}' já existe`,
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }
    
    // Gerar ID único
    const uniqueId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Criar objeto do jogador com dados iniciais
    const newPlayer = {
      id: uniqueId,
      nome: data.nome,
      name: data.nome, // Duplicar para compatibilidade
      email: data.email || undefined,
      pontuacao: 0,
      jogos: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      dataCriacao: new Date().toISOString(),
      createdAt: new Date().toISOString() // Duplicar para compatibilidade
    };
    
    console.log('Novo jogador a ser adicionado:', newPlayer);
    
    // Adicionar ao array e salvar
    players.push(newPlayer);
    const saveResult = writePlayersFile(players);
    
    if (!saveResult) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao salvar dados do jogador',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
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
    console.log('API: Atualizando jogador');
    
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
    
    // Normalizar dados para garantir compatibilidade
    data = normalizePlayerData(data);
    
    // Validar ID do jogador
    if (!data.id) {
      return NextResponse.json({
        success: false,
        message: 'ID do jogador é obrigatório',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Ler jogadores existentes
    const players = readPlayersFile();
    
    // Encontrar o jogador pelo ID
    const playerIndex = players.findIndex(player => player.id === data.id);
    
    if (playerIndex === -1) {
      return NextResponse.json({
        success: false,
        message: `Jogador com ID ${data.id} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    // Se estiver tentando atualizar o nome, verificar se já existe
    if (data.nome && data.nome !== players[playerIndex].nome) {
      const nameExists = players.some((player, index) => 
        index !== playerIndex && 
        ((player.nome && player.nome.toLowerCase() === data.nome.toLowerCase()) ||
         (player.name && player.name.toLowerCase() === data.nome.toLowerCase()))
      );
      
      if (nameExists) {
        return NextResponse.json({
          success: false,
          message: `Jogador com nome '${data.nome}' já existe`,
          timestamp: new Date().toISOString()
        }, { status: 409 });
      }
    }
    
    // Atualizar jogador preservando campos que não foram enviados
    const oldPlayer = players[playerIndex];
    players[playerIndex] = {
      ...oldPlayer,
      ...data,
      // Manter ambos os campos sincronizados para compatibilidade
      nome: data.nome || oldPlayer.nome || oldPlayer.name,
      name: data.nome || data.name || oldPlayer.nome || oldPlayer.name,
      dataAtualizacao: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Salvar alterações
    const saveResult = writePlayersFile(players);
    
    if (!saveResult) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao salvar alterações do jogador',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Jogador atualizado com sucesso',
      data: players[playerIndex],
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
    console.log('API: Removendo jogador');
    
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
    
    // Ler jogadores existentes
    const players = readPlayersFile();
    
    // Encontrar o jogador pelo ID
    const playerIndex = players.findIndex(player => player.id === id);
    
    if (playerIndex === -1) {
      return NextResponse.json({
        success: false,
        message: `Jogador com ID ${id} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    // Remover o jogador
    const removedPlayer = players.splice(playerIndex, 1)[0];
    
    // Salvar alterações
    const saveResult = writePlayersFile(players);
    
    if (!saveResult) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao salvar após remover jogador',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Jogador removido com sucesso',
      data: removedPlayer,
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