require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { conectarBancoMongo } = require('./database/conexao');

const equipmentRoutes = require('./routes/equipmentRoutes');
const agentRoutes = require('./routes/agentRoutes');
const predictiveRoutes = require('./routes/predictiveRoutes');

const app = express();

// Middlewares
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Aceita requisições do seu Front-end
methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Conexão com o MongoDB
conectarBancoMongo()
    .then(() => {
        console.log("Banco de dados inicializado.");
    })
    .catch((erro) => {
        console.error("Erro ao conectar ao MongoDB:", erro);
    });

// Configuração das Rotas da API
app.use('/api/equipments', equipmentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/predictive', predictiveRoutes);

app.get('/', (req, res) => {
  res.send('🔥 API do Projeto F.O.G.O. (Protocolo Prometheus) Rodando!');
});

const PORT = process.env.PORTA_API || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});