'use client';

import React, { useState, useEffect } from 'react';

interface PlayerRegistrationProps {
  onPlayerRegistered: (player: { id: string; name: string; email?: string }) => void;
}

export default function PlayerRegistration({ onPlayerRegistered }: PlayerRegistrationProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [detailedError, setDetailedError] = useState<string | null>(null);

  // Verificar a conectividade do servidor ao carregar o componente
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        console.log('Verificando status do servidor...');
        const response = await fetch('/api/status', { 
          method: 'GET',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Servidor está online:', data);
          setServerStatus('online');
          setIsOfflineMode(false);
        } else {
          console.log('Servidor respondeu com erro:', response.status);
          setServerStatus('offline');
          setIsOfflineMode(true);
        }
      } catch (err) {
        console.error('Erro ao verificar status do servidor:', err);
        setServerStatus('offline');
        setIsOfflineMode(true);
      }
    };

    checkServerStatus();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
    setDetailedError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }
    
    // Limpar mensagens anteriores
    clearMessages();
    setLoading(true);
    console.log(`Tentando registrar jogador: ${name}${email ? `, email: ${email}` : ''}`);

    try {
      // Tenta registrar online
      if (!isOfflineMode) {
        try {
          console.log(`Enviando requisição para /api/players com dados:`, { name, email });
          
          // Verificar se a API está acessível antes de enviar os dados
          const statusCheck = await fetch('/api/status', { 
            method: 'GET',
            cache: 'no-store'
          }).catch(e => {
            console.error('Erro ao verificar status antes de enviar:', e);
            throw new Error('Servidor não está respondendo. Tente o modo offline.');
          });
          
          if (!statusCheck.ok) {
            throw new Error('Servidor não está respondendo corretamente. Tente o modo offline.');
          }
          
          // Enviar a requisição de registro
          const response = await fetch('/api/players', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ name, email }),
          });
          
          console.log(`Resposta recebida com status: ${response.status}`);
          
          // Tentar obter o corpo da resposta
          let data;
          try {
            data = await response.json();
            console.log('Dados recebidos:', data);
          } catch (jsonError) {
            console.error('Erro ao processar resposta JSON:', jsonError);
            throw new Error('Erro ao processar resposta do servidor');
          }

          if (response.ok) {
            setSuccess('Jogador registrado com sucesso!');
            onPlayerRegistered(data);
            // Limpar o formulário após sucesso
            setName('');
            setEmail('');
            return;
          } else {
            // Extrair a mensagem de erro da resposta
            const errorMsg = data.error || data.details || `Falha no registro (Status ${response.status})`;
            console.error('Erro retornado pelo servidor:', errorMsg);
            
            // Armazenar detalhes adicionais do erro, se disponíveis
            if (data.details) {
              setDetailedError(data.details);
            }
            
            throw new Error(errorMsg);
          }
        } catch (err) {
          console.error('Erro na comunicação com servidor:', err);
          
          // Se for um erro de rede, sugerir mudar para modo offline
          if (err instanceof Error && (
            err.message.includes('Failed to fetch') || 
            err.message.includes('NetworkError') ||
            err.message.includes('offline') ||
            err.message.includes('não está respondendo')
          )) {
            setIsOfflineMode(true);
            throw new Error(`Erro de conexão: ${err.message}. Mudando para modo offline.`);
          }
          
          throw err; // Propagar o erro para o catch externo
        }
      } else {
        // Modo offline - gera um ID local e simula o registro
        console.log('Usando modo offline para registro');
        const mockPlayer = {
          id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name,
          email: email || undefined,
          createdAt: new Date().toISOString()
        };
        
        setSuccess('Jogador registrado localmente (modo offline). Os dados serão sincronizados quando a conexão for restaurada.');
        console.log('Jogador registrado localmente:', mockPlayer);
        
        // Simular um atraso para parecer mais real
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Importante: sempre chamar onPlayerRegistered para atualizar a UI
        onPlayerRegistered(mockPlayer);
        setName('');
        setEmail('');
      }
    } catch (error) {
      console.error('Erro durante o registro do jogador:', error);
      
      if (error instanceof Error) {
        setError(`Erro: ${error.message}`);
      } else {
        setError('Ocorreu um erro desconhecido durante o registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    clearMessages();
    setSuccess(isOfflineMode ? 'Modo online ativado' : 'Modo offline ativado');
  };

  const retryConnection = async () => {
    setServerStatus('checking');
    clearMessages();
    
    try {
      const response = await fetch('/api/status', { 
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        setServerStatus('online');
        setIsOfflineMode(false);
        setSuccess('Conexão com o servidor restaurada!');
      } else {
        setServerStatus('offline');
        setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
      }
    } catch (err) {
      setServerStatus('offline');
      setError('Falha ao verificar a conexão com o servidor.');
    }
  };

  return (
    <div className="bg-wood-light p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-wood-dark text-center">
        Registrar Jogador {isOfflineMode && "(Modo Offline)"}
      </h2>
      
      {serverStatus === 'checking' && (
        <div className="mb-4 text-blue-500 text-sm bg-blue-50 p-2 rounded border border-blue-200">
          Verificando conexão com o servidor...
        </div>
      )}
      
      {serverStatus === 'offline' && !isOfflineMode && (
        <div className="mb-4 text-yellow-500 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
          Aviso: Servidor parece estar offline. Considere usar o modo offline.
          <button 
            onClick={retryConnection}
            className="ml-2 text-blue-500 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-wood-dark mb-1">
            Nome do Jogador *
          </label>
          <input
            placeholder="Digite o nome do jogador"
            className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-wood-dark mb-1">
            Email (opcional)
          </label>
          <input
            placeholder="email@exemplo.com"
            className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
            {error}
            {detailedError && (
              <div className="mt-2 text-xs text-red-400 p-1 bg-red-100 rounded">
                Detalhes: {detailedError}
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="mb-4 text-green-500 text-sm bg-green-50 p-3 rounded border border-green-200">
            {success}
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          <button
            type="submit"
            className="w-full bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium focus:outline-none focus:ring-2 focus:ring-wood-dark disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </span>
            ) : 'Registrar Jogador'}
          </button>
          
          <button
            type="button"
            onClick={toggleOfflineMode}
            className="w-full border border-wood-medium text-wood-dark py-1 px-4 rounded-md text-sm hover:bg-wood-lightest focus:outline-none"
          >
            {isOfflineMode ? 'Tentar Modo Online' : 'Usar Modo Offline'}
          </button>
        </div>
      </form>
    </div>
  );
} 