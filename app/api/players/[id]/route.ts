import { connectToDB } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getMockPlayerById, MockPlayer } from '@/lib/mock-data';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Check if ID is provided
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID do jogador não fornecido' },
        { status: 400 }
      );
    }

    const playerId = params.id;

    // Connect to the database
    const { db, error: dbError } = await connectToDB();
    
    if (dbError) {
      console.error('Erro ao conectar ao banco de dados:', dbError);
      
      // Try to get player from mock data if database connection fails
      const mockPlayer = getMockPlayerById(playerId);
      
      if (mockPlayer) {
        return NextResponse.json({ player: mockPlayer }, { status: 200 });
      } else {
        return NextResponse.json(
          { error: 'Jogador não encontrado e falha na conexão com o banco de dados' },
          { status: 404 }
        );
      }
    }

    // Try to find the player in the database
    const playersCollection = db.collection('players');
    const player = await playersCollection.findOne({ _id: playerId });

    if (player) {
      return NextResponse.json({ player }, { status: 200 });
    }

    // If player not found in DB, try to get from mock data
    const mockPlayer = getMockPlayerById(playerId);
    
    if (mockPlayer) {
      // Note: mockPlayer already has the correct structure with _id field
      return NextResponse.json({ player: mockPlayer }, { status: 200 });
    }

    // If player not found anywhere
    return NextResponse.json(
      { error: 'Jogador não encontrado' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 