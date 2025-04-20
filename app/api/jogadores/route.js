import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';

export async function generateStaticParams() {
  // Esta rota não tem parâmetros dinâmicos, mas precisamos da função
  // para compatibilidade com o output: 'export'
  return [{}];
}

export async function GET() {
  try {
    // Tentar obter jogadores do banco de dados
    let jogadores = [];
    
    try {
      const { db } = await connectToDB();
      if (db) {
        const collection = db.collection('players');
        jogadores = await collection.find({}).toArray();
      }
    } catch (err) {
      console.error('Erro ao conectar ao MongoDB:', err);
    }
    
    return NextResponse.json({ 
      jogadores,
      sucesso: true,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return NextResponse.json({ 
      erro: 'Erro ao buscar jogadores', 
      detalhes: error.message,
      sucesso: false 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Extrair dados do corpo da requisição
    const dados = await request.json();
    
    // Validação básica
    if (!dados.nome || typeof dados.nome !== 'string' || !dados.nome.trim()) {
      return NextResponse.json({
        erro: 'Nome do jogador é obrigatório',
        sucesso: false
      }, { status: 400 });
    }
    
    // Conectar ao banco de dados
    let dbConnection;
    try {
      const { db } = await connectToDB();
      dbConnection = db;
    } catch (err) {
      console.error('Erro ao conectar ao MongoDB:', err);
      return NextResponse.json({
        erro: 'Falha ao conectar ao banco de dados',
        sucesso: false
      }, { status: 503 });
    }
    
    // Verificar se o jogador já existe
    try {
      const jogadorExistente = await dbConnection.collection('players').findOne({
        nome: { $regex: new RegExp(`^${dados.nome}$`, 'i') }
      });
      
      if (jogadorExistente) {
        return NextResponse.json({
          erro: `Jogador '${dados.nome}' já existe`,
          sucesso: false
        }, { status: 409 });
      }
    } catch (err) {
      console.error('Erro ao verificar jogador:', err);
    }
    
    // Criar objeto de jogador
    const novoJogador = {
      nome: dados.nome.trim(),
      email: dados.email || '',
      pontuacao: 0,
      jogos: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      dataCriacao: new Date().toISOString()
    };
    
    // Inserir no banco de dados
    try {
      const result = await dbConnection.collection('players').insertOne(novoJogador);
      
      if (!result.acknowledged) {
        throw new Error('Falha ao inserir jogador no banco de dados');
      }
      
      novoJogador._id = result.insertedId.toString();
      novoJogador.id = result.insertedId.toString();
      
      return NextResponse.json({
        jogador: novoJogador,
        mensagem: 'Jogador cadastrado com sucesso',
        sucesso: true
      }, { status: 201 });
    } catch (err) {
      console.error('Erro ao salvar jogador:', err);
      return NextResponse.json({
        erro: 'Erro ao salvar jogador no banco de dados',
        detalhes: err.message,
        sucesso: false
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro no processamento da requisição:', error);
    return NextResponse.json({
      erro: 'Erro interno do servidor',
      detalhes: error.message,
      sucesso: false
    }, { status: 500 });
  }
} 