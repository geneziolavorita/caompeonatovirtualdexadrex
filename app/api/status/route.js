import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';

// Verifica se os arquivos de dados existem
function checkDataFiles() {
  const dataDir = path.join(process.cwd(), 'data');
  const playersFilePath = path.join(dataDir, 'players.json');
  const gamesFilePath = path.join(dataDir, 'games.json');
  
  const dirExists = fs.existsSync(dataDir);
  const playersFileExists = fs.existsSync(playersFilePath);
  const gamesFileExists = fs.existsSync(gamesFilePath);
  
  return {
    dataDirectoryExists: dirExists,
    playersFileExists,
    gamesFileExists,
    dataDirectoryPath: dataDir
  };
}

export async function GET() {
  try {
    const dataStatus = checkDataFiles();
    
    return NextResponse.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      dataFiles: dataStatus
    }, { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
} 