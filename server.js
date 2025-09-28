import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Σύνδεση MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Βάλε τον δικό σου κωδικό MySQL
  database: "hairsalon"
});

function toMySQLDateTime(dtStr) {
  if (!dtStr) return null;

  // Προσπαθώ πρώτα με το Date(...)
  let d = new Date(dtStr);
  if (isNaN(d.getTime())) {
    // Αν είναι της μορφής "YYYY-MM-DDTHH:mm" (local), φτιάξε το manual
    const [datePart, timePart = "00:00"] = dtStr.split("T");
    const [y, m, day] = datePart.split("-").map(Number);
    const [hh, mm = 0] = timePart.split(":").map(Number);
    d = new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, 0);
  }

  const pad = (n) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}

// GET όλα τα ραντεβού
app.get("/api/appointments", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.date_time, a.service, a.notes,
             c.id AS customerId, c.first_name, c.last_name, c.phone
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      ORDER BY a.date_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// POST νέο ραντεβού
app.post('/api/appointments', async (req, res) => {
  try {
    // Δες τι παίρνεις από το front
    console.log('REQ BODY:', req.body);

    let { customerId, dateTime, service, notes } = req.body;

    // Βασική επικύρωση
    if (customerId === undefined || customerId === null || customerId === '') {
      return res.status(400).json({ message: 'customerId is required' });
    }
    if (!dateTime) {
      return res.status(400).json({ message: 'dateTime is required' });
    }
    if (!service) {
      return res.status(400).json({ message: 'service is required' });
    }

    const cid = Number(customerId);
    if (!Number.isInteger(cid) || cid <= 0) {
      return res.status(400).json({ message: 'Invalid customerId' });
    }

    // Υπάρχει ο πελάτης;
    const [cust] = await pool.query('SELECT id FROM customers WHERE id = ?', [cid]);
    if (cust.length === 0) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    const dt = toMySQLDateTime(dateTime);
    if (!dt) {
      return res.status(400).json({ message: 'Invalid dateTime format' });
    }

    // Εισαγωγή
    const [result] = await pool.query(
      'INSERT INTO appointments (customer_id, date_time, service, notes) VALUES (?, ?, ?, ?)',
      [cid, dt, service, notes ?? null]
    );

    // Επιστροφή του νεοδημιούργητου ραντεβού (με στοιχεία πελάτη)
    const [rows] = await pool.query(
      `SELECT a.id,
              a.date_time   AS dateTime,
              a.service,
              a.notes,
              c.id          AS customerId,
              c.first_name  AS firstName,
              c.last_name   AS lastName
       FROM appointments a
       JOIN customers c ON c.id = a.customer_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error inserting appointment:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});
// DELETE ραντεβού
app.delete("/api/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM appointments WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
