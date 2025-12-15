"""
Mock appointment service simulating a lightweight AppSync + Aurora stack.

Functions here are intentionally simple and synchronous to keep the assignment
focused on data flow rather than infrastructure plumbing.
"""

from __future__ import annotations

from typing import List, Dict, Any, Optional

# In a real system this would be stored in Aurora/PostgreSQL.
_APPOINTMENTS: List[Dict[str, Any]] = [
    # Past appointments (before today: 2025-12-15)
    {
        "id": 1,
        "name": "Alice Johnson",
        "date": "2025-12-10",
        "time": "09:00",
        "duration": 30,
        "doctorName": "Dr. Smith",
        "status": "Confirmed",
        "mode": "In-Person",
    },
    {
        "id": 2,
        "name": "Brian Lee",
        "date": "2025-12-12",
        "time": "10:00",
        "duration": 45,
        "doctorName": "Dr. Patel",
        "status": "Cancelled",
        "mode": "Online",
    },
    # Today (2025-12-15)
    {
        "id": 3,
        "name": "Carmen Diaz",
        "date": "2025-12-15",
        "time": "09:30",
        "duration": 20,
        "doctorName": "Dr. Smith",
        "status": "Upcoming",
        "mode": "In-Person",
    },
    {
        "id": 4,
        "name": "Dmitri Ivanov",
        "date": "2025-12-15",
        "time": "11:00",
        "duration": 30,
        "doctorName": "Dr. Gomez",
        "status": "Scheduled",
        "mode": "Online",
    },
    {
        "id": 5,
        "name": "Ella Chen",
        "date": "2025-12-15",
        "time": "16:15",
        "duration": 60,
        "doctorName": "Dr. Patel",
        "status": "Confirmed",
        "mode": "In-Person",
    },
    # Upcoming (after today)
    {
        "id": 6,
        "name": "Farid Khan",
        "date": "2025-12-16",
        "time": "08:00",
        "duration": 30,
        "doctorName": "Dr. Smith",
        "status": "Upcoming",
        "mode": "Online",
    },
    {
        "id": 7,
        "name": "Grace Park",
        "date": "2025-12-16",
        "time": "14:00",
        "duration": 30,
        "doctorName": "Dr. Gomez",
        "status": "Scheduled",
        "mode": "In-Person",
    },
    {
        "id": 8,
        "name": "Hector Ruiz",
        "date": "2025-12-17",
        "time": "13:00",
        "duration": 45,
        "doctorName": "Dr. Patel",
        "status": "Upcoming",
        "mode": "Online",
    },
    {
        "id": 9,
        "name": "Isabelle Moreau",
        "date": "2025-12-18",
        "time": "15:30",
        "duration": 30,
        "doctorName": "Dr. Smith",
        "status": "Confirmed",
        "mode": "In-Person",
    },
    {
        "id": 10,
        "name": "Jamal Wright",
        "date": "2025-12-19",
        "time": "09:15",
        "duration": 30,
        "doctorName": "Dr. Gomez",
        "status": "Scheduled",
        "mode": "Online",
    },
]


def get_appointments(
    date: Optional[str] = None,
    status: Optional[str] = None,
    doctor_name: Optional[str] = None,
    patient_name: Optional[str] = None,
):
    """
    Retrieve appointments with optional filters.

    In a production stack this would be the place where an AppSync GraphQL
    resolver would read from Aurora (or a read replica) using the provided
    filter arguments.
    """

    results = list(_APPOINTMENTS)

    if date:
        results = [appt for appt in results if appt["date"] == date]

    if status:
        normalized_status = status.lower()
        results = [
            appt for appt in results if appt["status"].lower() == normalized_status
        ]

    if doctor_name:
        needle = doctor_name.lower()
        results = [
            appt for appt in results if needle in appt["doctorName"].lower()
        ]

    if patient_name:
        needle = patient_name.lower()
        results = [appt for appt in results if needle in appt["name"].lower()]

    return results


def update_appointment_status(appointment_id, new_status):
    """
    Update the appointment status in the in-memory list.

    This mimics the write path of an AppSync mutation:
    - AppSync mutation resolver receives `appointment_id` and `new_status`.
    - An Aurora transactional write would occur here to persist the change.
    - After a successful commit, a subscription event would be published so
      connected clients receive the real-time update.
    """

    for appt in _APPOINTMENTS:
        if str(appt["id"]) == str(appointment_id):
            appt["status"] = new_status
            # Subscription event would be triggered here in a real system.
            return appt

    raise ValueError(f"Appointment {appointment_id} not found")

