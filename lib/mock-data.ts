export const mockPlayers = [
  {
    _id: '1',
    nome: 'Jogador 1',
    name: 'Player 1',
    pontuacao: 1000,
    jogos: 10,
    vitorias: 5,
    derrotas: 3,
    empates: 2
  },
  {
    _id: '2',
    nome: 'Jogador 2',
    name: 'Player 2',
    pontuacao: 950,
    jogos: 8,
    vitorias: 4,
    derrotas: 2,
    empates: 2
  },
  {
    _id: '3',
    nome: 'Jogador 3',
    name: 'Player 3',
    pontuacao: 800,
    jogos: 5,
    vitorias: 2,
    derrotas: 2,
    empates: 1
  }
];

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