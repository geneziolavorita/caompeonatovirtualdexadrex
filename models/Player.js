import mongoose from 'mongoose';

// Verificar se o modelo já existe para evitar sobrescrever
const PlayerSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do jogador é obrigatório'],
    trim: true
  },
  name: { // Campo duplicado para compatibilidade
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  pontuacao: {
    type: Number,
    default: 0
  },
  jogos: {
    type: Number,
    default: 0
  },
  vitorias: {
    type: Number,
    default: 0
  },
  derrotas: {
    type: Number,
    default: 0
  },
  empates: {
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'dataCriacao', // Custom createdAt field name
    updatedAt: 'dataAtualizacao' // Custom updatedAt field name
  },
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Converter _id para string e manter como id também
      ret.id = ret._id.toString();
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Converter _id para string e manter como id também
      ret.id = ret._id.toString();
      return ret;
    }
  }
});

// Middleware para garantir que name e nome estejam sincronizados
PlayerSchema.pre('save', function(next) {
  // Se apenas um dos campos estiver definido, copie para o outro
  if (this.nome && !this.name) {
    this.name = this.nome;
  } else if (this.name && !this.nome) {
    this.nome = this.name;
  }
  next();
});

// Usar modelo existente ou criar um novo
export default mongoose.models.Player || mongoose.model('Player', PlayerSchema); 