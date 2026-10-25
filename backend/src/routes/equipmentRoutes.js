const express = require('express');
const router = express.Router();
const equipmentService = require('../services/equipmentService');

// Cadastrar
router.post('/', async (req, res) => {
  try {
    const saved = await equipmentService.create(req.body);
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar (com filtros)
router.get('/', async (req, res) => {
  try {
    const items = await equipmentService.getAll(req.query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter por ID
router.get('/:id', async (req, res) => {
  try {
    const item = await equipmentService.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alterar Status (PATCH)
router.patch('/:id/status', async (req, res) => {
  try {
    const updated = await equipmentService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json({ message: 'Status atualizado com sucesso!', updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Excluir
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await equipmentService.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json({ message: 'Equipamento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de Alertas Críticos
router.get('/alertas/criticos', async (req, res) => {
  try {
    const alertas = await equipmentService.getCriticalAlerts();
    res.json({ total: alertas.length, alertas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de Simulação
router.post('/simular/incidente', async (req, res) => {
  try {
    const afetado = await equipmentService.simulateIncident();
    res.json({ message: '🚨 Incidente simulado com sucesso!', equipamentoAfetado: afetado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;