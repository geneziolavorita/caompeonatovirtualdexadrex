import { NextResponse } from 'next/server';

// Configurar para usar o runtime Node.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'online',
      timestamp: new Date().toISOString()
    }, { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      }
    });
  }
} 