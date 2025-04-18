import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAYERS_FILE_PATH = path.join(process.cwd(), 'data/players.json');
const GAMES_FILE_PATH = path.join(process.cwd(), 'data/games.json');
const DATA_DIR = path.join(process.cwd(), 'data');

// Função auxiliar para verificar permissões de diretório
function checkDirectoryPermissions(dirPath) {
  try {
    // Verificar se o diretório existe
    const exists = fs.existsSync(dirPath);
    
    if (!exists) {
      // Tentar criar o diretório
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        return {
          exists: true,
          canWrite: true,
          canRead: true,
          message: "Diretório criado com sucesso"
        };
      } catch (createError) {
        return {
          exists: false,
          canWrite: false,
          canRead: false,
          message: `Não foi possível criar o diretório: ${createError.message}`
        };
      }
    }
    
    // Verificar permissões de escrita tentando criar um arquivo temporário
    const testFilePath = path.join(dirPath, `test_${Date.now()}.tmp`);
    try {
      fs.writeFileSync(testFilePath, 'test', { flag: 'w' });
      fs.unlinkSync(testFilePath); // Remover o arquivo de teste
      return {
        exists: true,
        canWrite: true,
        canRead: true,
        message: "Permissões de leitura e escrita confirmadas"
      };
    } catch (writeError) {
      return {
        exists: true,
        canWrite: false,
        canRead: true, // Presumindo que pode ler, já que pode verificar a existência
        message: `Não tem permissão de escrita: ${writeError.message}`
      };
    }
  } catch (error) {
    return {
      exists: false,
      canWrite: false,
      canRead: false,
      message: `Erro ao verificar o diretório: ${error.message}`
    };
  }
}

// Rota para verificar o status do servidor e da aplicação
export async function GET() {
  try {
    console.log('API: Verificando status do servidor');
    
    // Verificar permissões do diretório de dados
    const dirPermissions = checkDirectoryPermissions(DATA_DIR);
    
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
    
    // Informações de sistema
    const systemInfo = {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
      tempDir: os.tmpdir(),
      homedir: os.homedir(),
      freemem: os.freemem(),
      totalmem: os.totalmem(),
      uptime: os.uptime()
    };
    
    // Verificar se pode criar um arquivo temporário
    let tempFileTest = { success: false, message: "" };
    try {
      const tempFilePath = path.join(os.tmpdir(), `xadrex_test_${Date.now()}.tmp`);
      fs.writeFileSync(tempFilePath, 'test data', { flag: 'w' });
      fs.unlinkSync(tempFilePath);
      tempFileTest = { success: true, message: "Pode criar arquivos temporários" };
    } catch (err) {
      tempFileTest = { success: false, message: `Não pode criar arquivos temporários: ${err.message}` };
    }
    
    // Testar permissões de escrita no diretório atual
    let currentDirWritable = { success: false, message: "" };
    try {
      const testPath = path.join(process.cwd(), `write_test_${Date.now()}.tmp`);
      fs.writeFileSync(testPath, 'test', { flag: 'w' });
      fs.unlinkSync(testPath);
      currentDirWritable = { success: true, message: "Diretório atual permite escrita" };
    } catch (err) {
      currentDirWritable = { success: false, message: `Diretório atual não permite escrita: ${err.message}` };
    }
    
    // Criar um ID único para esse check
    const checkId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    
    return NextResponse.json({
      status: 'online',
      checkId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      systemInfo,
      tempFileTest,
      currentDirWritable,
      dataDirectory: {
        path: DATA_DIR,
        ...dirPermissions
      },
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
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 