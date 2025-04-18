import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  brancasId: {
    type: String,
    required: [true, 'ID do jogador de peças brancas é obrigatório']
  },
  brancasNome: {
    type: String,
    required: [true, 'Nome do jogador de peças brancas é obrigatório']
  },
  pretasId: {
    type: String,
    required: [true, 'ID do jogador de peças pretas é obrigatório']
  },
  pretasNome: {
    type: String,
    required: [true, 'Nome do jogador de peças pretas é obrigatório']
  },
  data_inicio: {
    type: Date,
    default: Date.now
  },
  data_fim: {
    type: Date,
    default: null
  },
  resultado: {
    type: String,
    enum: ['em_andamento', 'vitoria_brancas', 'vitoria_pretas', 'empate'],
    default: 'em_andamento'
  },
  movimentos: {
    type: [Object],
    default: []
  },
  notacao: {
    type: String,
    default: ''
  }
}, {
  timestamps: {
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.models.Game || mongoose.model('Game', GameSchema); 