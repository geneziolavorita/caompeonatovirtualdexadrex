import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const GAMES_FILE_PATH = path.join(process.cwd(), 'data/games.json');
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

// Função para ler o arquivo de jogos
function readGamesFile() {
  try {
    // Verificar e corrigir o arquivo antes de ler
    fixJsonFile(GAMES_FILE_PATH);
    
    // Ler o conteúdo do arquivo
    const fileContent = fs.readFileSync(GAMES_FILE_PATH, 'utf8');
    
    // Verificar se o conteúdo está vazio
    if (!fileContent || fileContent.trim() === '') {
      return [];
    }
    
    // Tentar fazer o parse do JSON
    try {
      const games = JSON.parse(fileContent);
      
      // Verificar se o resultado é um array
      if (!Array.isArray(games)) {
        console.warn('Arquivo de jogos não contém um array. Inicializando com array vazio.');
        fs.writeFileSync(GAMES_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
        return [];
      }
      
      return games;
    } catch (parseError) {
      console.error('Erro ao fazer parse do arquivo de jogos:', parseError);
      // Se não conseguir fazer o parse, criar um arquivo novo com array vazio
      fs.writeFileSync(GAMES_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
  } catch (error) {
    console.error('Erro ao ler arquivo de jogos:', error);
    return [];
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

// Função para escrever no arquivo de jogos
function writeGamesFile(games) {
  try {
    if (!games || !Array.isArray(games)) {
      console.error('Tentativa de salvar dados inválidos em games.json');
      return false;
    }

    ensureDataDirectoryExists();
    
    try {
      fs.writeFileSync(GAMES_FILE_PATH, JSON.stringify(games, null, 2), 'utf8');
      return true;
    } catch (writeError) {
      console.error('Erro ao escrever arquivo de jogos:', writeError);
      return false;
    }
  } catch (error) {
    console.error('Erro ao preparar dados para salvar em games.json:', error);
    return false;
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

// Função para atualizar as estatísticas de um jogador após um jogo
function updatePlayerStats(playerId, resultado) {
  try {
    const players = readPlayersFile();
    const playerIndex = players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
      console.warn(`Jogador com ID ${playerId} não encontrado`);
      return false;
    }
    
    const player = players[playerIndex];
    
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
    
    players[playerIndex] = player;
    writePlayersFile(players);
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do jogador:', error);
    return false;
  }
}

// Verificar e corrigir arquivos na inicialização
fixJsonFile(GAMES_FILE_PATH);
fixJsonFile(PLAYERS_FILE_PATH);

// GET - Obter todos os jogos ou um jogo específico
export async function GET(request) {
  try {
    console.log('API: Obtendo jogos');
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const games = readGamesFile();
    
    // Se um ID for fornecido, retornar apenas o jogo específico
    if (id) {
      const game = games.find(g => g.id === id);
      
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
    console.log('API: Criando novo jogo');
    
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
    
    // Verificar se os jogadores existem
    const players = readPlayersFile();
    const brancasPlayer = players.find(p => p.id === data.brancasId);
    const pretasPlayer = players.find(p => p.id === data.pretasId);
    
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
    
    // Ler jogos existentes
    const games = readGamesFile();
    
    // Criar novo jogo
    const newGame = {
      id: uuidv4(),
      brancasId: data.brancasId,
      brancasNome: brancasPlayer.nome || brancasPlayer.name,
      pretasId: data.pretasId,
      pretasNome: pretasPlayer.nome || pretasPlayer.name,
      data_inicio: new Date().toISOString(),
      data_fim: null,
      resultado: 'em_andamento',
      movimentos: [],
      notacao: '',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
    
    // Adicionar o novo jogo à lista
    games.push(newGame);
    
    // Salvar no arquivo
    if (!writeGamesFile(games)) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao salvar jogo',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
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
    console.log('API: Atualizando jogo');
    
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
    
    // Ler jogos existentes
    const games = readGamesFile();
    const gameIndex = games.findIndex(g => g.id === data.id);
    
    if (gameIndex === -1) {
      return NextResponse.json({
        success: false,
        message: `Jogo com ID ${data.id} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    const oldGame = games[gameIndex];
    
    // Atualizar o jogo (apenas campos permitidos)
    const updatedGame = {
      ...oldGame,
      movimentos: data.movimentos || oldGame.movimentos,
      notacao: data.notacao || oldGame.notacao,
      resultado: data.resultado || oldGame.resultado,
      atualizado_em: new Date().toISOString()
    };
    
    // Se o jogo está sendo finalizado, atualizar a data de término
    if (oldGame.resultado === 'em_andamento' && 
        ['vitoria_brancas', 'vitoria_pretas', 'empate'].includes(data.resultado)) {
      updatedGame.data_fim = new Date().toISOString();
      
      // Atualizar estatísticas dos jogadores
      if (data.resultado === 'vitoria_brancas') {
        updatePlayerStats(updatedGame.brancasId, 'vitoria');
        updatePlayerStats(updatedGame.pretasId, 'derrota');
      } else if (data.resultado === 'vitoria_pretas') {
        updatePlayerStats(updatedGame.brancasId, 'derrota');
        updatePlayerStats(updatedGame.pretasId, 'vitoria');
      } else if (data.resultado === 'empate') {
        updatePlayerStats(updatedGame.brancasId, 'empate');
        updatePlayerStats(updatedGame.pretasId, 'empate');
      }
    }
    
    games[gameIndex] = updatedGame;
    
    // Salvar no arquivo
    if (!writeGamesFile(games)) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao salvar jogo atualizado',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: updatedGame,
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
    console.log('API: Excluindo jogo');
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do jogo é obrigatório',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Ler jogos existentes
    const games = readGamesFile();
    const initialCount = games.length;
    
    // Filtrar para remover o jogo com o ID especificado
    const filteredGames = games.filter(g => g.id !== id);
    
    // Verificar se algum jogo foi removido
    if (filteredGames.length === initialCount) {
      return NextResponse.json({
        success: false,
        message: `Jogo com ID ${id} não encontrado`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    // Salvar no arquivo
    if (!writeGamesFile(filteredGames)) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao salvar após excluir jogo',
        timestamp: new Date().toISOString()
      }, { status: 500 });
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