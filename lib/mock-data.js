// Dados de exemplo para uso no lado do cliente quando o acesso ao servidor não está disponível

export const mockPlayers = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@example.com",
    points: 10,
    wins: 3,
    losses: 1,
    draws: 1,
    gamesPlayed: 5,
    createdAt: "2023-01-15T14:30:00.000Z"
  },
  {
    id: 2,
    name: "Maria Oliveira",
    email: "maria@example.com",
    points: 7,
    wins: 2,
    losses: 1,
    draws: 1,
    gamesPlayed: 4,
    createdAt: "2023-01-16T10:45:00.000Z"
  },
  {
    id: 3,
    name: "Pedro Santos",
    email: "pedro@example.com",
    points: 5,
    wins: 1,
    losses: 0,
    draws: 2,
    gamesPlayed: 3,
    createdAt: "2023-01-17T16:20:00.000Z"
  }
];

export const mockGames = [
  {
    id: 1,
    whitePlayer: 1,
    blackPlayer: 2,
    result: "white",
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"],
    startTime: "2023-02-01T09:00:00.000Z",
    endTime: "2023-02-01T09:45:00.000Z",
    tournament: "Campeonato Virtual de Xadrez"
  },
  {
    id: 2,
    whitePlayer: 3,
    blackPlayer: 1,
    result: "white",
    pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
    startTime: "2023-02-02T14:30:00.000Z",
    endTime: "2023-02-02T15:15:00.000Z",
    tournament: "Campeonato Virtual de Xadrez"
  },
  {
    id: 3,
    whitePlayer: 2,
    blackPlayer: 3,
    result: "draw",
    pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4"],
    startTime: "2023-02-03T11:00:00.000Z",
    endTime: "2023-02-03T11:40:00.000Z",
    tournament: "Campeonato Virtual de Xadrez"
  }
]; 