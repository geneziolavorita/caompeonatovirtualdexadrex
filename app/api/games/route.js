import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const GAMES_FILE_PATH = path.join(process.cwd(), 'data/games.json');
const PLAYERS_FILE_PATH = path.join(process.cwd(), 'data/players.json');

// Função auxiliar para ler o arquivo de jogos
function readGamesFile() {
  try {
    // Verifica se o arquivo existe
    if (!fs.existsSync(GAMES_FILE_PATH)) {
      console.log(`Arquivo de jogos não encontrado em ${GAMES_FILE_PATH}. Criando arquivo vazio.`);
      // Certifique-se de que o diretório data existe
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      // Cria o arquivo com um array vazio
      fs.writeFileSync(GAMES_FILE_PATH, JSON.stringify([]));
      return [];
    }
    
    // Lê o arquivo
    const fileContent = fs.readFileSync(GAMES_FILE_PATH, 'utf8');
    
    // Trata o caso de arquivo vazio
    if (!fileContent.trim()) {
      return [];
    }
    
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Erro ao ler arquivo de jogos:', error);
    throw new Error(`Falha ao ler dados dos jogos: ${error.message}`);
  }
}

// Função auxiliar para ler arquivo de jogadores
function readPlayersFile() {
  try {
    if (!fs.existsSync(PLAYERS_FILE_PATH)) {
      console.log(`Arquivo de jogadores não encontrado em ${PLAYERS_FILE_PATH}`);
      return [];
    }
    
    const fileContent = fs.readFileSync(PLAYERS_FILE_PATH, 'utf8');
    
    if (!fileContent.trim()) {
      return [];
    }
    
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Erro ao ler arquivo de jogadores:', error);
    throw new Error(`Falha ao ler dados dos jogadores: ${error.message}`);
  }
}

// Função auxiliar para salvar no arquivo de jogos
function writeGamesFile(games) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(GAMES_FILE_PATH, JSON.stringify(games, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar arquivo de jogos:', error);
    throw new Error(`Falha ao salvar dados dos jogos: ${error.message}`);
  }
}

// Função auxiliar para salvar no arquivo de jogadores
function writePlayersFile(players) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify(players, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar arquivo de jogadores:', error);
    throw new Error(`Falha ao salvar dados dos jogadores: ${error.message}`);
  }
}

