/**
 * Dados mock para jogadores quando o MongoDB não está disponível
 * Esses dados são usados apenas em ambientes de desenvolvimento ou quando 
 * o MongoDB não pode ser acessado.
 */

// Array de jogadores com dados iniciais
export const mockPlayers = [
  {
    _id: '6506a9d46c29dd9a40f2ee01',
    id: '6506a9d46c29dd9a40f2ee01',
    nome: 'Jogador 1',
    name: 'Jogador 1',
    pontuacao: 30,
    jogos: 10,
    vitorias: 6,
    derrotas: 2,
    empates: 2,
    dataCriacao: '2023-09-17T15:30:12.123Z'
  },
  {
    _id: '6506a9d46c29dd9a40f2ee02',
    id: '6506a9d46c29dd9a40f2ee02',
    nome: 'Jogador 2',
    name: 'Jogador 2',
    pontuacao: 25,
    jogos: 8,
    vitorias: 5,
    derrotas: 3,
    empates: 0,
    dataCriacao: '2023-09-17T16:20:45.789Z'
  },
  {
    _id: '6506a9d46c29dd9a40f2ee03',
    id: '6506a9d46c29dd9a40f2ee03',
    nome: 'Jogador 3',
    name: 'Jogador 3',
    pontuacao: 20,
    jogos: 6,
    vitorias: 4,
    derrotas: 2,
    empates: 0,
    dataCriacao: '2023-09-18T09:15:32.456Z'
  },
  {
    _id: '6506a9d46c29dd9a40f2ee04',
    id: '6506a9d46c29dd9a40f2ee04',
    nome: 'Jogador 4',
    name: 'Jogador 4',
    pontuacao: 15,
    jogos: 5,
    vitorias: 3,
    derrotas: 2,
    empates: 0,
    dataCriacao: '2023-09-18T14:45:22.789Z'
  },
  {
    _id: '6506a9d46c29dd9a40f2ee05',
    id: '6506a9d46c29dd9a40f2ee05',
    nome: 'Jogador 5',
    name: 'Jogador 5',
    pontuacao: 10,
    jogos: 4,
    vitorias: 2,
    derrotas: 2,
    empates: 0,
    dataCriacao: '2023-09-19T08:30:11.234Z'
  },
  {
    _id: '6506a9d46c29dd9a40f2ee06',
    id: '6506a9d46c29dd9a40f2ee06',
    nome: 'Jogador 6',
    name: 'Jogador 6',
    pontuacao: 8,
    jogos: 3,
    vitorias: 1,
    derrotas: 1,
    empates: 1,
    dataCriacao: '2023-09-19T12:10:45.678Z'
  },
  {
    _id: '6506a9d46c29dd9a40f2ee07',
    id: '6506a9d46c29dd9a40f2ee07',
    nome: 'Jogador 7',
    name: 'Jogador 7',
    pontuacao: 5,
    jogos: 2,
    vitorias: 1,
    derrotas: 1,
    empates: 0,
    dataCriacao: '2023-09-20T10:05:33.123Z'
  },
  {
    _id: '6506a9d46c29dd9a40f2ee08',
    id: '6506a9d46c29dd9a40f2ee08',
    nome: 'Jogador 8',
    name: 'Jogador 8',
    pontuacao: 0,
    jogos: 1,
    vitorias: 0,
    derrotas: 1,
    empates: 0,
    dataCriacao: '2023-09-20T15:20:12.456Z'
  }
];

// Função para obter dados mock de jogadores por ID
export function getMockPlayerById(id) {
  return mockPlayers.find(player => player._id === id || player.id === id);
}

// Função para atualizar um jogador mock
export function updateMockPlayer(id, updateData) {
  const playerIndex = mockPlayers.findIndex(player => player._id === id || player.id === id);
  
  if (playerIndex === -1) {
    return null;
  }
  
  const updatedPlayer = { ...mockPlayers[playerIndex], ...updateData };
  mockPlayers[playerIndex] = updatedPlayer;
  
  return updatedPlayer;
}

// Função para remover um jogador mock
export function deleteMockPlayer(id) {
  const playerIndex = mockPlayers.findIndex(player => player._id === id || player.id === id);
  
  if (playerIndex === -1) {
    return null;
  }
  
  const deletedPlayer = mockPlayers[playerIndex];
  mockPlayers.splice(playerIndex, 1);
  
  return deletedPlayer;
}

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