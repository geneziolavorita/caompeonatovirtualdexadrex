import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLAYERS_FILE_PATH = path.join(process.cwd(), 'data/players.json');
const GAMES_FILE_PATH = path.join(process.cwd(), 'data/games.json');

// Função auxiliar para ler o arquivo de jogadores
function readPlayersFile() {
  try {
    // Verifica se o arquivo existe
    if (!fs.existsSync(PLAYERS_FILE_PATH)) {
      console.log(`Arquivo de jogadores não encontrado em ${PLAYERS_FILE_PATH}`);
      return [];
    }
    
    // Lê o arquivo
    const fileContent = fs.readFileSync(PLAYERS_FILE_PATH, 'utf8');
    
    // Trata o caso de arquivo vazio
    if (!fileContent.trim()) {
      return [];
    }
    
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Erro ao ler arquivo de jogadores:', error);
    throw new Error(`Falha ao ler dados dos jogadores: ${error.message}`);
  }
}

// Função auxiliar para ler o arquivo de jogos
function readGamesFile() {
  try {
    // Verifica se o arquivo existe
    if (!fs.existsSync(GAMES_FILE_PATH)) {
      console.log(`Arquivo de jogos não encontrado em ${GAMES_FILE_PATH}`);
      return [];
    }
    
    // Lê o arquivo
    const fileContent = fs.readFileSync(GAMES_FILE_PATH, 'utf8');
    
    // Trata o caso de arquivo vazio
    if (!fileContent.trim()) {
      return [];
    }
    
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Erro ao ler arquivo de jogos:', error);
    throw new Error(`Falha ao ler dados dos jogos: ${error.message}`);
  }
}

// Função para calcular estatísticas de um jogador
function calculatePlayerStats(playerId) {
  try {
    const players = readPlayersFile();
    const player = players.find(p => p.id === playerId);
    
    if (!player) {
      throw new Error(`Jogador com ID ${playerId} não encontrado`);
    }
    
    const games = readGamesFile();
    const playerGames = games.filter(
      g => g.whitePlayer === playerId || g.blackPlayer === playerId
    );
    
    // Estatísticas básicas
    const totalGames = playerGames.length;
    const completedGames = playerGames.filter(g => g.result).length;
    const ongoingGames = totalGames - completedGames;
    
    // Estatísticas específicas
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let whiteGames = 0;
    let blackGames = 0;
    
    playerGames.forEach(game => {
      // Contar jogos como brancas e pretas
      if (game.whitePlayer === playerId) whiteGames++;
      if (game.blackPlayer === playerId) blackGames++;
      
      // Contar resultados apenas para jogos finalizados
      if (game.result) {
        if (game.result === 'draw') {
          draws++;
        } else if ((game.result === 'white' && game.whitePlayer === playerId) || 
                  (game.result === 'black' && game.blackPlayer === playerId)) {
          wins++;
        } else if ((game.result === 'black' && game.whitePlayer === playerId) || 
                  (game.result === 'white' && game.blackPlayer === playerId)) {
          losses++;
        }
      }
    });
    
    // Calcular porcentagens (evitar divisão por zero)
    const winRate = completedGames > 0 ? (wins / completedGames) * 100 : 0;
    const drawRate = completedGames > 0 ? (draws / completedGames) * 100 : 0;
    const lossRate = completedGames > 0 ? (losses / completedGames) * 100 : 0;
    
    // Calcular pontuação (1 ponto por vitória, 0.5 por empate)
    const points = wins + (draws * 0.5);
    
    // Adicionar dados do último jogo, se houver
    let lastGame = null;
    if (playerGames.length > 0) {
      // Ordenar jogos por data (mais recente primeiro)
      const sortedGames = [...playerGames].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      lastGame = sortedGames[0];
    }
    
    return {
      id: player.id,
      name: player.name,
      email: player.email,
      stats: {
        totalGames,
        completedGames,
        ongoingGames,
        wins,
        losses,
        draws,
        whiteGames,
        blackGames,
        winRate: parseFloat(winRate.toFixed(2)),
        drawRate: parseFloat(drawRate.toFixed(2)),
        lossRate: parseFloat(lossRate.toFixed(2)),
        points: parseFloat(points.toFixed(1))
      },
      lastGame: lastGame ? {
        id: lastGame.id,
        opponent: lastGame.whitePlayer === playerId ? lastGame.blackPlayer : lastGame.whitePlayer,
        result: lastGame.result,
        date: lastGame.updatedAt
      } : null
    };
  } catch (error) {
    console.error(`Erro ao calcular estatísticas para jogador ${playerId}:`, error);
    throw error;
  }
}

// Função para obter estatísticas de todos os jogadores
function getAllPlayersStats() {
  try {
    const players = readPlayersFile();
    const games = readGamesFile();
    
    return players.map(player => {
      const playerGames = games.filter(
        g => g.whitePlayer === player.id || g.blackPlayer === player.id
      );
      
      const totalGames = playerGames.length;
      const completedGames = playerGames.filter(g => g.result).length;
      const ongoingGames = totalGames - completedGames;
      
      let wins = 0;
      let losses = 0;
      let draws = 0;
      
      playerGames.forEach(game => {
        if (game.result) {
          if (game.result === 'draw') {
            draws++;
          } else if ((game.result === 'white' && game.whitePlayer === player.id) || 
                    (game.result === 'black' && game.blackPlayer === player.id)) {
            wins++;
          } else if ((game.result === 'black' && game.whitePlayer === player.id) || 
                    (game.result === 'white' && game.blackPlayer === player.id)) {
            losses++;
          }
        }
      });
      
      const winRate = completedGames > 0 ? (wins / completedGames) * 100 : 0;
      const points = wins + (draws * 0.5);
      
      return {
        id: player.id,
        name: player.name,
        totalGames,
        wins,
        draws,
        losses,
        winRate: parseFloat(winRate.toFixed(2)),
        points: parseFloat(points.toFixed(1))
      };
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de todos os jogadores:', error);
    throw error;
  }
}

export async function GET(request) {
  console.log('Recebendo requisição GET para /api/players/stats');
  
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    
    // Se um ID específico for fornecido, retorna as estatísticas desse jogador
    if (playerId) {
      console.log(`Buscando estatísticas para jogador ID: ${playerId}`);
      try {
        const playerStats = calculatePlayerStats(playerId);
        return NextResponse.json(playerStats);
      } catch (error) {
        console.log(`Erro ao buscar estatísticas para jogador ${playerId}:`, error.message);
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }
    
    // Caso contrário, retorna estatísticas resumidas de todos os jogadores
    console.log('Buscando estatísticas resumidas de todos os jogadores');
    const allStats = getAllPlayersStats();
    
    // Ordenar por pontos (do maior para o menor)
    allStats.sort((a, b) => b.points - a.points);
    
    return NextResponse.json(allStats);
  } catch (error) {
    console.error('Erro ao processar requisição GET para estatísticas:', error);
    
    return NextResponse.json(
      { error: 'Falha ao buscar estatísticas', details: error.message },
      { status: 500 }
    );
  }
} 