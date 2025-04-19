'use client';

import io, { Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

let socket: Socket | null = null;

/**
 * Inicializa uma conexão Socket.IO com tratamento de erros
 * @returns Uma promessa que resolve para o socket ou rejeita com erro
 */
export async function initSocket(): Promise<Socket> {
  return new Promise(async (resolve, reject) => {
    try {
      // Se já temos um socket conectado, reutilizá-lo
      if (socket && socket.connected) {
        return resolve(socket);
      }
      
      // Primeiro, certifique-se de que o endpoint de socket está pronto
      try {
        const socketEndpointResponse = await fetch('/api/socket');
        if (!socketEndpointResponse.ok) {
          throw new Error('Falha ao inicializar o servidor de socket');
        }
      } catch (error) {
        console.error('Erro ao verificar endpoint de socket:', error);
        // Continuar mesmo com erro, para tentar conectar diretamente
      }
      
      // Inicializar o socket com um timeout
      const connectTimeoutMs = 8000;
      let connectTimeout: NodeJS.Timeout;
      
      // Criar nova instância do socket
      socket = io({
        path: '/api/socket',
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        autoConnect: true,
      });
      
      // Configurar timeout para conexão
      connectTimeout = setTimeout(() => {
        if (socket && !socket.connected) {
          socket.disconnect();
          reject(new Error('Tempo esgotado ao conectar ao servidor'));
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
        console.error('Erro ao conectar ao Socket.IO:', error);
        reject(error);
      });
      
      socket.on('error', (error) => {
        console.error('Erro no Socket.IO:', error);
        // Não rejeitamos aqui, pois este evento pode ocorrer após a conexão bem-sucedida
        toast.error('Erro de conexão com o servidor');
      });
      
      socket.on('disconnect', (reason) => {
        console.warn('Desconectado do Socket.IO:', reason);
        toast.error('Conexão com o servidor perdida');
      });
      
    } catch (error) {
      console.error('Erro ao inicializar Socket.IO:', error);
      reject(error);
    }
  });
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
  if (!socket || !socket.connected) {
    return initSocket();
  }
  return socket;
} 