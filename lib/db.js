import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Garantir que o diretório data existe
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Caminho para o banco de dados SQLite
const dbPath = path.join(dataDir, 'xadrez.db');

// Criar uma conexão com o banco de dados
const db = new Database(dbPath);

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    email TEXT,
    points INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    gamesPlayed INTEGER DEFAULT 0,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whitePlayer INTEGER NOT NULL,
    blackPlayer INTEGER NOT NULL,
    result TEXT NOT NULL,
    pgn TEXT,
    moves TEXT,
    startTime TEXT,
    endTime TEXT,
    tournament TEXT,
    FOREIGN KEY (whitePlayer) REFERENCES players(id),
    FOREIGN KEY (blackPlayer) REFERENCES players(id)
  );
`);

// Preparar statements para uso frequente
const statements = {
  // Players
  getAllPlayers: db.prepare('SELECT * FROM players ORDER BY points DESC, wins DESC'),
  getPlayerById: db.prepare('SELECT * FROM players WHERE id = ?'),
  getPlayerByName: db.prepare('SELECT * FROM players WHERE name = ?'),
  createPlayer: db.prepare(`
    INSERT INTO players (name, email, points, wins, losses, draws, gamesPlayed, createdAt) 
    VALUES (?, ?, 0, 0, 0, 0, 0, ?)
  `),
  updatePlayerStats: db.prepare(`
    UPDATE players 
    SET gamesPlayed = gamesPlayed + 1, 
        wins = wins + ?, 
        losses = losses + ?, 
        draws = draws + ?, 
        points = points + ? 
    WHERE id = ?
  `),

  // Games
  saveGame: db.prepare(`
    INSERT INTO games (whitePlayer, blackPlayer, result, pgn, moves, startTime, endTime, tournament) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getGameById: db.prepare('SELECT * FROM games WHERE id = ?'),
  getPlayerGames: db.prepare(`
    SELECT * FROM games 
    WHERE whitePlayer = ? OR blackPlayer = ? 
    ORDER BY startTime DESC
  `)
};

export default {
  db,
  statements
}; 