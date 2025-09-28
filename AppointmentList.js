// src/components/AppointmentList.js
import React from "react";
import { deleteAppointment } from "../services/appointmentService";

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
              const fullName = a.customer
                ? `${a.customer.firstName ?? ""} ${a.customer.lastName ?? ""}`.trim() || "-"
                : "-";

              // Διασπά το comma-separated string σε chips
              const chips =
                typeof a.service === "string" && a.service.length > 0
                  ? a.service.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];

              return (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{fullName}</td>
                  <td>{a.dateTime ? new Date(a.dateTime).toLocaleString() : "-"}</td>
                  <td>
                    {chips.length > 0 ? (
                      <div className="chips-wrap">
                        {chips.map((c) => (
                          <span key={c} className="chip chip--soft">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
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
