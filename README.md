# Automated Smart Class Attendance Management System

Dynamic QR codes + geofencing + course registration + offline capture + attendance analytics.

## Online (Render, one web service)
- Build command: `npm run build`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `QR_SECRET`
- The server serves the API under `/api` and the React pages from `frontend/dist`.

## On a laptop (development)
- Backend: `cd backend && npm install && npm run dev` (port 5000)
- Frontend: `cd frontend && npm install && npm run dev` (port 3000, `/api` proxied to 5000)

Secrets live in `.env` files, which are never uploaded (see `.gitignore`).
