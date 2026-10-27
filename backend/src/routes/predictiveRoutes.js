const express = require('express');
const router = express.Router();
const Equipment = require('../services/equipmentService');

// Rota para calcular o Índice de Risco e Recomendações Preventivas
router.get('/analise-preditiva', async (req, res) => {
  try {
    const equipamentos = await Equipment.getAll(req.query);

    // 1. Simulação de Análise de Risco por Bairro/Região baseada no histórico atual
    const regioesMap = {};

    equipamentos.forEach(eq => {
      const rua = eq.rua || 'Região Central';
      if (!regioesMap[rua]) {
        regioesMap[rua] = { total:0, falhas: 0, riscoScore: 0 };
      }
      regioesMap[rua].total += 1;
      
      // Se estiver com mau funcionamento ou furtado, aumenta o peso de risco
      if (eq.situacao === 'mau funcionamento' || eq.situacao === 'furtado') {
        regioesMap[rua].falhas += 1;
      }
    });

    // 2. Calcula o índice de risco (0 a 100) para cada região
    const analiseRegioes = Object.keys(regioesMap).map(rua => {
      const reg = regioesMap[rua];
      const taxaFalha = reg.total > 0 ? (reg.falhas / reg.total) : 0;
      let score = Math.round(taxaFalha * 100);
      
      // Heurística preditiva: se a taxa de falha for alta, o risco para as próximas horas aumenta
      let nivelRisco = 'Baixo';
      if (score > 15) nivelRisco = 'Moderado';
      if (score > 40) nivelRisco = 'Crítico';

      return {
        regiao: rua,
        totalEquipamentos: reg.total,
        equipamentosComProblema: reg.falhas,
        indiceRisco: score,
        nivelRisco,
        recomendacao: nivelRisco === 'Crítico' 
          ? `⚠️ Enviar equipe de reforço imediatamente para ${rua}. Alta probabilidade de colapso operacional.`
          : `✅ Operação estável em ${rua}. Monitoramento padrão recomendado.`
      };
    });

    res.status(200).json({
      status: 'sucesso',
      timestamp: new Date(),
      previsaoHorarioPico: '18:00 - 21:00 (Maior tendência de incidentes baseada no fluxo)',
      analiseRegioes
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;