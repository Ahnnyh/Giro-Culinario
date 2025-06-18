const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Favorito = sequelize.define('Favorito', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  receitaId: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'Favoritos',
  timestamps: true,
});

Favorito.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Favorito, { foreignKey: 'userId' });

module.exports = Favorito;
