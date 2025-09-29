// backend/db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('hairsalon', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  timezone: '+00:00',
  define: { timestamps: false },
});

// << Μπορείς να κάνεις export με ΔΥΟ τρόπους ταυτόχρονα για ασφάλεια >>
module.exports = { sequelize };
module.exports.default = sequelize;      // ώστε require('./db') να γυρνάει instance αν κάπου το ζητήσαμε σκέτο
