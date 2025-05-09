'use client';

import io, { Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { isBrowser } from "./clientUtils";

let socket: Socket | null = null;
let socketInitializationPromise: Promise<Socket> | null = null;

/**
 * URL do servidor Socket.IO
 */
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || (isBrowser ? window.location.origin : "");

/**
 * Interface para o evento de jogador entrando na sala
 */
export interface PlayerJoinedEvent {
  playerId: string;
  playerName: string;
  color?: "white" | "black";
  isReady?: boolean;
}

/**
 * Interface para o evento de início de jogo
 */
export interface GameStartedEvent {
  whitePlayer: {
    id: string;
    name: string;
  };
  blackPlayer: {
    id: string;
    name: string;
  };
  fen?: string;
  pgn?: string;
}

/**
 * Interface para o evento de movimento
 */
export interface MoveEvent {
  from: string;
  to: string;
  promotion?: string;
  fen: string;
  pgn: string;
}

/**
 * Interface para o evento de mensagem de chat
 */
export interface ChatMessageEvent {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

/**
 * Inicializa uma conexão Socket.IO com tratamento de erros
 * @returns Uma promessa que resolve para o socket ou rejeita com erro
 */
export async function initSocket(): Promise<Socket> {
  // Reutilizar a promessa existente se já estiver inicializando
  if (socketInitializationPromise) return socketInitializationPromise;

  socketInitializationPromise = new Promise(async (resolve, reject) => {
    try {
      // Se já temos um socket conectado, reutilizá-lo
      if (socket && socket.connected) {
        return resolve(socket);
      }
      
      // Primeiro, certifique-se de que o endpoint de socket está pronto
      try {
        const socketEndpointResponse = await fetch('/api/socket');
        if (!socketEndpointResponse.ok) {
          console.warn('Aviso: API de socket não respondeu corretamente. Tentando conectar diretamente.');
        }
      } catch (error) {
        console.warn('Aviso: Falha ao verificar endpoint de socket, tentando conectar diretamente.');
        // Continuar mesmo com erro, para tentar conectar diretamente
      }
      
      // Inicializar o socket com um timeout
      const connectTimeoutMs = 5000; // Reduzir o timeout para não bloquear por muito tempo
      let connectTimeout: NodeJS.Timeout;
      
      // Criar nova instância do socket
      socket = io({
        path: '/api/socket',
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 5000,
        autoConnect: true,
      });
      
      // Configurar timeout para conexão
      connectTimeout = setTimeout(() => {
        if (socket && !socket.connected) {
          socket.disconnect();
          const timeoutError = new Error('Tempo esgotado ao conectar ao servidor');
          console.warn(timeoutError.message);
          reject(timeoutError);
        }
      }, connectTimeoutMs);
      
      // Evento de conexão bem-sucedida
      socket.on('connect', () => {
        clearTimeout(connectTimeout);
        console.log('Conectado ao servidor Socket.IO');
        resolve(socket as Socket);
      });
      
      // Tratamento de erros
      socket.on('connect_error', (error) => {
        clearTimeout(connectTimeout);
        console.warn('Erro ao conectar ao Socket.IO:', error);
        reject(error);
      });
      
      socket.on('error', (error) => {
        console.warn('Erro no Socket.IO:', error);
        // Não rejeitamos aqui, pois este evento pode ocorrer após a conexão bem-sucedida
      });
      
      socket.on('disconnect', (reason) => {
        console.warn('Desconectado do Socket.IO:', reason);
      });
      
    } catch (error) {
      console.warn('Erro ao inicializar Socket.IO:', error);
      reject(error);
    }
  });

  try {
    return await socketInitializationPromise;
  } catch (error) {
    // Limpar a promessa em caso de erro para permitir novas tentativas
    socketInitializationPromise = null;
    throw error;
  }
}

/**
 * Desconecta o socket se estiver conectado
 */
export function disconnectSocket(): void {
  if (socket && socket.connected) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Obtém o socket atual ou inicializa um novo
 */
export async function getSocket(): Promise<Socket> {
  try {
    if (!socket || !socket.connected) {
      return await initSocket();
    }
    return socket;
  } catch (error) {
    console.warn('Falha ao obter socket:', error);
    throw error;
  }
}

/**
 * Verifica se o socket está conectado
 * @returns true se o socket estiver conectado
 */
export function isSocketConnected(): boolean {
  return !!socket?.connected;
}

/**
 * Entra em uma sala de jogo
 * @param roomId ID da sala de jogo
 * @param playerId ID do jogador
 * @param playerName Nome do jogador
 */
export async function joinRoom(roomId: string, playerId: string, playerName: string): Promise<void> {
  const socket = await getSocket();
  socket.emit("join-room", { roomId, playerId, playerName });
}

/**
 * Marca o jogador como pronto para iniciar o jogo
 * @param roomId ID da sala de jogo
 * @param playerId ID do jogador
 */
export async function setPlayerReady(roomId: string, playerId: string): Promise<void> {
  const socket = await getSocket();
  socket.emit("player-ready", { roomId, playerId });
}

/**
 * Envia um movimento de xadrez
 * @param roomId ID da sala de jogo
 * @param playerId ID do jogador
 * @param move O movimento a ser enviado
 */
export async function sendMove(roomId: string, playerId: string, move: Omit<MoveEvent, 'fen' | 'pgn'>): Promise<void> {
  const socket = await getSocket();
  socket.emit("make-move", { roomId, playerId, move });
}

/**
 * Envia uma mensagem de chat
 * @param roomId ID da sala de jogo
 * @param playerId ID do jogador
 * @param playerName Nome do jogador
 * @param message Conteúdo da mensagem
 */
export async function sendChatMessage(roomId: string, playerId: string, playerName: string, message: string): Promise<void> {
  const socket = await getSocket();
  socket.emit("chat-message", { roomId, playerId, playerName, message });
}

/**
 * Envia uma oferta de empate
 * @param roomId ID da sala de jogo
 * @param playerId ID do jogador que oferece o empate
 */
export async function offerDraw(roomId: string, playerId: string): Promise<void> {
  const socket = await getSocket();
  socket.emit("offer-draw", { roomId, playerId });
}

/**
 * Responde a uma oferta de empate
 * @param roomId ID da sala de jogo
 * @param playerId ID do jogador respondendo
 * @param accepted Se a oferta foi aceita ou não
 */
export async function respondToDraw(roomId: string, playerId: string, accepted: boolean): Promise<void> {
  const socket = await getSocket();
  socket.emit("respond-draw", { roomId, playerId, accepted });
}

/**
 * Abandona o jogo
 * @param roomId ID da sala de jogo
 * @param playerId ID do jogador desistindo
 */
export async function resignGame(roomId: string, playerId: string): Promise<void> {
  const socket = await getSocket();
  socket.emit("resign", { roomId, playerId });
}

/**
 * Solicita o estado atual do jogo
 * @param roomId ID da sala de jogo
 */
export async function requestGameState(roomId: string): Promise<void> {
  const socket = await getSocket();
  socket.emit("request-game-state", { roomId });
} 