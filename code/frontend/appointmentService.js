// src/services/appointmentService.js

// frontend/src/services/appointmentService.js
import axios from "axios";

const API_URL = "http://localhost:3001/api/appointments";

export const getAppointments = () => axios.get(API_URL);

export const createAppointment = (data) => axios.post(API_URL, data);

export const deleteAppointment = (id) => axios.delete(`${API_URL}/${id}`);


const KEY = "appointments_v1";
const SEQ = "appointments_v1_seq";

const customers = {
  1: { id: 1, firstName: "Γυναίκα", lastName: "" },
  2: { id: 2, firstName: "Άντρας", lastName: "" },
};

function read() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify([]));
    localStorage.setItem(SEQ, "0");
    return [];
  }
  return JSON.parse(raw);
}

function write(rows) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

function nextId() {
  const n = parseInt(localStorage.getItem(SEQ) || "0", 10) + 1;
  localStorage.setItem(SEQ, String(n));
  return n;
}

function hydrate(appt) {
  return { ...appt, customer: customers[appt.customerId] || null };
}

async function getAll() {
  // συμβατότητα: αν είχε αποθηκευτεί παλιότερα ως single "service"
  return read()
    .map((a) => (a.services ? a : { ...a, services: a.service ? [a.service] : [] }))
    .map((a) => ({ notes: "", ...a })) // default κενό notes
    .map(hydrate);
}

async function create({ customerId, dateTime, services, service, notes = "" }) {
  const rows = read();
  const normalized = Array.isArray(services)
    ? services
    : service
    ? [service]
    : [];

  const appt = {
    id: nextId(),
    customerId,
    dateTime,
    services: normalized,
    notes, // <-- αποθήκευση σημειώσεων
  };

  rows.push(appt);
  write(rows);
  return hydrate(appt);
}

async function remove(id) {
  write(read().filter((a) => a.id !== id));
}

export default { getAll, create, remove };

