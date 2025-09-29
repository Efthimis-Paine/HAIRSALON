// backend/Customer.js
const { DataTypes } = require('sequelize');
const db = require('./db');

// Υποστήριξη και των δύο export styles από το db.js
const sequelize = db.sequelize || db.default || db;

if (!sequelize || typeof sequelize.define !== 'function') {
  throw new Error('Sequelize instance not found from ./db (check exports/imports).');
}

const Customer = sequelize.define('Customer', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName:  { type: DataTypes.STRING, allowNull: true },
  phone:     { type: DataTypes.STRING, allowNull: true },
  email:     { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'Customers',
});

module.exports = Customer;
