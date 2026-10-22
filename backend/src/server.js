const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const equipmentRoutes = require('./routes/equipmentRoutes');
const agentRoutes = require('./routes/agentRoutes');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Conexão com o MongoDB (Certifique-se de ter o MongoDB rodando localmente ou use o Atlas)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fogo_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('📦 Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Configuração das Rotas da API
app.use('/api/equipments', equipmentRoutes);
app.use('/api/agents', agentRoutes);

app.get('/', (req, res) => {
  res.send('🔥 API do Projeto F.O.G.O. (Protocolo Prometheus) Rodando!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});