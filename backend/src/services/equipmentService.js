const Equipment = require('../models/equipmentModels');

class EquipmentService {
  // Criar Equipamento
  async create(data) {
    const equipment = new Equipment(data);
    return await equipment.save();
  }

  // Listar Equipamentos (com filtros opcionais)
  async getAll(queryFilters = {}) {
    const { tipo, bairro, situacao, manutencaoImediata } = queryFilters;
    let filter = {};

    if (tipo) filter.tipo = tipo;
    if (bairro) filter['localizacao.bairro'] = new RegExp(bairro, 'i');
    if (situacao) filter.situacao = situacao;
    if (manutencaoImediata === 'true') filter['manutencao.necessidade'] = 'imediata';

    return await Equipment.find(filter) || [];
  }

  // Obter Equipamento por ID
  async getById(id) {
    return await Equipment.findById(id);
  }

  // Alterar / Atualizar Status ou Dados
  async update(id, updateData) {
    if (updateData.situacao === "operacional") {
      updateData['manutencao.necessidade'] = "nenhuma";
    }

    const equipamento = await Equipment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!equipamento) {
      throw new Error('Equipamento não encontrado');
    }

    return equipamento;
  }

  // Excluir Equipamento
  async delete(id) {
    return await Equipment.findByIdAndDelete(id);
  }

  // Buscar Alertas Críticos (Central de Operações)
  async getCriticalAlerts() {
    return await Equipment.find({
      $or: [
        { situacao: { $in: ['mau funcionamento', 'furtado'] } },
        { 'manutencao.necessidade': 'imediata' }
      ]
    });
  }

  // Simular Incidente em Tempo Real (Diferencial)
  async simulateIncident() {
    const operacionais = await Equipment.find({ situacao: 'operacional' });
    
    if (operacionais.length === 0) {
      throw new Error('Não há equipamentos operacionais disponíveis para simular incidentes.');
    }

    const randomIndex = Math.floor(Math.random() * operacionais.length);
    const equipamentoAlvo = operacionais[randomIndex];

    const novasSituacoes = ['mau funcionamento', 'furtado'];
    const situacaoAleatoria = novasSituacoes[Math.floor(Math.random() * novasSituacoes.length)];

    equipamentoAlvo.situacao = situacaoAleatoria;
    equipamentoAlvo.manutencao.necessidade = 'imediata';
    await equipamentoAlvo.save();

    return equipamentoAlvo;
  }
}

module.exports = new EquipmentService();