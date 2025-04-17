import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAYERS_FILE_PATH = path.join(process.cwd(), 'data/players.json');
const GAMES_FILE_PATH = path.join(process.cwd(), 'data/games.json');

// Rota para verificar o status do servidor e da aplicação
export async function GET() {
  try {
    console.log('API: Verificando status do servidor');
    
    // Verificar existência dos arquivos de dados
    const filesStatus = {
      playersFileExists: fs.existsSync(PLAYERS_FILE_PATH),
      gamesFileExists: fs.existsSync(GAMES_FILE_PATH)
    };
    
    // Tentar ler os arquivos de dados para testar acesso
    let playersFileAccess = false;
    let gamesFileAccess = false;
    let playersCount = 0;
    let gamesCount = 0;
    
    try {
      if (filesStatus.playersFileExists) {
        const playersData = fs.readFileSync(PLAYERS_FILE_PATH, 'utf8');
        if (playersData && playersData.trim()) {
          const players = JSON.parse(playersData);
          playersCount = Array.isArray(players) ? players.length : 0;
          playersFileAccess = true;
        }
      }
    } catch (err) {
      console.error('Erro ao ler arquivo de jogadores:', err);
    }
    
    try {
      if (filesStatus.gamesFileExists) {
        const gamesData = fs.readFileSync(GAMES_FILE_PATH, 'utf8');
        if (gamesData && gamesData.trim()) {
          const games = JSON.parse(gamesData);
          gamesCount = Array.isArray(games) ? games.length : 0;
          gamesFileAccess = true;
        }
      }
    } catch (err) {
      console.error('Erro ao ler arquivo de jogos:', err);
    }
    
    // Criar um ID único para esse check
    const checkId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    
    return NextResponse.json({
      status: 'online',
      checkId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      files: {
        ...filesStatus,
        playersFileAccess,
        gamesFileAccess,
        playersCount,
        gamesCount
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status do servidor:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 