// Verificação para garantir que este código execute apenas do lado do servidor
const isServer = typeof window === 'undefined';

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Diretório para os arquivos de dados
let dataDir = '';
let playersFilePath = '';
let gamesFilePath = '';

// Somente inicializar o sistema de arquivos no lado do servidor
if (isServer) {
  dataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`Diretório de dados criado em: ${dataDir}`);
    }
  } catch (error) {
    console.error(`Erro ao criar diretório de dados: ${error.message}`);
  }

  // Caminhos para os arquivos de dados
  playersFilePath = path.join(dataDir, 'players.json');
  gamesFilePath = path.join(dataDir, 'games.json');

  // Inicializar os arquivos se não existirem
  try {
    if (!fs.existsSync(playersFilePath)) {
      fs.writeFileSync(playersFilePath, JSON.stringify([]));
      console.log(`Arquivo de jogadores criado em: ${playersFilePath}`);
    }
  } catch (error) {
    console.error(`Erro ao criar arquivo de jogadores: ${error.message}`);
  }

  try {
    if (!fs.existsSync(gamesFilePath)) {
      fs.writeFileSync(gamesFilePath, JSON.stringify([]));
      console.log(`Arquivo de partidas criado em: ${gamesFilePath}`);
    }
  } catch (error) {
    console.error(`Erro ao criar arquivo de partidas: ${error.message}`);
  }
}

// Funções auxiliares para manipular arquivos
function safeReadFile(filePath, defaultValue = []) {
  if (!isServer) return defaultValue;
  
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}: ${error.message}`);
    return defaultValue;
  }
}

function safeWriteFile(filePath, data) {
  if (!isServer) return false;
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${filePath}: ${error.message}`);
    return false;
  }
}

// Funções para manipular os arquivos
export function getAllPlayers() {
  return safeReadFile(playersFilePath);
}

export function getPlayerById(id) {
  try {
    const players = getAllPlayers();
    return players.find(player => player.id === id);
  } catch (error) {
    console.error('Erro ao buscar jogador por ID:', error);
    return null;
  }
}

export function getPlayerByName(name) {
  try {
    const players = getAllPlayers();
    return players.find(player => player.name === name);
  } catch (error) {
    console.error('Erro ao buscar jogador por nome:', error);
    return null;
  }
}

export function createPlayer(playerData) {
  try {
    if (!isServer) {
      throw new Error('Esta função só pode ser executada no servidor');
    }
    
    const players = getAllPlayers();
    
    // Verificar se já existe um jogador com este nome
    if (players.some(player => player.name === playerData.name)) {
      throw new Error('Um jogador com este nome já existe.');
    }
    
    // Gerar ID (maior ID atual + 1)
    const maxId = players.length > 0 
      ? Math.max(...players.map(player => player.id)) 
      : 0;
    
    const newPlayer = {
      id: maxId + 1,
      name: playerData.name,
      email: playerData.email || '',
      points: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString()
    };
    
    players.push(newPlayer);
    
    // Se falhar ao salvar, lançar erro
    if (!safeWriteFile(playersFilePath, players)) {
      throw new Error('Falha ao salvar os dados do jogador');
    }
    
    return newPlayer;
  } catch (error) {
    console.error('Erro ao criar jogador:', error);
    throw error;
  }
}

export function updatePlayerStats(playerId, result) {
  try {
    if (!isServer) {
      console.warn('Esta função só pode ser executada no servidor');
      return false;
    }
    
    const players = getAllPlayers();
    const playerIndex = players.findIndex(player => player.id === playerId);
    
    if (playerIndex === -1) {
      console.error(`Jogador com ID ${playerId} não encontrado`);
      return false;
    }
    
    const player = players[playerIndex];
    
    // Atualizar estatísticas
    player.gamesPlayed += 1;
    
    if (result === 'win') {
      player.wins += 1;
      player.points += 3; // 3 pontos por vitória
    } else if (result === 'loss') {
      player.losses += 1;
      // 0 pontos por derrota
    } else if (result === 'draw') {
      player.draws += 1;
      player.points += 1; // 1 ponto por empate
    }
    
    // Salvar as alterações
    return safeWriteFile(playersFilePath, players);
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do jogador:', error);
    return false;
  }
}

export function getAllGames() {
  return safeReadFile(gamesFilePath);
}

export function getGameById(id) {
  try {
    const games = getAllGames();
    return games.find(game => game.id === id);
  } catch (error) {
    console.error('Erro ao buscar partida por ID:', error);
    return null;
  }
}

