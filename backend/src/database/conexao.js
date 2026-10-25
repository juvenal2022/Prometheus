const mongoose = require("mongoose");
require("dotenv").config();

function conectarBancoMongo() {
    const URI_BANCO = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=${process.env.DB_USER}`;

    mongoose.connection.on("open", () => {
        console.log("Conectado com sucesso ao MongoDB.");
    });

    const conexao = mongoose.connect(URI_BANCO);

    return conexao;
}

module.exports = { conectarBancoMongo };
