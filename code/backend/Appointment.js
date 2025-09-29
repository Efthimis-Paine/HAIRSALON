// backend/Appointment.js
const { DataTypes } = require('sequelize');
const db = require('./db');
const Customer = require('./Customer');

const sequelize = db.sequelize || db.default || db;

if (!sequelize || typeof sequelize.define !== 'function') {
  throw new Error('Sequelize instance not found from ./db (check exports/imports).');
}

const Appointment = sequelize.define('Appointment', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customerId: { type: DataTypes.INTEGER, allowNull: true },
  dateTime:   { type: DataTypes.DATE, allowNull: false },
  service:    { type: DataTypes.STRING(500), allowNull: false }, // comma-separated services
  notes:      { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'Appointments',
});

Appointment.belongsTo(Customer, { as: 'customer', foreignKey: 'customerId', onDelete: 'SET NULL' });
Customer.hasMany(Appointment, { as: 'appointments', foreignKey: 'customerId' });

module.exports = Appointment;
