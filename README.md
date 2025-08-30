# Participatory Mangrove Monitoring System

## Overview
A full-stack web application for participatory mangrove monitoring, reporting, and verification. Built for hackathons and real-world deployment.

**Features:**
- Reporter: Submit incidents with geotag, photo, and description
- Verifier: Approve/reject reports, add notes
- Government: Map view, filters, CSV export, incident details
- Auth with Supabase (roles: Reporter, Verifier, Government)
- Storage with Supabase Storage
- Postgres DB via Supabase
- React + TailwindCSS + Leaflet frontend
- Node.js + Express backend

---

## Folder Structure
```
HACKOUT/
  backend/      # Node.js + Express API
  frontend/     # React + Vite + TailwindCSS app
```

---

## Getting Started

### 1. Clone the repo
```
git clone <your-repo-url>
cd HACKOUT
```

### 2. Backend Setup
- `cd backend`
- Copy `.env.example` to `.env` and fill in your Supabase keys
- Install dependencies:
  ```
  npm install
  ```
- Start the server:
  ```
  npm run dev
  ```

### 3. Frontend Setup
- `cd frontend`
- Install dependencies:
  ```
  npm install
  ```
- Add your Supabase anon key in `src/supabaseClient.js`
- Start the dev server:
  ```
  npm run dev
  ```

---

## Supabase Setup
- Create a Supabase project
- Create a storage bucket named `incidents`
- Run the provided SQL in `frontend/src/verifier_sql.sql` to set up the `incidents` table and columns
- Enable email sign-up in Supabase Auth settings

---

## Usage
- Register/login as Reporter, Verifier, or Government
- Reporters can submit incidents with photo and geolocation
- Verifiers see pending reports, approve/reject with notes
- Government users see verified reports on a map, filter, and export CSV

---

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS, Leaflet, react-leaflet
- **Backend:** Node.js, Express
- **Database & Auth:** Supabase (Postgres, Auth, Storage)

---

## Deployment
- Frontend: Vercel
- Backend: Railway/Render
- Database/Storage/Auth: Supabase

---

## License
MIT
