import React, { useEffect, useMemo, useState } from "react";
import { get_appointments, update_appointment_status } from "./appointment_service";

const tabs = ["Upcoming", "Today", "Past"];

const todayISO = () => new Date().toISOString().slice(0, 10);

const toDate = (appointment) =>
  new Date(`${appointment.date}T${appointment.time}:00`);

const isSameDay = (dateStr) => dateStr === todayISO();

const isPast = (appointment) => toDate(appointment) < new Date();

const isToday = (appointment) => appointment.date === todayISO();

const isUpcoming = (appointment) =>
  !isPast(appointment) || isToday(appointment);

function EMR_Frontend_Assignment() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await Promise.resolve(
        get_appointments(filters.date ?? undefined, filters.status ?? undefined)
      );
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDateChange = async (event) => {
    const dateValue = event.target.value;
    setSelectedDate(dateValue);
    await fetchAppointments({ date: dateValue });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleStatusChange = async (appointmentId, nextStatus) => {
    const updated = await Promise.resolve(
      update_appointment_status(appointmentId, nextStatus)
    );

    // Optimistically update state to simulate real-time subscription delivery.
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === updated.id ? { ...appt, status: updated.status } : appt
      )
    );
  };

  const displayedAppointments = useMemo(() => {
    const base = selectedDate
      ? appointments.filter((appt) => appt.date === selectedDate)
      : appointments;

    if (activeTab === "Today") {
      return base.filter(isToday);
    }

    if (activeTab === "Past") {
      return base.filter((appt) => isPast(appt) && !isToday(appt));
    }

    return base.filter(isUpcoming);
  }, [appointments, selectedDate, activeTab]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Appointment Management View
          </h1>
          <p className="text-sm text-gray-500">
            Connects UI actions to the mock AppSync/Lambda layer.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="rounded border px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              setSelectedDate("");
              fetchAppointments();
            }}
            className="rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          >
            Clear Filter
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`rounded px-4 py-2 text-sm ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading appointments...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {displayedAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded border p-4 shadow-sm space-y-2"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{appointment.name}</p>
                  <p className="text-sm text-gray-500">
                    {appointment.doctorName} • {appointment.mode}
                  </p>
                </div>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                  {appointment.status}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {appointment.date} at {appointment.time} ({appointment.duration}{" "}
                mins)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleStatusChange(appointment.id, "Confirmed")
                  }
                  disabled={appointment.status === "Confirmed"}
                  className="rounded bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() =>
                    handleStatusChange(appointment.id, "Cancelled")
                  }
                  disabled={appointment.status === "Cancelled"}
                  className="rounded bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
          {!displayedAppointments.length && (
            <div className="text-sm text-gray-500">
              No appointments match the current filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EMR_Frontend_Assignment;

