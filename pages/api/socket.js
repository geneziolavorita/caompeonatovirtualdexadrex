import { Server } from 'socket.io';
import dbConnect from '../../lib/mongodb';

// Armazena as salas de jogo ativas
const gameRooms = new Map();

export default async function SocketHandler(req, res) {
  // Conectar ao MongoDB para operações com o banco de dados
  try {
    const dbResult = await dbConnect();
    
    if (dbResult.connectionFailed) {
      console.warn('Aviso: MongoDB não está conectado. O servidor Socket.IO continuará funcionando, mas sem persistência de dados.');
    } else {
      console.log('MongoDB conectado com sucesso para o servidor Socket.IO');
    }
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    console.warn('Continuando com o Socket.IO sem persistência de dados');
  }

  // Verificar se o Socket.IO já está inicializado
  if (res.socket.server.io) {
    console.log('Socket já está configurado');
    res.end();
    return;
  }

  // Inicializar o Socket.IO
  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Armazenar a instância do Socket.IO no objeto do servidor
  res.socket.server.io = io;

  // Manipular eventos de conexão de clientes
  io.on('connection', (socket) => {
    console.log(`Jogador conectado: ${socket.id}`);

    // Jogador entra em uma sala de jogo
    socket.on('join-game', ({ roomId, playerId, playerName }) => {
      console.log(`Jogador ${playerName} (${playerId}) está entrando na sala ${roomId}`);
      
      // Entrar na sala Socket.IO
      socket.join(roomId);
      
      // Se a sala não existir, criar nova sala
      if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, {
          id: roomId,
          players: [],
          currentGame: null,
          gameStarted: false,
          spectators: [],
          messages: [] // Armazenar histórico de mensagens
        });
      }
      
      const room = gameRooms.get(roomId);
      
      // Verificar se o jogador pode entrar na partida
      if (room.players.length < 2 && !room.players.find(p => p.id === playerId)) {
        // Adicionar jogador à sala
        const playerColor = room.players.length === 0 ? 'white' : 'black';
        const player = { 
          id: playerId, 
          name: playerName, 
          color: playerColor, 
          socketId: socket.id,
          connected: true
        };
        
        room.players.push(player);
        
        // Informar o jogador sobre sua cor
        socket.emit('color-assigned', { color: playerColor });
        
        // Notificar todos na sala sobre o novo jogador
        io.to(roomId).emit('player-joined', { 
          player,
          players: room.players,
          gameStarted: room.gameStarted
        });
        
        // Se dois jogadores entraram, iniciar o jogo
        if (room.players.length === 2) {
          room.gameStarted = true;
          io.to(roomId).emit('game-start', { 
            players: room.players,
            initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // Posição inicial do xadrez
          });
        }
      } else if (room.players.find(p => p.id === playerId)) {
        // Jogador reconectando
        const player = room.players.find(p => p.id === playerId);
        
        // Atualizar socketId e status de conexão
        player.socketId = socket.id;
        player.connected = true;
        
        socket.emit('color-assigned', { color: player.color });
        
        // Se o jogo já começou, enviar o estado atual
        if (room.gameStarted && room.currentGame) {
          socket.emit('game-state', { 
            fen: room.currentGame.fen,
            players: room.players,
            gameStarted: true
          });
        }
        
        // Enviar o histórico de mensagens para o jogador reconectado
        if (room.messages && room.messages.length > 0) {
          room.messages.forEach(msg => {
            socket.emit('chat-message', msg);
          });
        }
      } else {
        // Sala cheia, jogador vira espectador
        const spectator = { 
          id: playerId, 
          name: playerName, 
          socketId: socket.id,
          connected: true 
        };
        
        room.spectators.push(spectator);
        socket.emit('spectator-mode');
        
        // Enviar estado atual para o espectador
        if (room.gameStarted && room.currentGame) {
          socket.emit('game-state', { 
            fen: room.currentGame.fen,
            players: room.players,
            gameStarted: true,
            asSpectator: true
          });
        }
        
        // Enviar o histórico de mensagens para o espectador
        if (room.messages && room.messages.length > 0) {
          room.messages.forEach(msg => {
            socket.emit('chat-message', msg);
          });
        }
      }
    });

    // Jogador faz um movimento
    socket.on('move', ({ roomId, move, playerId, fen }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      // Atualizar o estado do jogo
      room.currentGame = { ...room.currentGame, fen };
      
      // Transmitir o movimento para todos os jogadores na sala
      socket.to(roomId).emit('move-made', { 
        move, 
        playerId, 
        fen
      });
    });

    // Jogador envia mensagem no chat
    socket.on('chat-message', ({ roomId, message, playerName }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      // Criar objeto de mensagem
      const messageObject = {
        message,
        playerName,
        timestamp: new Date().toISOString()
      };
      
      // Armazenar mensagem no histórico da sala
      if (!room.messages) {
        room.messages = [];
      }
      
      // Limitar o histórico a 100 mensagens
      if (room.messages.length >= 100) {
        room.messages.shift(); // Remove a mensagem mais antiga
      }
      
      room.messages.push(messageObject);
      
      // Transmitir para todos na sala
      io.to(roomId).emit('chat-message', messageObject);
    });

    // Jogador propõe empate
    socket.on('offer-draw', ({ roomId, playerId }) => {
      socket.to(roomId).emit('draw-offered', { playerId });
    });

    // Jogador responde à proposta de empate
    socket.on('respond-to-draw', ({ roomId, accepted, playerId }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      if (accepted) {
        // Finalizar o jogo como empate
        io.to(roomId).emit('game-end', { 
          result: 'draw',
          message: 'Jogo terminou em empate por acordo mútuo'
        });
      } else {
        // Notificar que o empate foi recusado
        socket.to(roomId).emit('draw-declined', { playerId });
      }
    });

    // Jogador desiste
    socket.on('resign', ({ roomId, playerId }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      const resigningPlayer = room.players.find(p => p.id === playerId);
      const winner = room.players.find(p => p.id !== playerId);
      
      if (resigningPlayer && winner) {
        // Finalizar o jogo com vitória do oponente
        io.to(roomId).emit('game-end', { 
          result: 'resignation',
          winnerId: winner.id,
          message: `${resigningPlayer.name} desistiu. ${winner.name} venceu a partida!`
        });
      }
    });

    // Jogo terminou (xeque-mate, afogamento, etc)
    socket.on('game-over', ({ roomId, result, winnerId }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      let message = '';
      if (result === 'checkmate') {
        const winner = room.players.find(p => p.id === winnerId);
        message = `Xeque-mate! ${winner?.name || 'Jogador'} venceu a partida!`;
      } else if (result === 'stalemate') {
        message = 'Afogamento! O jogo terminou em empate.';
      } else if (result === 'threefold') {
        message = 'Empate por tripla repetição de posição!';
      } else if (result === 'insufficient') {
        message = 'Empate por material insuficiente!';
      } else if (result === 'fifty-move') {
        message = 'Empate pela regra dos cinquenta movimentos!';
      } else {
        message = 'O jogo terminou!';
      }
      
      // Notificar todos sobre o fim do jogo
      io.to(roomId).emit('game-end', { result, winnerId, message });
    });

    // Jogador saiu do jogo
    socket.on('disconnect', () => {
      console.log(`Jogador desconectado: ${socket.id}`);
      
      // Encontrar em qual sala o jogador estava
      for (const [roomId, room] of gameRooms.entries()) {
        // Verificar jogadores
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          console.log(`Jogador ${player.name} (${player.id}) desconectou da sala ${roomId}`);
          
          // Marcar como desconectado
          player.connected = false;
          
          // Notificar os outros jogadores da sala
          io.to(roomId).emit('player-disconnected', {
            playerId: player.id,
            playerName: player.name
          });
          
          break;
        }
        
        // Verificar espectadores
        const spectatorIndex = room.spectators?.findIndex(s => s.socketId === socket.id);
        if (spectatorIndex !== -1) {
          room.spectators[spectatorIndex].connected = false;
        }
      }
    });
  });

  console.log('Configuração do Socket.IO concluída');
  res.end();
} 