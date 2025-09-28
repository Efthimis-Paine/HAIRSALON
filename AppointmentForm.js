// src/components/AppointmentForm.js
import React, { useState } from "react";
import { createAppointment } from "../services/appointmentService";

// Σταθερή λίστα διαθέσιμων υπηρεσιών
const SERVICE_OPTIONS = [
  "Κούρεμα",
  "Βαφή",
  "Χτένισμα",
  "Ανταύγειες",
  "Θεραπεία",
];

const AppointmentForm = ({ onCreate }) => {
  // Καταστάσεις πεδίων
  const [customerId, setCustomerId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [services, setServices] = useState([]); // ΠΟΛΛΑΠΛΕΣ υπηρεσίες
  const [notes, setNotes] = useState("");

  // Εναλλαγή επιλογής υπηρεσίας (pill -> selected/unselected)
  const toggleService = (svc) => {
    setServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  // Αφαίρεση από τα chips (το "x" στο chip)
  const removeService = (svc) => {
    setServices((prev) => prev.filter((s) => s !== svc));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!customerId || !dateTime || services.length === 0) {
      alert("Συμπλήρωσε Customer ID, Ημερομηνία/Ώρα και τουλάχιστον μία Υπηρεσία.");
      return;
    }

    // Το backend (Node/MySQL) περιμένει string για service (comma-separated)
    const payload = {
      customerId: Number(customerId),
      dateTime, // ISO string από <input type="datetime-local">
      service: services.join(", "),
      notes: notes.trim() || null,
    };

    try {
      const res = await createAppointment(payload);
      // ενημέρωση λίστας στον γονέα (αν παρέχεται)
      onCreate?.(res.data);

      // καθάρισμα φόρμας (κρατάω το customerId για ευκολία)
      setDateTime("");
      setServices([]);
      setNotes("");
    } catch (err) {
      console.error(err);
      alert("Κάτι πήγε στραβά κατά την αποθήκευση του ραντεβού.");
    }
  };

  return (
    <form onSubmit={submit} className="card">
      <h3 className="card-title">Νέο ραντεβού</h3>

      <div className="form-grid">
        {/* Customer ID */}
        <label className="form-field">
          <span>Customer ID</span>
          <input
            type="number"
            min="1"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="π.χ. 1"
            className="input"
          />
        </label>

        {/* Ημερομηνία & ώρα */}
        <label className="form-field">
          <span>Ημερομηνία & ώρα</span>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="input"
          />
        </label>

        {/* Υπηρεσίες: toggle pills */}
        <div className="form-field">
          <span>Υπηρεσία(ες)</span>
          <div className="pill-row">
            {SERVICE_OPTIONS.map((opt) => {
              const active = services.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleService(opt)}
                  className={`pill ${active ? "pill--active" : ""}`}
                  aria-pressed={active}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Επιλεγμένες (ως chips αφαιρούμενα) */}
          {services.length > 0 && (
            <div className="chips-row">
              {services.map((svc) => (
                <span key={svc} className="chip">
                  {svc}
                  <button
                    type="button"
                    className="chip__x"
                    aria-label={`Αφαίρεση ${svc}`}
                    onClick={() => removeService(svc)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Προαιρετικές σημειώσεις */}
        <label className="form-field">
          <span>Σημειώσεις (προαιρετικό)</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Π.χ. ευαισθησία στο τριχωτό, extra χρόνος για styling κ.λπ."
            className="textarea"
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Αποθήκευση
          </button>
        </div>
      </div>

      <p className="muted">
        Tip: Με τα demo δεδομένα υπάρχουν ήδη πελάτες με IDs 1 και 2.
      </p>
    </form>
  );
};

export default AppointmentForm;
