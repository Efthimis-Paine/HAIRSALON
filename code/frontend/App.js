import React, { useEffect, useState } from "react";
import AppointmentForm from "./components/AppointmentForm";
import AppointmentList from "./components/AppointmentList";
import { getAppointments } from "./services/appointmentService";

function App() {
  const [appointments, setAppointments] = useState([]);

  // Φόρτωμα ραντεβού από backend
  const fetchAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreated = (appointment) => {
    setAppointments((prev) => [appointment, ...prev]);
  };

  const handleDeleted = (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="app-shell">
  <header style={{marginBottom:16}}>
    <h1>Διαχείριση ραντεβού κομμωτηρίου</h1>
  </header>

  <section className="card">
    <AppointmentForm onCreate={handleCreated} />
  </section>

  <section className="card">
    <AppointmentList appointments={appointments} onDeleted={handleDeleted} />
  </section>
</div>

  );
}

export default App;
