# Automated Smart Class Attendance Management System — Frontend

React frontend built with Vite, matching Chapter Four Section 4.1 of your project report.

## Prerequisites
- Node.js v18 or later
- Your backend must already be running (see ../backend/README.md) before this will work,
  since every screen here talks to that backend's API.

## Setup Steps

1. Open a terminal in this `frontend` folder.

2. Install dependencies:
   npm install

3. Create your .env file:
   cp .env.example .env
   (Windows: copy .env.example .env)

   The default value (http://localhost:5000/api) already matches the backend's default port,
   so you usually don't need to change anything here.

4. Start the development server:
   npm run dev

5. Open your browser to the address shown in the terminal (usually http://localhost:3000).

## Using the App

- Go to /register to create a student account (lecturer/admin accounts must be created directly
  via the backend, e.g. through the seed script or Postman).
- Log in, and you'll be redirected to the correct dashboard for your role automatically.
- If you seeded the backend with sample data (npm run seed in the backend folder), you can log in
  immediately with the credentials it printed.

## Notes on Camera and Location Permissions

The "Scan Attendance" screen needs both camera and location access, since it uses:
- The device camera to scan the lecturer's QR code
- The browser's Geolocation API to verify you're within the classroom's geofence

Your browser will prompt for these permissions the first time you use the scan screen.
Test this feature on a phone or a laptop with a webcam, since desktop browsers without a
camera cannot complete a scan.

## Troubleshooting

- "Network Error" on every request: make sure the backend server is running first.
- CORS errors in the browser console: confirm the backend's cors() middleware is active.
- QR scanner shows a blank box: your browser blocked camera access — check the address bar
  for a blocked-permission icon and allow it, then refresh.
