const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  matricula: { type: String, required: true, unique: true },
  funcao: { 
    type: String, 
    enum: ['agente de trânsito', 'guarda municipal', 'policial militar'], 
    required: true 
  },
  lotacao: { type: String, required: true }, // Base ou setor de atuação
  situacaoAtual: { 
    type: String, 
    enum: ['em base', 'em patrulhamento', 'em ocorrência', 'folga/indisponível'],
    default: 'em base' 
  },
  contatoRadio: String
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);