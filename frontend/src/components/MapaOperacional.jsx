import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Coordenadas padrão (ex: Marilia)
const centroPadrao = [-22.2171, -49.9501];

// Função auxiliar para criar ícones coloridos personalizados no Leaflet
const criarIconePersonalizado = (corHex, iconeEmoji) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${corHex};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">
        ${iconeEmoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Definindo os ícones baseados no status e tipo
const iconeOperacional = criarIconePersonalizado('#22c55e', '🟢'); // Verde
const iconeAlerta = criarIconePersonalizado('#ef4444', '🚨');      // Vermelho (Mau funcionamento / Furtado)
const iconeManutencao = criarIconePersonalizado('#eab308', '🔧');  // Amarelo (Manutenção)
const iconeAgente = criarIconePersonalizado('#3b82f6', '👮');      // Azul (Agentes de segurança)

export default function MapaOperacional({ equipments = [], agents = [] }) {
  
  // Função para decidir qual ícone usar no equipamento
  const obterIconeEquipamento = (eq) => {
    // Se o status principal for operacional, o ícone é operacional, ponto final!
    if (eq.situacao === 'operacional') {
      return iconeOperacional;
    }

    // Se estiver com problemas críticos de status:
    if (eq.situacao === 'mau funcionamento' || eq.situacao === 'furtado') {
      return iconeAlerta;
    }

    // Caso contrário, se encaixa nas regras de manutenção preventiva/agendada:
    if (eq.manutencao?.necessidade === 'imediata' || eq.manutencao?.necessidade === 'agendada/periódica') {
      return iconeManutencao;
    }

    return iconeOperacional; // Padrão de segurança
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-700 shadow-lg relative z-0">
      <MapContainer center={centroPadrao} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Renderizando Equipamentos IoT no Mapa */}
        {equipments.map((eq) => {
          const lat = eq.localizacao?.gps?.latitude;
          const lng = eq.localizacao?.gps?.longitude;
          if (!lat || !lng) return null;

          return (
            <Marker 
              key={`eq-${eq._id}`} 
              position={[lat, lng]} 
              icon={obterIconeEquipamento(eq)}
            >
              <Popup>
                <div className="text-gray-900 p-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded uppercase">
                      {eq.tipo}
                    </span>
                    <span className="text-xs font-mono text-gray-500">{eq.numeroSerie}</span>
                  </div>
                  <p className="font-semibold text-gray-800">{eq.marca} - {eq.modelo}</p>
                  <p className="text-xs text-gray-600">
                    📍 {eq.localizacao.rua}, {eq.localizacao.bairro}
                    {eq.localizacao.referencia && <span className="block italic">Ref: {eq.localizacao.referencia}</span>}
                  </p>
                  <div className="pt-1 border-t border-gray-200 text-xs flex justify-between items-center">
                    <span>Situação:</span>
                    <strong className={`px-2 py-0.5 rounded ${
                      eq.situacao === 'operacional' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {eq.situacao}
                    </strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 2. Renderizando Agentes de Segurança em Campo (Simulando coordenadas fixas ou vinculadas caso possuam) */}
        {agents.map((ag, index) => {
          // Nota: Caso seus agentes ainda não tenham GPS próprio cadastrado, 
          // usamos coordenadas levemente deslocadas ao redor do centro para visualização no mapa.
          const lat = ag.gps?.latitude || (centroPadrao[0] + (index * 0.008));
          const lng = ag.gps?.longitude || (centroPadrao[1] + (index * 0.008));

          return (
            <Marker 
              key={`ag-${ag._id}`} 
              position={[lat, lng]} 
              icon={iconeAgente}
            >
              <Popup>
                <div className="text-gray-900 p-1 space-y-1">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded uppercase">
                    {ag.funcao}
                  </span>
                  <p className="font-semibold text-gray-800 mt-1">{ag.nome}</p>
                  <p className="text-xs text-gray-600">Matrícula: <span className="font-mono">{ag.matricula}</span></p>
                  <p className="text-xs text-gray-600">Lotação: {ag.lotacao}</p>
                  <div className="pt-1 border-t border-gray-200 text-xs flex justify-between items-center">
                    <span>Status:</span>
                    <strong className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {ag.situacaoAtual || 'Em patrulhamento'}
                    </strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
    </div>
  );
}