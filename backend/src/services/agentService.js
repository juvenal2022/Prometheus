const Agent = require('../models/agentModels');

class AgentService {
  // Criar Agente
  async create(data) {
    const agent = new Agent(data);
    return await agent.save();
  }

  // Listar Agentes (com filtros opcionais)
  async getAll(queryFilters = {}) {
    const { funcao, situacaoAtual } = queryFilters;
    let filter = {};
    
    if (funcao) filter.funcao = funcao;
    if (situacaoAtual) filter.situacaoAtual = situacaoAtual;

    return await Agent.find(filter) || [];
  }

  // Obter Agente por ID
  async getById(id) {
    return await Agent.findById(id);
  }

  // Alterar Status ou Dados do Agente
  async update(id, updateData) {
    return await Agent.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  // Excluir Agente
  async delete(id) {
    return await Agent.findByIdAndDelete(id);
  }
}

module.exports = new AgentService();