// Função para validar dados do jogo
function validateGameData(data) {
  const errors = [];
  
  if (!data) {
    errors.push('Dados do jogo não fornecidos');
    return { valid: false, errors };
  }
  
  // Validar jogador branco
  if (!data.whitePlayer) {
    errors.push('Jogador das peças brancas é obrigatório');
  } else if (typeof data.whitePlayer !== 'string') {
    errors.push('ID do jogador das peças brancas deve ser uma string');
  }
  
  // Validar jogador preto
  if (!data.blackPlayer) {
    errors.push('Jogador das peças pretas é obrigatório');
  } else if (typeof data.blackPlayer !== 'string') {
    errors.push('ID do jogador das peças pretas deve ser uma string');
  }
  
  // Validar que não é o mesmo jogador
  if (data.whitePlayer && data.blackPlayer && data.whitePlayer === data.blackPlayer) {
    errors.push('Os jogadores das peças brancas e pretas devem ser diferentes');
  }
  
  // Validar resultado, se fornecido
  if (data.result !== undefined) {
    if (!['white', 'black', 'draw', ''].includes(data.result)) {
      errors.push('Resultado inválido. Deve ser "white", "black", "draw" ou vazio');
    }
  }
  
  // Validar movimentos, se fornecidos
  if (data.moves !== undefined) {
    if (!Array.isArray(data.moves)) {
      errors.push('Movimentos devem ser um array');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Função para atualizar estatísticas do jogador
function updatePlayerStats(playerId, result, isWhite) {
  try {
    const players = readPlayersFile();
    const playerIndex = players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
      console.warn(`Jogador com ID ${playerId} não encontrado para atualizar estatísticas`);
      return false;
    }
    
    // Incrementar o número de jogos
    players[playerIndex].games = (players[playerIndex].games || 0) + 1;
    
    // Atualizar vitórias, derrotas ou empates
    if (result === 'draw') {
      players[playerIndex].draws = (players[playerIndex].draws || 0) + 1;
    } else if ((isWhite && result === 'white') || (!isWhite && result === 'black')) {
      players[playerIndex].wins = (players[playerIndex].wins || 0) + 1;
    } else if ((isWhite && result === 'black') || (!isWhite && result === 'white')) {
      players[playerIndex].losses = (players[playerIndex].losses || 0) + 1;
    }
    
    // Atualizar data de modificação
    players[playerIndex].updatedAt = new Date().toISOString();
    
    // Salvar alterações
    writePlayersFile(players);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do jogador:', error);
    return false;
  }
}

export async function GET() {
  console.log('Recebendo requisição GET para /api/games');
  
  try {
    const games = readGamesFile();
    console.log(`Retornando ${games.length} jogos`);
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Erro ao processar requisição GET:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar jogos', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  console.log('Recebendo requisição POST para /api/games');
  
  try {
    // Processar o corpo da requisição
    const data = await request.json();
    console.log('Dados recebidos:', data);
    
    // Validar dados do jogo
    const validation = validateGameData(data);
    if (!validation.valid) {
      console.log('Validação falhou:', validation.errors);
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Verificar se os jogadores existem
    const players = readPlayersFile();
    const whitePlayerExists = players.some(p => p.id === data.whitePlayer);
    const blackPlayerExists = players.some(p => p.id === data.blackPlayer);
    
    const invalidPlayers = [];
    if (!whitePlayerExists) invalidPlayers.push('Jogador das peças brancas não encontrado');
    if (!blackPlayerExists) invalidPlayers.push('Jogador das peças pretas não encontrado');
    
    if (invalidPlayers.length > 0) {
      console.log('Jogadores inválidos:', invalidPlayers);
      return NextResponse.json(
        { error: 'Jogadores inválidos', details: invalidPlayers },
        { status: 400 }
      );
    }
    
    // Buscar jogos existentes
    const games = readGamesFile();
    
    // Criar novo jogo
    const newGame = {
      id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      whitePlayer: data.whitePlayer,
      blackPlayer: data.blackPlayer,
      startTime: new Date().toISOString(),
      endTime: data.result ? new Date().toISOString() : null,
      result: data.result || '',
      moves: data.moves || [],
      pgn: data.pgn || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Adicionar à lista de jogos
    games.push(newGame);
    
    // Salvar no arquivo
    writeGamesFile(games);
    
    // Se o jogo já tiver um resultado, atualizar estatísticas dos jogadores
    if (data.result) {
      updatePlayerStats(data.whitePlayer, data.result, true);
      updatePlayerStats(data.blackPlayer, data.result, false);
    }
    
    console.log('Jogo registrado com sucesso:', newGame);
    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar requisição POST:', error);
    
    // Verificar se é um erro de parsing JSON
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Formato JSON inválido' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Falha ao registrar jogo', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  console.log('Recebendo requisição PUT para /api/games');
  
  try {
    // Processar o corpo da requisição
    const data = await request.json();
    console.log('Dados de atualização recebidos:', data);
    
    // Verificar se o ID do jogo foi fornecido
    if (!data.id) {
      return NextResponse.json(
        { error: 'ID do jogo é obrigatório' },
        { status: 400 }
      );
    }
    
    // Buscar jogos existentes
    const games = readGamesFile();
    const gameIndex = games.findIndex(g => g.id === data.id);
    
    if (gameIndex === -1) {
      console.log(`Jogo com ID ${data.id} não encontrado`);
      return NextResponse.json(
        { error: 'Jogo não encontrado' },
        { status: 404 }
      );
    }
    
    const oldGame = games[gameIndex];
    const hadResult = Boolean(oldGame.result);
    
    // Atualizar campos permitidos
    games[gameIndex] = {
      ...oldGame,
      result: data.result !== undefined ? data.result : oldGame.result,
      moves: data.moves || oldGame.moves,
      pgn: data.pgn || oldGame.pgn,
      endTime: data.result ? new Date().toISOString() : oldGame.endTime,
      updatedAt: new Date().toISOString()
    };
    
    // Salvar no arquivo
    writeGamesFile(games);
    
    // Se o jogo não tinha resultado antes, mas agora tem, atualizar estatísticas dos jogadores
    if (!hadResult && data.result) {
      updatePlayerStats(oldGame.whitePlayer, data.result, true);
      updatePlayerStats(oldGame.blackPlayer, data.result, false);
    }
    
    console.log('Jogo atualizado com sucesso:', games[gameIndex]);
    return NextResponse.json(games[gameIndex]);
  } catch (error) {
    console.error('Erro ao processar requisição PUT:', error);
    
    // Verificar se é um erro de parsing JSON
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Formato JSON inválido' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Falha ao atualizar jogo', details: error.message },
      { status: 500 }
    );
  }
} 