import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [equipments, setEquipments] = useState([]);
  const [agents, setAgents] = useState([]);
  
  // Estado do formulário de Equipamento
  const [eqForm, setEqForm] = useState({
    tipo: 'radar',
    numeroSerie: '',
    marca: '',
    modelo: '',
    cep: '',
    bairro: '',
    cidadeUf: '',
    rua: '',
    referencia: '',
    latitude: '',
    longitude: '',
    situacao: 'operacional',
    manutencaoNecessidade: 'nenhuma'
  });

  // Buscar dados da API
  // Buscar dados da API com tratamento de segurança
  const fetchData = async () => {
    try {
      const resEq = await fetch(`${API_URL}/equipments`);
      if (resEq.ok) {
        const dataEq = await resEq.json();
        setEquipments(Array.isArray(dataEq) ? dataEq : []);
      } else {
        setEquipments([]);
      }

      const resAg = await fetch(`${API_URL}/agents`);
      if (resAg.ok) {
        const dataAg = await resAg.json();
        setAgents(Array.isArray(dataAg) ? dataAg : []);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('Erro de conexão com a API:', error);
      setEquipments([]);
      setAgents([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cadastrar Equipamento
  const handleEqSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      tipo: eqForm.tipo,
      numeroSerie: eqForm.numeroSerie,
      marca: eqForm.marca,
      modelo: eqForm.modelo,
      localizacao: {
        cep: eqForm.cep,
        bairro: eqForm.bairro,
        cidadeUf: eqForm.cidadeUf,
        rua: eqForm.rua,
        referencia: eqForm.referencia,
        gps: {
          latitude: Number(eqForm.latitude),
          longitude: Number(eqForm.longitude)
        }
      },
      situacao: eqForm.situacao,
      manutencao: {
        necessidade: eqForm.manutencaoNecessidade
      }
    };

    try {
      const res = await fetch(`${API_URL}/equipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Equipamento cadastrado com sucesso!');
        fetchData();
        setTab('inventory');
      } else {
        const err = await res.json();
        alert(`Erro: ${err.error}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
    }
  };

  // Alterar Status Rápido
  const toggleStatus = async (id, currentSituacao) => {
    const novaSituacao = currentSituacao === 'operacional' ? 'mau funcionamento' : 'operacional';
    await fetch(`${API_URL}/equipments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ situacao: novaSituacao })
    });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wider text-red-500">🔥 F.O.G.O. <span className="text-gray-300 text-sm font-normal">| Protocolo Prometheus</span></h1>
          <nav className="space-x-2">
            <button onClick={() => setTab('dashboard')} className={`px-4 py-2 rounded transition ${tab === 'dashboard' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Dashboard</button>
            <button onClick={() => setTab('form')} className={`px-4 py-2 rounded transition ${tab === 'form' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>+ Novo Equipamento</button>
            <button onClick={() => setTab('inventory')} className={`px-4 py-2 rounded transition ${tab === 'inventory' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Inventário ({equipments.length})</button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto p-6">
        
        {/* ABA: DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Visão Geral da Cidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm">Total de Equipamentos</p>
                <p className="text-3xl font-bold mt-2">{equipments.length}</p>
              </div>
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm">Operacionais</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{equipments.filter(e => e.situacao === 'operacional').length}</p>
              </div>
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm">Mau Funcionamento / Alertas</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{equipments.filter(e => e.situacao === 'mau funcionamento' || e.situacao === 'furtado').length}</p>
              </div>
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm">Agentes Cadastrados</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{agents.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* ABA: FORMULÁRIO DE CADASTRO */}
        {tab === 'form' && (
          <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Cadastrar Equipamento IoT</h2>
            <form onSubmit={handleEqSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo de Equipamento</label>
                  <select 
                    value={eqForm.tipo} 
                    onChange={e => setEqForm({...eqForm, tipo: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                  >
                    <option value="radar">Radar de Fiscalização</option>
                    <option value="camera">Câmera de Videomonitoramento</option>
                    <option value="balanca">Balança de Caminhão</option>
                    <option value="patinete">Patinete Elétrico Compartilhado</option>
                    <option value="totem">Totem de Autoatendimento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Número de Série</label>
                  <input type="text" required placeholder="EX: SN-998823"
                    value={eqForm.numeroSerie} onChange={e => setEqForm({...eqForm, numeroSerie: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Marca</label>
                  <input type="text" required placeholder="Ex: Hikvision / Multilaser"
                    value={eqForm.marca} onChange={e => setEqForm({...eqForm, marca: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Modelo</label>
                  <input type="text" required placeholder="Ex: Hawk-Eye 4K"
                    value={eqForm.modelo} onChange={e => setEqForm({...eqForm, modelo: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-300 pt-2 border-t border-gray-700">Localização</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">CEP</label>
                  <input type="text" required placeholder="00000-000"
                    value={eqForm.cep} onChange={e => setEqForm({...eqForm, cep: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Bairro</label>
                  <input type="text" required placeholder="Centro"
                    value={eqForm.bairro} onChange={e => setEqForm({...eqForm, bairro: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cidade / UF</label>
                  <input type="text" required placeholder="São Paulo / SP"
                    value={eqForm.cidadeUf} onChange={e => setEqForm({...eqForm, cidadeUf: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome da Rua</label>
                  <input type="text" required placeholder="Av. Paulista"
                    value={eqForm.rua} onChange={e => setEqForm({...eqForm, rua: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm text-gray-400 mb-1">Referência</label>
                  <input type="text" placeholder="Em frente ao nº 181"
                    value={eqForm.referencia} onChange={e => setEqForm({...eqForm, referencia: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Latitude</label>
                  <input type="number" step="any" required placeholder="-23.5505"
                    value={eqForm.latitude} onChange={e => setEqForm({...eqForm, latitude: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Longitude</label>
                  <input type="number" step="any" required placeholder="-46.6333"
                    value={eqForm.longitude} onChange={e => setEqForm({...eqForm, longitude: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
              </div>

              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded transition mt-4">
                Salvar Equipamento no Inventário
              </button>
            </form>
          </div>
        )}

        {/* ABA: INVENTÁRIO */}
        {tab === 'inventory' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Inventário de Equipamentos</h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300 text-sm">
                    <th className="p-3">Tipo / Modelo</th>
                    <th className="p-3">Série</th>
                    <th className="p-3">Localização</th>
                    <th className="p-3">Situação</th>
                    <th className="p-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-sm">
                  {equipments.map(eq => (
                    <tr key={eq._id} className="hover:bg-gray-750">
                      <td className="p-3">
                        <span className="font-semibold uppercase text-red-400">{eq.tipo}</span>
                        <div className="text-xs text-gray-400">{eq.marca} - {eq.modelo}</div>
                      </td>
                      <td className="p-3 font-mono text-xs">{eq.numeroSerie}</td>
                      <td className="p-3">
                        {eq.localizacao.rua}, {eq.localizacao.bairro}
                        <div className="text-xs text-gray-400">{eq.localizacao.referencia}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          eq.situacao === 'operacional' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {eq.situacao}
                        </span>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => toggleStatus(eq._id, eq.situacao)}
                          className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs transition"
                        >
                          Alternar Status
                        </button>
                      </td>
                    </tr>
                  ))}
                  {equipments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-400">Nenhum equipamento cadastrado ainda.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}