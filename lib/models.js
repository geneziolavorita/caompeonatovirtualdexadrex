import db from './db';

// Coleção de Jogadores
export async function getPlayersCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection('players');
}

// Coleção de Partidas
export async function getGamesCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection('games');
}

// Funções para gerenciar jogadores
export async function createPlayer(playerData) {
  try {
    // Verificar se o jogador já existe
    const existingPlayer = getPlayerByName(playerData.name);
    if (existingPlayer) {
      throw new Error('Um jogador com este nome já existe.');
    }
    
    const createdAt = new Date().toISOString();
    const result = db.statements.createPlayer.run(
      playerData.name,
      playerData.email || '',
      createdAt
    );
    
    return {
      id: result.lastInsertRowid,
      name: playerData.name,
      email: playerData.email || '',
      points: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      gamesPlayed: 0,
      createdAt
    };
  } catch (error) {
    throw error;
  }
}

export function getPlayerById(id) {
  try {
    return db.statements.getPlayerById.get(id);
  } catch (error) {
    console.error('Erro ao buscar jogador por ID:', error);
    return null;
  }
}

export function getPlayerByName(name) {
  try {
    return db.statements.getPlayerByName.get(name);
  } catch (error) {
    console.error('Erro ao buscar jogador por nome:', error);
    return null;
  }
}

export function getAllPlayers() {
  try {
    return db.statements.getAllPlayers.all();
  } catch (error) {
    console.error('Erro ao buscar todos os jogadores:', error);
    return [];
  }
}

export function updatePlayerStats(playerId, result) {
  try {
    // Valores padrão
    let wins = 0, losses = 0, draws = 0, points = 0;
    
    // Atualizar estatísticas baseadas no resultado
    if (result === 'win') {
      wins = 1;
      points = 3; // 3 pontos por vitória
    } else if (result === 'loss') {
      losses = 1;
      points = 0; // 0 pontos por derrota
    } else if (result === 'draw') {
      draws = 1;
      points = 1; // 1 ponto por empate
    }
    
    db.statements.updatePlayerStats.run(
      wins,
      losses,
      draws,
      points,
      playerId
    );
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do jogador:', error);
    return false;
  }
}

// Funções para gerenciar partidas
export function saveGame(gameData) {
  try {
    // Converter arrays e objetos para JSON strings
    const movesStr = JSON.stringify(gameData.moves || []);
    const startTime = gameData.startTime ? new Date(gameData.startTime).toISOString() : new Date().toISOString();
    const endTime = gameData.endTime ? new Date(gameData.endTime).toISOString() : new Date().toISOString();
    
    const result = db.statements.saveGame.run(
      gameData.whitePlayer,
      gameData.blackPlayer,
      gameData.result,
      gameData.pgn || '',
      movesStr,
      startTime,
      endTime,
      gameData.tournament || 'Campeonato Virtual de Xadrez'
    );
    
    // Atualizar estatísticas dos jogadores
    if (gameData.result === 'white') {
      updatePlayerStats(gameData.whitePlayer, 'win');
      updatePlayerStats(gameData.blackPlayer, 'loss');
    } else if (gameData.result === 'black') {
      updatePlayerStats(gameData.whitePlayer, 'loss');
      updatePlayerStats(gameData.blackPlayer, 'win');
    } else if (gameData.result === 'draw') {
      updatePlayerStats(gameData.whitePlayer, 'draw');
      updatePlayerStats(gameData.blackPlayer, 'draw');
    }
    
    return {
      id: result.lastInsertRowid,
      ...gameData,
      moves: gameData.moves || [],
      startTime,
      endTime
    };
  } catch (error) {
    console.error('Erro ao salvar partida:', error);
    throw error;
  }
}

export function getGameById(id) {
  try {
    const game = db.statements.getGameById.get(id);
    if (game && game.moves) {
      game.moves = JSON.parse(game.moves);
    }
    return game;
  } catch (error) {
    console.error('Erro ao buscar partida por ID:', error);
    return null;
  }
}

export function getPlayerGames(playerId) {
  try {
    const games = db.statements.getPlayerGames.all(playerId, playerId);
    // Converter as strings JSON de volta para arrays
    return games.map(game => {
      if (game.moves) {
        game.moves = JSON.parse(game.moves);
      }
      return game;
    });
  } catch (error) {
    console.error('Erro ao buscar partidas do jogador:', error);
    return [];
  }
}

export function getTournamentRanking() {
  try {
    return getAllPlayers();
  } catch (error) {
    console.error('Erro ao buscar ranking do torneio:', error);
    return [];
  }
} 