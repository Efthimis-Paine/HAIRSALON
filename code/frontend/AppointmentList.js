// src/components/AppointmentList.js
import React from "react";
import { deleteAppointment } from "../services/appointmentService";

// Map για εμφάνιση πελάτη όταν δεν έρχεται nested customer object
const CUSTOMER_LABELS = {
  1: "Γυναίκα",
  2: "Άντρας",
};

const AppointmentList = ({ appointments = [], onDeleted }) => {
  const handleDelete = async (id) => {
    if (!window.confirm("Σίγουρα διαγραφή;")) return;
    await deleteAppointment(id);
    onDeleted?.(id);
  };

  return (
    <div className="card">
      <h2 className="card-title">Ραντεβού</h2>

      {appointments.length === 0 ? (
        <p className="muted">Δεν υπάρχουν ραντεβού.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Πελάτης</th>
              <th>Ημ/νία & ώρα</th>
              <th>Υπηρεσία</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => {
              // Εμφάνιση ονόματος πελάτη:
              // 1) Αν υπάρχει nested a.customer, προτιμά firstName/lastName ή name
              // 2) Αλλιώς εμφάνισε από το mapping CUSTOMER_LABELS με βάση το a.customerId
              const customerFromObject =
                a.customer
                  ? (a.customer.firstName ||
                      a.customer.name ||
                      `${a.customer.firstName ?? ""} ${a.customer.lastName ?? ""}`.trim())
                  : null;

              const customerDisplay =
                customerFromObject && customerFromObject.length > 0
                  ? customerFromObject
                  : CUSTOMER_LABELS[a.customerId] || "-";

              // Μετατροπή comma-separated service σε string με " - " ανάμεσα
              const servicesText =
                typeof a.service === "string" && a.service.length > 0
                  ? a.service
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .join(" - ")
                  : "-";

              return (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{customerDisplay}</td>
                  <td>{a.dateTime ? new Date(a.dateTime).toLocaleString() : "-"}</td>
                  <td>{servicesText}</td>
                  <td>
                    <button className="btn-danger" onClick={() => handleDelete(a.id)}>
                      Διαγραφή
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AppointmentList;
