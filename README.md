# EMR Feature Implementation – Appointment Scheduling & Queue Management

This assignment wires a React view to a mocked Python backend that simulates an AWS AppSync + Aurora stack.

## GraphQL Shape (Simulated)

Example query for `getAppointments`:

```
query GetAppointments($date: AWSDate, $status: String) {
  getAppointments(date: $date, status: $status) {
    id
    name
    date
    time
    duration
    doctorName
    status
    mode
  }
}
```

Example mutation for status updates:

```
mutation UpdateAppointment($id: ID!, $status: String!) {
  updateAppointmentStatus(appointmentId: $id, newStatus: $status) {
    id
    status
  }
}
```

## Backend Data Consistency

- `appointment_service.py` holds an in-memory list that represents Aurora rows.
- `get_appointments` applies read filters server-side, mirroring an AppSync resolver hitting Aurora or a read replica.
- `update_appointment_status` is the write path; in a real system this is where the transactional write to Aurora would occur before returning the updated record.
- Comments in the code mark where the AppSync mutation, Aurora write, and subscription publication would be invoked.

## Real-Time Updates (Conceptual)

- After a successful status mutation, AppSync would publish a subscription event.
- Connected clients (the React view) would receive the event and merge the updated appointment into local state.
- The React component optimistically updates local state immediately after `update_appointment_status` to mimic this real-time behavior without a live socket.

## Running the Project Locally

1. **Backend (mocked):** No server is required; `appointment_service.py` exposes in-memory functions the UI imports. If you want to inspect data manually, run `python appointment_service.py` in a Python 3.10+ environment.
2. **Frontend:** Add `EMR_Frontend_Assignment.jsx` to a React app (e.g., Create React App or Vite), import, and render the component. Tailwind classes are included; ensure Tailwind is configured or replace the classes with your styling system.
3. **Testing the flow:** Launch the React dev server (`npm run dev` or `npm start` depending on your setup). Selecting dates filters appointments; tab controls toggle Upcoming/Today/Past; Confirm/Cancel buttons call the mock backend and immediately refresh local state to reflect the change.

