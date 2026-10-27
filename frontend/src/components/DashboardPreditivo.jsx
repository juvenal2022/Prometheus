import React, { useEffect, useState } from 'react';

export default function DashboardPreditivo() {
  const [dadosPreditivos, setDadosPreditivos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/predictive/analise-preditiva')
      .then(res => res.json())
      .then(data => {
        setDadosPreditivos(data);
        setLoading(false);
      })
      .catch(err => console.error('Erro ao carregar inteligência preditiva:', err));
  }, []);

  if (loading) return <div className="p-6 text-white">Carregando inteligência preditiva da cidade...</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🔮 Prometheus - Painel de Cidade Preditiva
        </h2>
        <p className="text-gray-400 text-sm">
          Antecipando cenários e gerando recomendações inteligentes com base no comportamento operacional.
        </p>
      </div>

      {/* Alerta de Horário Crítico */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700 p-4 rounded-lg shadow-lg">
        <h3 className="font-bold text-lg text-blue-200">⏰ Janela de Risco Identificada</h3>
        <p className="text-sm text-gray-300 mt-1">
          Previsão de pico crítico de ocorrências para hoje entre: <span className="font-semibold text-yellow-400">{dadosPreditivos?.previsaoHorarioPico}</span>
        </p>
      </div>

      {/* Grid de Índices de Risco por Região */}
      <h3 className="text-xl font-semibold mt-6">📊 Índice de Risco por Região</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dadosPreditivos?.analiseRegioes.map((item, index) => (
          <div key={index} className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg">{item.regiao}</h4>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  item.nivelRisco === 'Crítico' ? 'bg-red-600 text-white' :
                  item.nivelRisco === 'Moderado' ? 'bg-yellow-600 text-black' : 'bg-green-600 text-white'
                }`}>
                  {item.nivelRisco} ({item.indiceRisco} pts)
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Equipamentos monitorados: {item.totalEquipamentos} | Com falha: {item.equipamentosComProblema}
              </p>
            </div>

            <div className="bg-gray-900 p-3 rounded border border-gray-800 text-xs text-gray-300">
              {item.recomendacao}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}