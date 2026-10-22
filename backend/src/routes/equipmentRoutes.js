const express = require('express');
const router = express.Router();
const Equipment = require('../models/equipmentModels');

// 1. Cadastrar Equipamento
router.post('/', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    const savedEquipment = await equipment.save();
    res.status(201).json(savedEquipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Listar Equipamentos (Com suporte a filtros por tipo, bairro, situação e manutenção)
router.get('/', async (req, res) => {
  try {
    const { tipo, bairro, situacao, manutencaoImediata } = req.query;
    let filter = {};

    if (tipo) filter.tipo = tipo;
    if (bairro) filter['localizacao.bairro'] = new RegExp(bairro, 'i'); // Busca aproximada
    if (situacao) filter.situacao = situacao;
    if (manutencaoImediata === 'true') filter['manutencao.necessidade'] = 'imediata';

    const equipments = await Equipment.find(filter) || [];
    res.json(equipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Buscar Equipamento por ID
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Atualizar Situação ou Status de Manutenção (PATCH rápido)
router.patch('/:id/status', async (req, res) => {
  try {
    const { situacao, manutencao } = req.body;
    let updateData = {};
    if (situacao) updateData.situacao = situacao;
    if (manutencao) updateData.manutencao = manutencao;

    const updated = await Equipment.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Deletar Equipamento
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Equipment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json({ message: 'Equipamento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;