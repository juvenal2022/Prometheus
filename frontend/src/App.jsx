import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import MapaOperacional from './components/MapaOperacional';
import DashboardPreditivo from './components/DashboardPreditivo';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [equipments, setEquipments] = useState([]);
  const [agents, setAgents] = useState([]);
  
  // Estado do formulário de Equipamento
  const [eqForm, setEqForm] = useState({
    tipo: 'radar',
    novoTipo: '',
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

  // Estado do formulário de Agente
  const [agForm, setAgForm] = useState({
    nome: '',
    matricula: '',
    funcao: '',
    lotacao: 'Base Central',
    situacaoAtual: 'em base',
    contatoRadio: ''
  });

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
    // Define o tipo do equipamento
    const tipoFinal = eqForm.tipo === 'outro' ? eqForm.novoTipo.trim() : eqForm.tipo;
   
    // Valida o tipo personalizado
    if (!tipoFinal) {
      alert('Informe o nome do novo tipo de equipamento.');
      return;
    }
    const payload = {
      tipo: tipoFinal,
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

  // Cadastrar Agente
  const handleAgSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nome: agForm.nome,
      matricula: agForm.matricula,
      funcao: agForm.funcao,
      lotacao: agForm.lotacao,
      situacaoAtual: agForm.situacaoAtual,
      contatoRadio: agForm.telefone
    };

    try {
      const res = await fetch(`${API_URL}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Agente cadastrado com sucesso!');
        fetchData();
        setTab('dashboard');
      } else {
        const err = await res.json();
        alert(`Erro: ${err.error}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar agente:', error);
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

  // Função para alterar o status de um equipamento específico
  const alterarStatusEquipamento = async (id, novoStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/equipments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ situacao: novoStatus }), // Ex: 'operacional', 'mau funcionamento', etc.
      });
    
      const data = await response.json();
    
      if (response.ok) {
        alert('Status alterado com sucesso!');
        // Recarrega a lista de inventário na tela
        if (typeof fetchData === 'function') {
          fetchData();
        }
      } else {
        alert(data.error || 'Erro ao alterar o status.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão ao tentar alterar o status.');
    }
  };

  // Simular Incidente em Tempo Real
  const simularIncidenteEmTempoReal = async () => {
    try {
      const res = await fetch(`${API_URL}/equipments/simular/incidente`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(`🚨 SIMULAÇÃO: ${data.message} (${data.equipamentoAfetado?.tipo} agora está ${data.equipamentoAfetado?.situacao})`);
        
        // Recarrega os dados do app para atualizar o mapa e os contadores automaticamente
        if (typeof fetchData === 'function') {
          fetchData(); 
        }
      } else {
        alert(data.error || data.message || 'Erro ao simular incidente');
      }
    } catch (error) {
      console.error('Erro ao simular incidente:', error);
      alert('Erro de conexão com o servidor ao simular incidente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wider text-red-500">🔥 F.O.G.O. <span className="text-gray-300 text-sm font-normal">| Protocolo Prometheus</span></h1>
          <nav className="space-x-2">
            <button onClick={() => setTab('dashboard')} className={`px-4 py-2 rounded transition ${tab === 'dashboard' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Dashboard</button>
            <button onClick={() => setTab('formEq')} className={`px-4 py-2 rounded transition ${tab === 'formEq' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>+ Novo Equipamento</button>
            <button onClick={() => setTab('formAg')} className={`px-4 py-2 rounded transition ${tab === 'formAg' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>+ Novo Agente</button>
            <button onClick={() => setTab('inventory')} className={`px-4 py-2 rounded transition ${tab === 'inventory' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Inventário ({equipments.length})</button>
            <button onClick={() => setTab('inteligence')} className={`px-4 py-2 rounded transition ${tab === 'inteligence' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Inteligência Preditiva</button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto p-6">
        
        {/* ABA: DASHBOARD */}
        {tab === 'dashboard' && (
          <>
            <div className="space-y-6 mb-6">
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
            {/* Mapa Operacional em Tempo Real */}
            <>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Central de Operações (Mapa em Tempo Real)</h2>
                <MapaOperacional equipments={equipments} agents={agents} />
                <button 
                  onClick={simularIncidenteEmTempoReal}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
                >
                  🚨 Simular Incidente em Tempo Real
                </button>
              </div>
            </>
          </>
        )}

        {/* ABA: FORMULÁRIO DE CADASTRO DE EQUIPAMENTO*/}
        {tab === 'formEq' && (
          <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Cadastrar Equipamento IoT</h2>
            <form onSubmit={handleEqSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo de Equipamento</label>
                  <select 
                    value={eqForm.tipo || "radar"} 
                    onChange={e => {
                      const valor = e.target.value;
                      setEqForm(prev => ({
                        ...prev,
                        tipo: valor,
                        novoTipo: valor === "outro" ? (prev.novoTipo || "") : ""
                      }));
                      console.log(eqForm.tipo);
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                  >
                    <option value="radar">Radar de Fiscalização</option>
                    <option value="camera">Câmera de Videomonitoramento</option>
                    <option value="balanca">Balança de Caminhão</option>
                    <option value="patinete">Patinete Elétrico Compartilhado</option>
                    <option value="totem">Totem de Autoatendimento</option>
                    <option value="outro">Outro</option>
                  </select> 
                  
                  {(() => {
                    if (eqForm.tipo !== 'outro') return null;
                  
                    return (
                      <div className="mt-3">
                        <label className="block text-sm text-white mb-1">
                          Nome do novo equipamento
                        </label>
                    
                        <input
                          type="text"
                          value={eqForm.novoTipo || ''}
                          onChange={(e) =>
                            setEqForm(prev => ({
                              ...prev,
                              novoTipo: e.target.value
                            }))
                          }
                          placeholder="Ex.: Painel eletrônico"
                          required
                          style={{
                            display: 'block',
                            width: '100%',
                            backgroundColor: '#111827',
                            color: '#ffffff',
                            border: '1px solid #9ca3af',
                            padding: '10px',
                            borderRadius: '6px'
                          }}
                        />
                      </div>
                    );
                  })()}

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
                  <input type="number" step="any" placeholder="-23.5505"
                    value={eqForm.latitude} onChange={e => setEqForm({...eqForm, latitude: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Longitude</label>
                  <input type="number" step="any" placeholder="-46.6333"
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

        {/* ABA: FORMULÁRIO DE CADASTRO DE AGENTE */}
        {tab === 'formAg' && (
          <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Cadastrar Agente</h2>
            <form onSubmit={handleAgSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome do Agente</label>
                <input type="text" required placeholder="Ex: João da Silva"
                  value={agForm.nome} onChange={e => setAgForm({...agForm, nome: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Matrícula</label>
                <input type="text" required placeholder="Ex: 123456"
                  value={agForm.matricula} onChange={e => setAgForm({...agForm, matricula: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Função</label>
                <select 
                  value={agForm.funcao || ""}
                  onChange={e => setAgForm({...agForm, funcao: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                >
                  <option value="">Selecione a função</option>
                  <option value="agente de trânsito">Agente de Trânsito</option>
                  <option value="guarda municipal">Guarda Municipal</option>
                  <option value="policial militar">Policial Militar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contato via Rádio</label>
                <input type="text" placeholder="Ex: 1234-5678"
                  value={agForm.telefone} onChange={e => setAgForm({...agForm, telefone: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded transition mt-4">
                Salvar Agente
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

        {/* ABA INTELIGÊNCIA */}
        {tab === 'inteligence' && (
          <div className="space-y-4">
            <DashboardPreditivo />
          </div>
        )}
      </main>
    </div>
  );
}