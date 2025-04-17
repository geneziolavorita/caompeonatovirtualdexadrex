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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }
    
    setError('');
    setLoading(true);
    console.log(`Tentando registrar jogador: ${name}${email ? `, email: ${email}` : ''}`);

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

      if (!response.ok) {
        throw new Error(data.error || `Falha no registro (Status ${response.status})`);
      }

      console.log('Jogador registrado com sucesso:', data);
      onPlayerRegistered(data);
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Erro durante o registro do jogador:', error);
      
      if (error instanceof Error) {
        setError(`Erro: ${error.message}`);
      } else {
        setError('Ocorreu um erro desconhecido durante o registro.');
      }
      
      // Simulação local para testes se necessário (descomente se precisar testar sem backend)
      /* 
      console.log('Simulando registro local devido a erro de servidor');
      const mockPlayer = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date().toISOString(),
      };
      onPlayerRegistered(mockPlayer);
      setName('');
      setEmail('');
      */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-wood-light p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-wood-dark text-center">
        Registrar Jogador
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
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium focus:outline-none focus:ring-2 focus:ring-wood-dark disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
} 