# Automated Smart Class Attendance Management System — Backend

This is the backend for your final year project, matching Chapter Four and Appendix A of your project report.

## Prerequisites
- Node.js v18 or later (download from https://nodejs.org)
- A MongoDB database — easiest option: create a free cluster at https://www.mongodb.com/cloud/atlas
  (Alternatively, install MongoDB Community Server locally: https://www.mongodb.com/try/download/community)

## Setup Steps

1. Open a terminal in this `backend` folder.

2. Install dependencies:
   ```
   npm install
   ```

3. Create your `.env` file by copying the example:
   ```
   cp .env.example .env
   ```
   (On Windows, use `copy .env.example .env` instead)

4. Open `.env` in a text editor and fill in:
   - `MONGO_URI` — your MongoDB Atlas connection string (or `mongodb://localhost:27017/attendance_system` if running MongoDB locally)
   - `JWT_SECRET` — any long, random string (e.g., mash your keyboard for 40+ characters)
   - `QR_SECRET` — a different long, random string
   - `DEMO_PASSWORD` — the password the seed script gives every demo account (at least 8 characters)

5. Seed the database with sample test data:
   ```
   npm run seed
   ```
   This creates 1 admin, 1 lecturer, and 8 students, plus 3 sample courses. Login emails are printed in the terminal after seeding; the password is your `DEMO_PASSWORD`.

6. Start the server:
   ```
   npm run dev
   ```
   You should see "Connected to MongoDB" and "Server running on http://localhost:5000".

7. Test it's working by visiting http://localhost:5000/api/health in your browser — you should see a JSON response confirming the server is running.

## Testing the API

Use Postman (https://www.postman.com/downloads) or a similar tool to test endpoints before building the frontend. Start with:

- `POST http://localhost:5000/api/auth/login` with body `{ "email": "lecturer@example.com", "password": "<your DEMO_PASSWORD>" }` — this should return a token.
- Copy that token, then try `GET http://localhost:5000/api/courses` with header `Authorization: Bearer <token>`.

See Chapter Four, Section 4.1.7 (API Endpoint Documentation) in your project report for the full list of available endpoints.

## Next Steps

Once this backend is confirmed working, move on to building the React frontend (see the `frontend` folder and Chapter Four Section 4.1 for guidance).
