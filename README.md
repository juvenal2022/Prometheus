# F.O.G.O. — Protocolo Prometheus

Prova de Conceito de uma aplicação web para apoiar uma central de operações urbanas. O sistema reúne o cadastro de equipamentos e agentes, exibe os registros em um mapa e apresenta uma análise heurística de risco por região.

> A análise preditiva disponível é uma simulação baseada nos estados cadastrados; não é um modelo de aprendizado de máquina nem uma previsão treinada com dados históricos.

## Funcionalidades

- Painel com totais de equipamentos, equipamentos operacionais, alertas e agentes cadastrados.
- Mapa operacional com marcadores de equipamentos e agentes. Os equipamentos usam as coordenadas GPS cadastradas; para agentes sem GPS, o mapa gera posições aproximadas ao redor de Marília.
- Cadastro de equipamentos com tipo, identificação, endereço e GPS opcional.
- Cadastro de agentes com matrícula, função, lotação e situação.
- Inventário com alternância rápida da situação dos equipamentos.
- Simulação de incidente: escolhe aleatoriamente um equipamento operacional e o marca como “mau funcionamento” ou “furtado”, com manutenção imediata.
- Painel de análise por região, com contagem de falhas, índice de risco e recomendação.

## Tecnologias

- **Frontend:** React 19, Vite 8, Tailwind CSS 3, Leaflet e React Leaflet.
- **Backend:** Node.js, Express 5 e Mongoose 9.
- **Banco de dados:** MongoDB 7.
- **Administração opcional do banco:** Mongo Express.

## Estrutura do repositório

```text
.
├── backend/
│   ├── src/
│   │   ├── database/     # conexão MongoDB
│   │   ├── models/       # modelos de equipamentos e agentes
│   │   ├── routes/       # endpoints REST
│   │   ├── services/     # operações de negócio
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # mapa e painel preditivo
│   │   └── App.jsx
│   └── package.json
└── docker-compose.yml    # MongoDB e Mongo Express
```

## Requisitos

- Node.js compatível com Vite 8 e npm.
- Docker e Docker Compose, ou uma instância MongoDB configurada manualmente.

## Executar localmente

### 1. Iniciar o banco de dados

Na raiz do repositório, inicie os serviços de banco definidos no Compose:

```bash
docker compose up -d
```

O Compose disponibiliza o MongoDB na porta `27017` e o Mongo Express na porta `8081`. O volume `mongo_data` mantém os dados entre reinicializações.

### 2. Configurar e iniciar a API

Crie o arquivo `backend/.env` com os valores usados pela conexão MongoDB:

```dotenv
DB_USER=<user>
DB_PASSWORD=<password>
DB_HOST=localhost
DB_PORT=27017
DB_NAME=<db-name>
PORTA_API=5000
```

Instale as dependências e inicie o servidor:

```bash
cd backend
npm install
node src/server.js
```

A API ficará disponível em `http://localhost:5000`. O backend não define um script `start` no `package.json`; por isso, o comando acima inicia o arquivo de servidor diretamente.

### 3. Iniciar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O frontend aponta para `http://localhost:5000/api`, e o CORS da API permite as origens locais `localhost:5173` e `127.0.0.1:5173`.

Para gerar e pré-visualizar a versão de produção do frontend:

```bash
cd frontend
npm run build
npm run preview
```

O script `npm run lint` também está configurado no frontend. No backend, o script `npm test` é apenas um placeholder e encerra com erro (“no test specified”).

## API

Todas as rotas abaixo são relativas à base `http://localhost:5000` e recebem/devolvem JSON, salvo a rota raiz.

### Saúde do servidor

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/` | Mensagem indicando que a API está em execução. |

### Equipamentos

Prefixo: `/api/equipments`.

| Método | Caminho | Descrição |
| --- | --- | --- |
| `POST` | `/api/equipments` | Cadastra um equipamento; retorna `201` com o registro. |
| `GET` | `/api/equipments` | Lista equipamentos. Filtros opcionais: `tipo`, `bairro` (busca parcial sem diferenciar maiúsculas/minúsculas), `situacao` e `manutencaoImediata=true`. |
| `GET` | `/api/equipments/:id` | Busca um equipamento pelo identificador MongoDB. |
| `PATCH` | `/api/equipments/:id/status` | Atualiza os campos enviados no corpo. Se `situacao` for `operacional`, a necessidade de manutenção também passa para `nenhuma`. |
| `DELETE` | `/api/equipments/:id` | Remove um equipamento. |
| `GET` | `/api/equipments/alertas/criticos` | Lista equipamentos com falha, furtados ou com manutenção imediata. |
| `POST` | `/api/equipments/simular/incidente` | Simula uma falha em um equipamento operacional. |

Exemplo de corpo para cadastrar equipamento:

```json
{
	"tipo": "camera",
	"numeroSerie": "CAM-001",
	"marca": "Fabricante",
	"modelo": "Modelo 4K",
	"localizacao": {
		"cep": "17500-000",
		"bairro": "Centro",
		"cidadeUf": "Marília / SP",
		"rua": "Rua Exemplo",
		"referencia": "Próximo à praça",
		"gps": {
			"latitude": -22.2171,
			"longitude": -49.9501
		}
	},
	"situacao": "operacional",
	"manutencao": {
		"necessidade": "nenhuma"
	}
}
```

Os campos `tipo`, `numeroSerie`, `marca`, `modelo` e os campos de endereço `cep`, `bairro`, `cidadeUf` e `rua` são obrigatórios. O número de série deve ser único. Situações aceitas: `ainda não instalado`, `operacional`, `mau funcionamento`, `desativado` e `furtado`. Necessidades de manutenção aceitas: `imediata`, `agendada/periódica` e `nenhuma`.

### Agentes

Prefixo: `/api/agents`.

| Método | Caminho | Descrição |
| --- | --- | --- |
| `POST` | `/api/agents` | Cadastra um agente; retorna `201` com o registro. |
| `GET` | `/api/agents` | Lista agentes. Filtros opcionais: `funcao` e `situacaoAtual`. |
| `PATCH` | `/api/agents/:id/status` | Atualiza a situação atual do agente, enviada como `situacaoAtual` no corpo. |

Campos obrigatórios do agente: `nome`, `matricula`, `funcao` e `lotacao`. A matrícula é única. Funções permitidas: `agente de trânsito`, `guarda municipal` e `policial militar`. Situações permitidas: `em base`, `em patrulhamento`, `em ocorrência` e `folga/indisponível`.

### Análise preditiva

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/api/predictive/analise-preditiva` | Calcula o índice a partir dos equipamentos cadastrados. Aceita os mesmos filtros de listagem de equipamentos. |

A resposta contém `timestamp`, a janela de pico configurada como `18:00 - 21:00` e uma lista `analiseRegioes`. O índice é a porcentagem de equipamentos classificados como `mau funcionamento` ou `furtado`: risco baixo até 15, moderado acima de 15 e crítico acima de 40. Recomendações textuais são montadas a partir desse nível.

## Modelos de dados

- **Equipamento:** tipo, número de série, marca, modelo, localização (incluindo GPS), situação, manutenção e características específicas. Os modelos também registram `createdAt` e `updatedAt`.
- **Agente:** nome, matrícula, função, lotação, situação atual e contato de rádio, também com datas de criação e atualização.
