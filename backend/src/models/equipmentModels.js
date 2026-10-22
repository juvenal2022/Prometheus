const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  tipo: { type: String, required: true }, // ex: 'radar', 'camera', 'balanca', 'patinete'
  numeroSerie: { type: String, required: true, unique: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  localizacao: {
    cep: { type: String, required: true },
    bairro: { type: String, required: true },
    cidadeUf: { type: String, required: true },
    rua: { type: String, required: true },
    referencia: String, // ex: "oposto ao número 181", "KM 203"
    gps: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  situacao: { 
    type: String, 
    enum: ['ainda não instalado', 'operacional', 'mau funcionamento', 'desativado', 'furtado'],
    default: 'ainda não instalado'
  },
  manutencao: {
    necessidade: { type: String, enum: ['imediata', 'agendada/periódica', 'nenhuma'], default: 'nenhuma' },
    dataProxima: Date
  },
  // Propriedades particulares de cada equipamento (ex: resolução de câmera, vel. máxima de radar)
  caracteristicasEspecificas: { type: Map, of: mongoose.Schema.Types.Mixed } 
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);