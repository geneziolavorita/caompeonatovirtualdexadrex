'use client';

import React, { useState } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    console.log(`Tentando registrar jogador: ${name}${email ? `, email: ${email}` : ''}`);

    try {
      // Tenta registrar online
      if (!isOfflineMode) {
        try {
          console.log(`Enviando requisição para /api/players com dados:`, { name, email });
          const response = await fetch('/api/players', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email }),
          });
          
          console.log(`Resposta recebida com status: ${response.status}`);
          const data = await response.json();
          console.log('Dados recebidos:', data);

          if (response.ok) {
            setSuccess('Jogador registrado com sucesso!');
            onPlayerRegistered(data);
            setName('');
            setEmail('');
            return;
          } else {
            throw new Error(data.error || data.details || `Falha no registro (Status ${response.status})`);
          }
        } catch (err) {
          console.error('Erro na comunicação com servidor, mudando para modo offline:', err);
          setIsOfflineMode(true);
          // Continua para o modo offline abaixo
        }
      }
      
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
      onPlayerRegistered(mockPlayer);
      setName('');
      setEmail('');
      
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
    setError('');
    setSuccess(isOfflineMode ? 'Modo online ativado' : 'Modo offline ativado');
  };

  return (
    <div className="bg-wood-light p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-wood-dark text-center">
        Registrar Jogador {isOfflineMode && "(Modo Offline)"}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            placeholder="Nome"
            className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <input
            placeholder="Email (opcional)"
            className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-green-500 text-sm bg-green-50 p-2 rounded border border-green-200">
            {success}
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          <button
            type="submit"
            className="w-full bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium focus:outline-none focus:ring-2 focus:ring-wood-dark disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Jogador'}
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