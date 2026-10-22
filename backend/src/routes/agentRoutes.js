const express = require('express');
const router = express.Router();
const Agent = require('../models/agentModels');

// 1. Cadastrar Agente
router.post('/', async (req, res) => {
  try {
    const agent = new Agent(req.body);
    const savedAgent = await agent.save();
    res.status(201).json(savedAgent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Listar Agentes (com filtros por função ou situação atual)
router.get('/', async (req, res) => {
  try {
    const { funcao, situacaoAtual } = req.query;
    let filter = {};
    if (funcao) filter.funcao = funcao;
    if (situacaoAtual) filter.situacaoAtual = situacaoAtual;

    const agents = await Agent.find(filter) || [];
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Atualizar Status do Agente em Campo
router.patch('/:id/status', async (req, res) => {
  try {
    const { situacaoAtual } = req.body;
    const updated = await Agent.findByIdAndUpdate(
      req.params.id,
      { situacaoAtual },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Agente não encontrado' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;