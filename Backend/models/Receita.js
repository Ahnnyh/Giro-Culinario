const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Receita = sequelize.define('Receita', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true // mesmo formato de id (slug) já usado em Comentario.receitaId e Favorito.receitaId
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false // Brasileira | Italiana | Mediterranea | Oriental
  },
  imagem: {
    type: DataTypes.STRING,
    allowNull: false
  },
  midiaPreparo: {
    type: DataTypes.STRING, // caminho do vídeo/gif de preparo, se houver
    allowNull: true
  },
  tipoMidiaPreparo: {
    type: DataTypes.STRING, // "video" ou "gif"
    allowNull: true
  },
  tempo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  porcoes: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ingredientes: {
    type: DataTypes.JSON, // array de strings
    allowNull: false,
    defaultValue: []
  },
  preparo: {
    type: DataTypes.JSON, // array de strings (passo a passo)
    allowNull: false,
    defaultValue: []
  },
  destaque: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // exibida na seção "Receitas em Destaque" da Home
  }
}, {
  tableName: 'Receitas',
  timestamps: true
});

module.exports = Receita;
