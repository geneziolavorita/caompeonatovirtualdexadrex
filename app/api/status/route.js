import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import os from 'os';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Verificando status do sistema e conexão com o banco de dados...');
    
    // Verificar a conexão com o MongoDB
    let dbStatus = 'disconnected';
    let dbVersion = null;
    let dbError = null;
    
    try {
      await dbConnect();
      
      // Verificar se está conectado
      if (mongoose.connection.readyState === 1) {
        dbStatus = 'connected';
        
        try {
          // Obter informações sobre o servidor MongoDB
          const adminDb = mongoose.connection.db.admin();
          const serverInfo = await adminDb.serverStatus();
          dbVersion = serverInfo.version;
        } catch (infoError) {
          console.warn('Não foi possível obter versão do MongoDB:', infoError);
        }
      }
    } catch (dbError) {
      console.error('Erro ao conectar ao MongoDB:', dbError);
      dbStatus = 'error';
      dbError = dbError.message;
    }
    
    // Informações de sistema
    const systemInfo = {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
      freemem: Math.round(os.freemem() / (1024 * 1024)) + "MB",
      totalmem: Math.round(os.totalmem() / (1024 * 1024)) + "MB",
      uptime: Math.round(os.uptime() / 60) + " minutos"
    };
    
    return NextResponse.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      system: systemInfo,
      database: {
        type: 'MongoDB',
        status: dbStatus,
        version: dbVersion,
        error: dbError
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status do sistema:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 