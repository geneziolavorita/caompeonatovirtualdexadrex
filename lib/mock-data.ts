/**
 * mock-data.ts
 * Dados simulados para uso quando o servidor está offline
 */

/**
 * Jogadores simulados para o modo offline
 */
export const mockPlayers = [
  {
    _id: 'mock-player-1',
    nome: 'Carlos Magno',
    name: 'Carlos Magno',
    email: 'carlos@example.com',
    pontuacao: 1500,
    jogos: 25,
    vitorias: 15,
    derrotas: 8,
    empates: 2
  },
  {
    _id: 'mock-player-2',
    nome: 'Maria Silva',
    name: 'Maria Silva',
    email: 'maria@example.com',
    pontuacao: 1650,
    jogos: 42,
    vitorias: 24,
    derrotas: 12,
    empates: 6
  },
  {
    _id: 'mock-player-3',
    nome: 'João Pereira',
    name: 'João Pereira',
    email: 'joao@example.com',
    pontuacao: 1420,
    jogos: 16,
    vitorias: 7,
    derrotas: 7,
    empates: 2
  }
];

/**
 * Função para obter jogadores simulados
 * @returns Array de jogadores simulados
 */
export function getMockPlayers() {
  return [...mockPlayers];
}

/**
 * Função para encontrar um jogador simulado por ID
 * @param id ID do jogador
 * @returns Jogador encontrado ou undefined
 */
export function getMockPlayerById(id: string) {
  return mockPlayers.find(player => player._id === id);
}

/**
 * Função para simular a classificação dos jogadores (ranking)
 * @returns Array de jogadores ordenados por pontuação
 */
export function getMockRanking() {
  return [...mockPlayers].sort((a, b) => b.pontuacao - a.pontuacao);
}

export const mockGames = [
  {
    _id: '1',
    whitePlayer: '1',
    blackPlayer: '2',
    whitePlayerName: 'Jogador 1',
    blackPlayerName: 'Jogador 2',
    result: 'white',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7'],
    startTime: new Date('2024-03-20T10:00:00'),
    endTime: new Date('2024-03-20T10:30:00')
  },
  {
    _id: '2',
    whitePlayer: '2',
    blackPlayer: '3',
    whitePlayerName: 'Jogador 2',
    blackPlayerName: 'Jogador 3',
    result: 'draw',
    pgn: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6', 'Bh4', 'b6'],
    startTime: new Date('2024-03-20T11:00:00'),
    endTime: new Date('2024-03-20T11:45:00')
  }
]; 