'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Carregar componentes de forma dinâmica sem SSR
const ChessboardComponent = dynamic(() => import('../components/Chessboard'), { ssr: false });
const PlayerSelectComponent = dynamic(() => import('../components/PlayerSelect'), { ssr: false });
const TournamentRankingComponent = dynamic(() => import('../components/TournamentRanking'), { ssr: false });
const PlayerRegistrationComponent = dynamic(() => import('../components/PlayerRegistration'), { ssr: false });

export default function Home() {
  const [view, setView] = useState('home');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-wood-dark">CAMPEONATO VIRTUAL DE XADREZ</h2>
        <h3 className="text-lg font-medium text-wood-dark">EEB PROFESSOR PEDRO TEIXEIRA BARROSO - ITAPIPOCA CEARÁ</h3>
      </div>
      
      <h1 className="text-4xl font-bold text-center mb-4 text-wood-dark">XADREX</h1>
      
      <div className="text-center mb-8">
        <p className="text-sm text-wood-dark">Orientação e Desenvolvimento: Professor Genezio de Lavor</p>
      </div>
      
      <div className="flex space-x-4 justify-center mb-6">
        <button 
          onClick={() => setView('home')}
          className="bg-wood-dark text-white px-4 py-2 rounded hover:bg-wood-medium"
        >
          Início
        </button>
        <button 
          onClick={() => setView('ranking')}
          className="bg-wood-dark text-white px-4 py-2 rounded hover:bg-wood-medium"
        >
          Ver Ranking
        </button>
        <button 
          onClick={() => setView('register')}
          className="bg-wood-dark text-white px-4 py-2 rounded hover:bg-wood-medium"
        >
          Registrar Jogador
        </button>
      </div>
      
      {view === 'home' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Campeonato de Xadrez</h2>
          <p className="mb-4">Selecione uma opção no menu acima para começar.</p>
        </div>
      )}
      
      {view === 'ranking' && (
        <TournamentRankingComponent />
      )}
      
      {view === 'register' && (
        <PlayerRegistrationComponent onPlayerRegistered={() => setView('ranking')} />
      )}
    </div>
  );
} 