import { NextResponse } from 'next/server';
import { conectarDB } from "@/lib/db";
import mongoose from 'mongoose';
import { mockPlayers, getMockPlayerById, updateMockPlayer, deleteMockPlayer } from "@/lib/mock-data";
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Função para verificar se o MongoDB está disponível
async function isMongoDBAvailable() {
  try {
    // Tenta conectar ao MongoDB
    await conectarDB();
    return mongoose.connection.readyState === 1; // 1 significa conectado
  } catch (error) {
    console.log("Erro ao verificar disponibilidade do MongoDB:", error);
    return false;
  }
}

// GET - Listar todos os jogadores
export async function GET(request) {
  try {
    // Verificar se o MongoDB está disponível
    const mongoAvailable = await isMongoDBAvailable();
    
    if (mongoAvailable) {
      // Conectar ao MongoDB
      await conectarDB();
      
      // Obter o modelo de Player (definido na função conectarDB)
      const Player = mongoose.models.Player;
      
      // Buscar todos os jogadores do banco de dados
      const jogadores = await Player.find({}).sort({ pontuacao: -1 });
      
      // Retornar a lista de jogadores
      return NextResponse.json({ jogadores }, { status: 200 });
    } else {
      // MongoDB não está disponível, usar dados mock
      console.log("MongoDB não disponível. Usando dados mock para jogadores.");
      return NextResponse.json({ jogadores: mockPlayers }, { status: 200 });
    }
  } catch (error) {
    console.error("Erro ao listar jogadores:", error);
    return NextResponse.json(
      { erro: "Erro ao listar jogadores", detalhes: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar um novo jogador
export async function POST(request) {
  try {
    // Obter os dados da requisição
    const dados = await request.json();
    
    // Validar os dados recebidos
    if (!dados.nome) {
      return NextResponse.json(
        { erro: "O nome do jogador é obrigatório" },
        { status: 400 }
      );
    }
    
    // Verificar se o MongoDB está disponível
    const mongoAvailable = await isMongoDBAvailable();
    
    if (mongoAvailable) {
      // Conectar ao MongoDB
      await conectarDB();
      
      // Obter o modelo de Player
      const Player = mongoose.models.Player;
      
      // Verificar se já existe um jogador com o mesmo nome
      const jogadorExistente = await Player.findOne({ nome: dados.nome });
      
      if (jogadorExistente) {
        return NextResponse.json(
          { erro: "Já existe um jogador com este nome" },
          { status: 400 }
        );
      }
      
      // Criar um novo jogador com dados iniciais
      const novoJogador = new Player({
        nome: dados.nome,
        pontuacao: 0,
        jogos: 0,
        vitorias: 0,
        derrotas: 0,
        empates: 0,
        dataCriacao: new Date()
      });
      
      // Salvar o jogador no banco de dados
      await novoJogador.save();
      
      // Retornar o jogador criado
      return NextResponse.json({ jogador: novoJogador }, { status: 201 });
    } else {
      // MongoDB não está disponível, usar dados mock
      console.log("MongoDB não disponível. Criando jogador mock.");
      
      // Verificar se já existe um jogador com o mesmo nome
      const jogadorExistente = mockPlayers.find(player => player.nome === dados.nome);
      
      if (jogadorExistente) {
        return NextResponse.json(
          { erro: "Já existe um jogador com este nome" },
          { status: 400 }
        );
      }
      
      // Criar ID único para o jogador mock
      const id = uuidv4();
      
      // Criar um novo jogador mock
      const novoJogador = {
        _id: id,
        id: id,
        nome: dados.nome,
        name: dados.nome, // Duplicar para compatibilidade
        pontuacao: 0,
        jogos: 0,
        vitorias: 0,
        derrotas: 0,
        empates: 0,
        dataCriacao: new Date().toISOString()
      };
      
      // Adicionar o jogador ao array de dados mock
      mockPlayers.push(novoJogador);
      
      // Retornar o jogador criado
      return NextResponse.json({ jogador: novoJogador }, { status: 201 });
    }
  } catch (error) {
    console.error("Erro ao criar jogador:", error);
    return NextResponse.json(
      { erro: "Erro ao criar jogador", detalhes: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um jogador existente
export async function PUT(request) {
  try {
    // Obter os dados da requisição
    const dados = await request.json();
    
    // Validar ID do jogador
    if (!dados.id) {
      return NextResponse.json(
        { erro: "ID do jogador é obrigatório" },
        { status: 400 }
      );
    }
    
    // Verificar se o MongoDB está disponível
    const mongoAvailable = await isMongoDBAvailable();
    
    if (mongoAvailable) {
      // Conectar ao MongoDB
      await conectarDB();
      
      // Obter o modelo de Player
      const Player = mongoose.models.Player;
      
      // Encontrar e atualizar o jogador
      const jogadorAtualizado = await Player.findByIdAndUpdate(
        dados.id,
        { $set: dados },
        { new: true }
      );
      
      // Verificar se o jogador foi encontrado
      if (!jogadorAtualizado) {
        return NextResponse.json(
          { erro: "Jogador não encontrado" },
          { status: 404 }
        );
      }
      
      // Retornar o jogador atualizado
      return NextResponse.json({ jogador: jogadorAtualizado }, { status: 200 });
    } else {
      // MongoDB não está disponível, usar dados mock
      console.log("MongoDB não disponível. Atualizando jogador mock.");
      
      // Atualizar jogador nos dados mock
      const jogadorAtualizado = updateMockPlayer(dados.id, dados);
      
      // Verificar se o jogador foi encontrado
      if (!jogadorAtualizado) {
        return NextResponse.json(
          { erro: "Jogador não encontrado" },
          { status: 404 }
        );
      }
      
      // Retornar o jogador atualizado
      return NextResponse.json({ jogador: jogadorAtualizado }, { status: 200 });
    }
  } catch (error) {
    console.error("Erro ao atualizar jogador:", error);
    return NextResponse.json(
      { erro: "Erro ao atualizar jogador", detalhes: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remover um jogador
export async function DELETE(request) {
  try {
    // Obter os dados da requisição
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // Validar ID do jogador
    if (!id) {
      return NextResponse.json(
        { erro: "ID do jogador é obrigatório" },
        { status: 400 }
      );
    }
    
    // Verificar se o MongoDB está disponível
    const mongoAvailable = await isMongoDBAvailable();
    
    if (mongoAvailable) {
      // Conectar ao MongoDB
      await conectarDB();
      
      // Obter o modelo de Player
      const Player = mongoose.models.Player;
      
      // Encontrar e remover o jogador
      const jogadorRemovido = await Player.findByIdAndDelete(id);
      
      // Verificar se o jogador foi encontrado
      if (!jogadorRemovido) {
        return NextResponse.json(
          { erro: "Jogador não encontrado" },
          { status: 404 }
        );
      }
      
      // Retornar sucesso
      return NextResponse.json(
        { mensagem: "Jogador removido com sucesso" },
        { status: 200 }
      );
    } else {
      // MongoDB não está disponível, usar dados mock
      console.log("MongoDB não disponível. Removendo jogador mock.");
      
      // Remover jogador dos dados mock
      const jogadorRemovido = deleteMockPlayer(id);
      
      // Verificar se o jogador foi encontrado
      if (!jogadorRemovido) {
        return NextResponse.json(
          { erro: "Jogador não encontrado" },
          { status: 404 }
        );
      }
      
      // Retornar sucesso
      return NextResponse.json(
        { mensagem: "Jogador removido com sucesso" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Erro ao remover jogador:", error);
    return NextResponse.json(
      { erro: "Erro ao remover jogador", detalhes: error.message },
      { status: 500 }
    );
  }
} 