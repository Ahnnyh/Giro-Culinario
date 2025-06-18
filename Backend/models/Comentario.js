const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comentario = sequelize.define('Comentario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estrelas: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  receitaId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Comentarios',
  timestamps: true
});

// Importar User corretamente
const User = require('./User');

// Definir associação (importante que venha DEPOIS da definição dos dois modelos)
Comentario.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comentario, { foreignKey: 'userId' });

module.exports = Comentario;
