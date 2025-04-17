import clientPromise from './db';

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
  const collection = await getPlayersCollection();
  const existingPlayer = await collection.findOne({ name: playerData.name });
  
  if (existingPlayer) {
    throw new Error('Um jogador com este nome já existe.');
  }
  
  const newPlayer = {
    name: playerData.name,
    email: playerData.email || '',
    points: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    gamesPlayed: 0,
    createdAt: new Date()
  };
  
  const result = await collection.insertOne(newPlayer);
  return { id: result.insertedId, ...newPlayer };
}

export async function getPlayerById(id) {
  const collection = await getPlayersCollection();
  return collection.findOne({ _id: id });
}

export async function getPlayerByName(name) {
  const collection = await getPlayersCollection();
  return collection.findOne({ name });
}

export async function getAllPlayers() {
  const collection = await getPlayersCollection();
  return collection.find({}).sort({ points: -1 }).toArray();
}

export async function updatePlayerStats(playerId, result) {
  const collection = await getPlayersCollection();
  const updateData = { 
    $inc: { 
      gamesPlayed: 1 
    }
  };
  
  // Atualizar estatísticas baseadas no resultado
  if (result === 'win') {
    updateData.$inc.wins = 1;
    updateData.$inc.points = 3; // 3 pontos por vitória
  } else if (result === 'loss') {
    updateData.$inc.losses = 1;
    updateData.$inc.points = 0; // 0 pontos por derrota
  } else if (result === 'draw') {
    updateData.$inc.draws = 1;
    updateData.$inc.points = 1; // 1 ponto por empate
  }
  
  return collection.updateOne({ _id: playerId }, updateData);
}

// Funções para gerenciar partidas
export async function saveGame(gameData) {
  const collection = await getGamesCollection();
  
  const newGame = {
    whitePlayer: gameData.whitePlayer,
    blackPlayer: gameData.blackPlayer,
    result: gameData.result, // 'white', 'black', 'draw'
    moves: gameData.moves || [],
    pgn: gameData.pgn || '',
    startTime: gameData.startTime || new Date(),
    endTime: gameData.endTime || new Date(),
    tournament: gameData.tournament || 'Campeonato Virtual de Xadrez'
  };
  
  const result = await collection.insertOne(newGame);
  
  // Atualizar estatísticas dos jogadores
  if (newGame.result === 'white') {
    await updatePlayerStats(newGame.whitePlayer, 'win');
    await updatePlayerStats(newGame.blackPlayer, 'loss');
  } else if (newGame.result === 'black') {
    await updatePlayerStats(newGame.whitePlayer, 'loss');
    await updatePlayerStats(newGame.blackPlayer, 'win');
  } else if (newGame.result === 'draw') {
    await updatePlayerStats(newGame.whitePlayer, 'draw');
    await updatePlayerStats(newGame.blackPlayer, 'draw');
  }
  
  return { id: result.insertedId, ...newGame };
}

export async function getGameById(id) {
  const collection = await getGamesCollection();
  return collection.findOne({ _id: id });
}

export async function getPlayerGames(playerId) {
  const collection = await getGamesCollection();
  return collection.find({
    $or: [
      { whitePlayer: playerId },
      { blackPlayer: playerId }
    ]
  }).sort({ startTime: -1 }).toArray();
}

export async function getTournamentRanking() {
  const collection = await getPlayersCollection();
  return collection.find({}).sort({ points: -1, wins: -1 }).toArray();
} 