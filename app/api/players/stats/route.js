import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { connectToDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getMockPlayerById, mockPlayers, mockGames } from '@/lib/mock-data';

// Para exportação estática, não podemos usar force-dynamic
// export const dynamic = 'force-dynamic';
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

// Função para calcular estatísticas de um jogador diretamente do MongoDB
async function calculatePlayerStatsFromMongo(playerId) {
  try {
    const { db } = await connectToDB();
    if (!db) {
      throw new Error('Não foi possível conectar ao MongoDB');
    }
    
    // Tentar converter para ObjectId se necessário
    let query;
    try {
      if (/^[0-9a-fA-F]{24}$/.test(playerId)) {
        query = { $or: [{ _id: new ObjectId(playerId) }, { id: playerId }] };
      } else {
        query = { $or: [{ _id: playerId }, { id: playerId }] };
      }
    } catch (idErr) {
      query = { $or: [{ _id: playerId }, { id: playerId }] };
    }
    
    const player = await db.collection('players').findOne(query);
    
    if (!player) {
      throw new Error(`Jogador com ID ${playerId} não encontrado`);
    }
    
    // Buscar jogos deste jogador
    const games = await db.collection('games').find({
      $or: [
        { brancasId: playerId.toString() },
        { pretasId: playerId.toString() },
        { brancasId: player._id.toString() },
        { pretasId: player._id.toString() }
      ]
    }).toArray();
    
    // Calcular estatísticas
    const totalGames = games.length;
    const completedGames = games.filter(g => g.resultado && g.resultado !== 'em_andamento').length;
    const ongoingGames = totalGames - completedGames;
    
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let whiteGames = 0;
    let blackGames = 0;
    
    const playerId_str = playerId.toString();
    const player_id_str = player._id.toString();
    
    games.forEach(game => {
      // Contar jogos como brancas e pretas
      if (game.brancasId === playerId_str || game.brancasId === player_id_str) whiteGames++;
      if (game.pretasId === playerId_str || game.pretasId === player_id_str) blackGames++;
      
      // Contar resultados apenas para jogos finalizados
      if (game.resultado && game.resultado !== 'em_andamento') {
        if (game.resultado === 'empate') {
          draws++;
        } else if ((game.resultado === 'vitoria_brancas' && (game.brancasId === playerId_str || game.brancasId === player_id_str)) || 
                  (game.resultado === 'vitoria_pretas' && (game.pretasId === playerId_str || game.pretasId === player_id_str))) {
          wins++;
        } else {
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
    if (games.length > 0) {
      // Ordenar jogos por data (mais recente primeiro)
      const sortedGames = [...games].sort(
        (a, b) => new Date(b.data_fim || b.data_inicio) - new Date(a.data_fim || a.data_inicio)
      );
      lastGame = sortedGames[0];
    }
    
    return {
      id: player._id.toString(),
      name: player.nome || player.name,
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
        id: lastGame._id.toString(),
        opponent: lastGame.brancasId === player._id.toString() ? lastGame.pretasNome : lastGame.brancasNome,
        result: lastGame.resultado,
        date: lastGame.data_fim || lastGame.data_inicio
      } : null
    };
  } catch (error) {
    console.error(`Erro ao calcular estatísticas para jogador ${playerId} no MongoDB:`, error);
    throw error;
  }
}

// Função para calcular estatísticas de um jogador a partir de arquivos
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

// Função para calcular estatísticas de um jogador mock
function calculateMockPlayerStats(playerId) {
  try {
    const player = getMockPlayerById(playerId);
    
    if (!player) {
      throw new Error(`Jogador com ID ${playerId} não encontrado`);
    }
    
    const playerGames = mockGames.filter(
      g => g.whitePlayer === playerId || g.blackPlayer === playerId
    );
    
    // Usar os dados que já existem no mockPlayer para estatísticas básicas
    return {
      id: player._id,
      name: player.name,
      email: player.email,
      stats: {
        totalGames: player.jogos,
        completedGames: player.jogos,
        ongoingGames: 0,
        wins: player.vitorias,
        losses: player.derrotas,
        draws: player.empates,
        whiteGames: Math.floor(player.jogos / 2),
        blackGames: Math.ceil(player.jogos / 2),
        winRate: player.jogos > 0 ? (player.vitorias / player.jogos) * 100 : 0,
        drawRate: player.jogos > 0 ? (player.empates / player.jogos) * 100 : 0,
        lossRate: player.jogos > 0 ? (player.derrotas / player.jogos) * 100 : 0,
        points: player.pontuacao
      },
      lastGame: playerGames.length > 0 ? {
        id: playerGames[0]._id,
        opponent: playerGames[0].whitePlayer === playerId ? 
                  playerGames[0].blackPlayerName : 
                  playerGames[0].whitePlayerName,
        result: playerGames[0].result,
        date: playerGames[0].endTime
      } : null
    };
  } catch (error) {
    console.error(`Erro ao calcular estatísticas mock para jogador ${playerId}:`, error);
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

// GET - Obter estatísticas
export async function GET(request) {
  console.log('Recebendo requisição GET para /api/players/stats');
  
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    
    // Se um ID específico for fornecido, retorna as estatísticas desse jogador
    if (playerId) {
      console.log(`Buscando estatísticas para jogador ID: ${playerId}`);
      
      try {
        // Tentar buscar do MongoDB primeiro
        try {
          const statsFromMongo = await calculatePlayerStatsFromMongo(playerId);
          console.log('Estatísticas obtidas do MongoDB');
          return NextResponse.json(statsFromMongo);
        } catch (mongoError) {
          console.log('Falha ao obter estatísticas do MongoDB:', mongoError.message);
          
          // Tentar ler dos arquivos
          try {
            const statsFromFiles = calculatePlayerStats(playerId);
            console.log('Estatísticas obtidas dos arquivos');
            return NextResponse.json(statsFromFiles);
          } catch (fileError) {
            console.log('Falha ao obter estatísticas dos arquivos:', fileError.message);
            
            // Finalmente, tentar dados mockados
            const mockStats = calculateMockPlayerStats(playerId);
            console.log('Estatísticas obtidas dos dados mockados');
            return NextResponse.json(mockStats);
          }
        }
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
    
    // Tentar obter do MongoDB primeiro
    try {
      const { db } = await connectToDB();
      if (db) {
        const players = await db.collection('players').find({}).toArray();
        
        if (players && players.length > 0) {
          const stats = await Promise.all(players.map(async (player) => {
            try {
              const playerStats = await calculatePlayerStatsFromMongo(player._id.toString());
              return {
                id: player._id.toString(),
                name: player.nome || player.name,
                totalGames: playerStats.stats.totalGames,
                wins: playerStats.stats.wins,
                draws: playerStats.stats.draws,
                losses: playerStats.stats.losses,
                winRate: playerStats.stats.winRate,
                points: playerStats.stats.points
              };
            } catch (err) {
              // Se falhar, retorna dados básicos
              return {
                id: player._id.toString(),
                name: player.nome || player.name,
                totalGames: player.jogos || 0,
                wins: player.vitorias || 0,
                draws: player.empates || 0,
                losses: player.derrotas || 0,
                winRate: player.jogos > 0 ? (player.vitorias / player.jogos) * 100 : 0,
                points: player.pontuacao || 0
              };
            }
          }));
          
          // Ordenar por pontos
          stats.sort((a, b) => b.points - a.points);
          
          return NextResponse.json(stats);
        }
      }
    } catch (mongoError) {
      console.error('Erro ao obter estatísticas do MongoDB:', mongoError);
    }
    
    // Fallback: Tentar dados do arquivo
    try {
      const allStats = getAllPlayersStats();
      allStats.sort((a, b) => b.points - a.points);
      return NextResponse.json(allStats);
    } catch (fileError) {
      console.error('Erro ao obter estatísticas dos arquivos:', fileError);
      
      // Último recurso: mock data
      const mockStats = mockPlayers.map(player => ({
        id: player._id,
        name: player.name,
        totalGames: player.jogos,
        wins: player.vitorias,
        draws: player.empates,
        losses: player.derrotas,
        winRate: player.jogos > 0 ? (player.vitorias / player.jogos) * 100 : 0,
        points: player.pontuacao
      }));
      
      mockStats.sort((a, b) => b.points - a.points);
      return NextResponse.json(mockStats);
    }
  } catch (error) {
    console.error('Erro ao processar requisição GET para estatísticas:', error);
    
    return NextResponse.json(
      { error: 'Falha ao buscar estatísticas', details: error.message },
      { status: 500 }
    );
  }
} 