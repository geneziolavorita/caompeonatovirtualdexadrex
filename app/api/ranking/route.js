import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAYERS_FILE_PATH = path.join(process.cwd(), 'data/players.json');
const DATA_DIR = path.join(process.cwd(), 'data');

// Função para garantir que o diretório de dados existe
function ensureDataDirectoryExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log('Diretório de dados criado:', DATA_DIR);
    }
  } catch (error) {
    console.error('Erro ao criar diretório de dados:', error);
    throw new Error(`Não foi possível criar o diretório de dados: ${error.message}`);
  }
}

// Função para ler o arquivo de jogadores
function readPlayersFile() {
  try {
    ensureDataDirectoryExists();
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(PLAYERS_FILE_PATH)) {
      console.log('Arquivo de jogadores não encontrado. Criando arquivo vazio.');
      fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    
    // Ler o conteúdo do arquivo
    const fileContent = fs.readFileSync(PLAYERS_FILE_PATH, 'utf8');
    
    // Verificar se o conteúdo está vazio
    if (!fileContent || fileContent.trim() === '') {
      console.log('Arquivo de jogadores está vazio. Inicializando com array vazio.');
      fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    
    // Tentar fazer o parse do JSON
    try {
      const players = JSON.parse(fileContent);
      
      // Verificar se o resultado é um array
      if (!Array.isArray(players)) {
        console.warn('Arquivo de jogadores não contém um array. Inicializando com array vazio.');
        fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
        return [];
      }
      
      return players;
    } catch (parseError) {
      console.error('Erro ao fazer parse do arquivo de jogadores:', parseError);
      // Se não conseguir fazer o parse, criar um arquivo novo com array vazio
      fs.writeFileSync(PLAYERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
  } catch (error) {
    console.error('Erro ao ler arquivo de jogadores:', error);
    throw new Error(`Falha ao ler dados dos jogadores: ${error.message}`);
  }
}

// GET - Obter ranking de jogadores
export async function GET(request) {
  try {
    console.log('API: Obtendo ranking de jogadores');
    
    // Obter URL da requisição para possíveis parâmetros
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 10; // Limite padrão de 10 jogadores
    
    // Ler dados dos jogadores
    const players = readPlayersFile();
    
    // Se não houver jogadores, retornar array vazio
    if (players.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          ranking: [],
          total: 0,
        },
        message: 'Nenhum jogador cadastrado',
        timestamp: new Date().toISOString()
      });
    }
    
    // Ordenar jogadores por: pontuação (desc), vitórias (desc), jogos (asc)
    const sortedPlayers = [...players].sort((a, b) => {
      // Primeiro critério: pontuação
      if (b.pontuacao !== a.pontuacao) {
        return b.pontuacao - a.pontuacao;
      }
      
      // Segundo critério: vitórias
      if (b.vitorias !== a.vitorias) {
        return b.vitorias - a.vitorias;
      }
      
      // Terceiro critério: menos jogos (eficiência)
      return a.jogos - b.jogos;
    });
    
    // Aplicar o limite e mapear para o formato de ranking
    const ranking = sortedPlayers.slice(0, limit).map((player, index) => {
      return {
        posicao: index + 1,
        id: player.id,
        nome: player.nome,
        pontuacao: player.pontuacao,
        vitorias: player.vitorias,
        derrotas: player.derrotas,
        empates: player.empates,
        jogos: player.jogos,
        // Calcular taxa de vitória (evitar divisão por zero)
        taxaVitoria: player.jogos > 0 
          ? ((player.vitorias / player.jogos) * 100).toFixed(1) + '%'
          : '0.0%'
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ranking: ranking,
        total: players.length,
        limitado: limit < players.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 