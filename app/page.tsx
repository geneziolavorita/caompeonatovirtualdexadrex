'use client'

import { useState, useEffect, useRef } from 'react'
import Chessboard from '@/components/Chessboard'
import GameControls from '@/components/GameControls'
import PlayerInfo from '@/components/PlayerInfo'
import PlayerRegistration from '@/components/PlayerRegistration'
import TournamentRanking from '@/components/TournamentRanking'
import PlayerSelect from '@/components/PlayerSelect'
import { Chess } from 'chess.js'
import { saveGameResult } from '@/lib/gameUtils'
import CreateGameRoom from '@/components/CreateGameRoom'
import Link from 'next/link'
import type { Player } from '@/components/PlayerSelect'

// Componente de ícone para tela cheia
const FullscreenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414L9 8.586V7a1 1 0 112 0v4a1 1 0 01-1 1H6a1 1 0 110-2h1.586L4 6.414V8a1 1 0 01-2 0V4z" />
    <path d="M17 16a1 1 0 01-1 1h-4a1 1 0 010-2h2.586L11 11.414V13a1 1 0 11-2 0V9a1 1 0 011-1h4a1 1 0 110 2h-2.586L15 13.586V12a1 1 0 012 0v4z" />
  </svg>
);

// Componente de ícone para sair da tela cheia
const ExitFullscreenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 3a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 5.414V7a1 1 0 11-2 0V3z" />
    <path d="M17 17a1 1 0 01-1 1h-4a1 1 0 010-2h2.586l-2.293-2.293a1 1 0 011.414-1.414L16 14.586V13a1 1 0 112 0v4z" />
  </svg>
);

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8 m-4">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Campeonato Virtual de Xadrez
        </h1>
        
        <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-lg text-center text-gray-800">
            Bem-vindo ao nosso campeonato de xadrez online! Aqui você pode competir 
            com outros jogadores, acompanhar sua classificação e melhorar suas habilidades.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/leaderboard" className="bg-blue-600 hover:bg-blue-700 text-white text-center py-4 px-6 rounded-lg shadow transition-colors duration-200">
            Ver Classificação
          </Link>
          <Link href="/game/lobby" className="bg-green-600 hover:bg-green-700 text-white text-center py-4 px-6 rounded-lg shadow transition-colors duration-200">
            Jogar Agora
          </Link>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sobre o Campeonato</h2>
          <p className="text-gray-600">
            Nosso campeonato utiliza regras oficiais de xadrez e oferece um ambiente 
            competitivo amigável para jogadores de todos os níveis. Participe de partidas, 
            acompanhe suas estatísticas e melhore seu jogo!
          </p>
        </div>
      </div>
    </div>
  );
} 