Hospital Backend — Database Schema

Quick start
- Start Postgres with Docker: see `docker-compose.yml`.
- Set env vars or `.env` to match DB: `DB_HOST=localhost`, `DB_PORT=5432`, `DB_USERNAME=hospital_user`, `DB_PASSWORD=hospital_pass`, `DB_NAME=hospital_db`.
- Install deps and build.

Commands (PowerShell)
```powershell
docker compose up -d
npm install
npm run build
npm run start:dev
```

Notes
- TypeORM `synchronize` is enabled for development in `src/app.module.ts` so the schema is created/updated automatically from entities.
- Entities cover: patients, staff, specialties, issues, timings, leaves, appointments, appointment slots, prescriptions (+ items), inventory (+ transactions), rooms, requirements (+ fulfillment), and audit logs.
- For production, prefer migrations and disable `synchronize`.