export function getPlayerGames(playerId) {
  try {
    const parsedId = parseInt(playerId);
    if (isNaN(parsedId)) {
      console.error(`ID de jogador inválido: ${playerId}`);
      return [];
    }
    
    const games = getAllGames();
    return games.filter(game => 
      game.whitePlayer === parsedId || 
      game.blackPlayer === parsedId
    ).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  } catch (error) {
    console.error('Erro ao buscar partidas do jogador:', error);
    return [];
  }
}

export function saveGame(gameData) {
  try {
    if (!isServer) {
      throw new Error('Esta função só pode ser executada no servidor');
    }
    
    const games = getAllGames();
    
    // Gerar ID (maior ID atual + 1)
    const maxId = games.length > 0 
      ? Math.max(...games.map(game => game.id)) 
      : 0;
    
    const whitePlayer = parseInt(gameData.whitePlayer);
    const blackPlayer = parseInt(gameData.blackPlayer);
    
    if (isNaN(whitePlayer) || isNaN(blackPlayer)) {
      throw new Error('IDs de jogadores inválidos');
    }
    
    const startTime = gameData.startTime ? new Date(gameData.startTime).toISOString() : new Date().toISOString();
    const endTime = gameData.endTime ? new Date(gameData.endTime).toISOString() : new Date().toISOString();
    
    const newGame = {
      id: maxId + 1,
      whitePlayer,
      blackPlayer,
      result: gameData.result,
      pgn: gameData.pgn || '',
      moves: gameData.moves || [],
      startTime,
      endTime,
      tournament: gameData.tournament || 'Campeonato Virtual de Xadrez'
    };
    
    games.push(newGame);
    
    // Se falhar ao salvar, lançar erro
    if (!safeWriteFile(gamesFilePath, games)) {
      throw new Error('Falha ao salvar os dados da partida');
    }
    
    // Atualizar estatísticas dos jogadores
    if (gameData.result === 'white') {
      updatePlayerStats(newGame.whitePlayer, 'win');
      updatePlayerStats(newGame.blackPlayer, 'loss');
    } else if (gameData.result === 'black') {
      updatePlayerStats(newGame.whitePlayer, 'loss');
      updatePlayerStats(newGame.blackPlayer, 'win');
    } else if (gameData.result === 'draw') {
      updatePlayerStats(newGame.whitePlayer, 'draw');
      updatePlayerStats(newGame.blackPlayer, 'draw');
    }
    
    return newGame;
  } catch (error) {
    console.error('Erro ao salvar partida:', error);
    throw error;
  }
}

export function getTournamentRanking() {
  try {
    const players = getAllPlayers();
    // Ordenar por pontos e depois por vitórias
    return players.sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      return b.wins - a.wins;
    });
  } catch (error) {
    console.error('Erro ao buscar ranking do torneio:', error);
    return [];
  }
}

// Esquema para o modelo de jogador
const PlayerSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do jogador é obrigatório'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  pontuacao: {
    type: Number,
    default: 0
  },
  jogos: {
    type: Number,
    default: 0
  },
  vitorias: {
    type: Number,
    default: 0
  },
  derrotas: {
    type: Number,
    default: 0
  },
  empates: {
    type: Number,
    default: 0
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

// Garantir que o campo name sempre recebe o mesmo valor que nome
PlayerSchema.pre('save', function(next) {
  if (this.nome && (!this.name || this.isModified('nome'))) {
    this.name = this.nome;
  }
  next();
});

// Função para conectar ao MongoDB
export async function conectarDB() {
  // Verificar se já estamos conectados
  if (mongoose.connection.readyState >= 1) {
    return { connected: true };
  }

  // Verificar se temos a variável de ambiente MONGODB_URI
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_FALLBACK || 'mongodb://localhost:27017/xadrex';
  
  if (!uri) {
    console.log("Aviso: Variável MONGODB_URI não definida. Verifique o arquivo .env.local");
    return { connected: false, error: "MONGODB_URI não definida no ambiente" };
  }

  try {
    // Conectar ao MongoDB
    await mongoose.connect(uri, {
      bufferCommands: false,
      maxIdleTimeMS: 60000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    });
    
    // Definir o modelo Player se ainda não estiver definido
    if (!mongoose.models.Player) {
      mongoose.model('Player', PlayerSchema);
    }
    
    console.log("Conectado ao MongoDB com sucesso");
    return { connected: true };
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    return { connected: false, error };
  }
}

// Exportar o esquema para uso em outros lugares se necessário
export { PlayerSchema }; 