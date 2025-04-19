import { connectToDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getMockPlayerById } from '@/lib/mock-data';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  const id = params.id;
  
  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }
  
  try {
    // Tentar buscar do MongoDB
    let player = null;
    
    try {
      const { db } = await connectToDB();
      if (db) {
        const playersCollection = db.collection('players');
        
        // Tentar converter para ObjectId ou usar como string se falhar
        let query;
        try {
          // Verificar se o ID parece ser um ObjectId válido
          if (/^[0-9a-fA-F]{24}$/.test(id)) {
            query = { $or: [
              { _id: new ObjectId(id) },
              { id: id }
            ]};
          } else {
            query = { $or: [
              { _id: id },
              { id: id }
            ]};
          }
        } catch (idErr) {
          // Se falhar na conversão, use como string
          query = { $or: [
            { _id: id },
            { id: id }
          ]};
        }
        
        player = await playersCollection.findOne(query);
        
        if (player) {
          // Formatar o objeto do jogador
          player = {
            _id: player._id.toString(),
            id: player._id.toString(),
            nome: player.nome,
            name: player.nome,
            email: player.email || '',
            pontuacao: player.pontuacao || 0,
            jogos: player.jogos || 0,
            vitorias: player.vitorias || 0,
            derrotas: player.derrotas || 0,
            empates: player.empates || 0,
            dataCriacao: player.dataCriacao || new Date().toISOString()
          };
        }
      }
    } catch (dbError) {
      console.error('Erro ao conectar ao MongoDB:', dbError);
      // Continua para usar dados mockados
    }
    
    // Se não encontrou no MongoDB, tenta usar dados mock
    if (!player) {
      player = getMockPlayerById(id);
      
      // Se nem nos dados mock encontrou, retorna erro
      if (!player) {
        return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
      }
    }
    
    return NextResponse.json(player, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    return NextResponse.json({ 
      error: 'Erro ao buscar jogador', 
      details: error.message 
    }, { status: 500 });
  }
} 