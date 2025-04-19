import { Chess } from 'chess.js';
import { saveGameResult } from '../lib/gameUtils';

async function testGameUtils() {
  // Criar um jogo de exemplo
  const game = new Chess();
  
  // Fazer alguns movimentos
  game.move('e4');
  game.move('e5');
  game.move('Nf3');
  game.move('Nc6');
  game.move('Bb5');
  game.move('a6');
  game.move('Ba4');
  game.move('Nf6');
  game.move('O-O');
  game.move('Be7');
  game.move('Re1');
  game.move('b5');
  game.move('Bb3');
  game.move('d6');
  game.move('c3');
  game.move('O-O');
  game.move('h3');
  game.move('Nb8');
  game.move('d4');
  game.move('Nbd7');
  
  // Testar salvamento do jogo
  const result = await saveGameResult(
    game,
    '1', // whitePlayer
    '2', // blackPlayer
    'Jogador 1', // whitePlayerName
    'Jogador 2', // blackPlayerName
    new Date() // startTime
  );
  
  console.log('Resultado do teste:', result);
  
  // Verificar se o jogo foi salvo localmente
  const localGames = JSON.parse(localStorage.getItem('localGames') || '[]');
  console.log('Jogos salvos localmente:', localGames);
}

// Executar o teste
testGameUtils().catch(console.error); 