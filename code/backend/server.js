// backend/server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dayjs = require('dayjs');
const bodyParser = require('body-parser');

const db = require('./db');
const sequelize = db.sequelize || db.default || db;  // <-- στιβαρό import

const Customer = require('./Customer');
const Appointment = require('./Appointment');

const app = express();

// middlewares
app.use(cors({ origin: 'http://localhost:3000', credentials: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());

// helpers
function toHttpDate(dt) {
  return dayjs(dt).format('YYYY-MM-DD HH:mm:ss');
}

// routes
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: toHttpDate(new Date()) });
});

// list appointments
app.get('/api/appointments', async (req, res, next) => {
  try {
    const rows = await Appointment.findAll({
      include: [{ model: Customer, as: 'customer' }],
      order: [['dateTime', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// create appointment
app.post('/api/appointments', async (req, res, next) => {
  try {
    const { customerId, dateTime, service, notes } = req.body;

    // basic validation + verbose errors
    if (!customerId) return res.status(400).json({ error: 'customerId is required' });
    if (!dateTime) return res.status(400).json({ error: 'dateTime is required' });
    if (!service) return res.status(400).json({ error: 'service is required' });

    const customer = await Customer.findByPk(Number(customerId));
    if (!customer) {
      return res.status(400).json({ error: `Customer ${customerId} not found` });
    }

    // μετατροπή του datetime-local σε Date
    const dt = new Date(dateTime); // π.χ. "2025-09-30T05:02"
    if (Number.isNaN(dt.getTime())) {
      return res.status(400).json({ error: `Invalid dateTime: ${dateTime}` });
    }

    let cid = null;
    if (customerId !== undefined && customerId !== null && `${customerId}`.trim() !== '') {
      const exists = await Customer.findByPk(Number(customerId));
      cid = exists ? Number(customerId) : null;   
    }

    const created = await Appointment.create({
      customerId: cid,
      dateTime: dt,
      service,                      // π.χ. "Κούρεμα, Βαφή"
      notes: (notes || null),
    });

    // επιστρέφουμε και τον customer για να γεμίσει ωραία το UI
    const withCustomer = await Appointment.findByPk(created.id, {
      include: [{ model: Customer, as: 'customer' }],
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/appointments error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// delete appointment
app.delete('/api/appointments/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const deleted = await Appointment.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// generic error handler (επιστρέφει καθαρό JSON στο React)
app.use((err, req, res, _next) => {
  console.error('API error:', err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

// bootstrap: DB sync + demo customers
const PORT = 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    // demo seed μόνο αν δεν υπάρχουν
    const count = await Customer.count();
    if (count === 0) {
      await Customer.bulkCreate([
        {id: 1, firstName: 'Γυναίκα', lastName: '', phone: '2100000001', email: 'fem@example.com' },
        {id: 2, firstName: 'Άντρας', lastName: '', phone: '2100000002', email: 'male@example.com' },
      ]);
      updateOnDuplicate: ['firstName', 'lastName', 'phone', 'email'],
	console.log('👶 Seeded demo customers (IDs 1,2)');
    }

    console.log('DB ready');
  } catch (err) {
    console.error('DB error at startup:', err);
  }

});
