# Backend (Express + MongoDB)

Install and run:

```bash
cd backend
npm install
cp .env.example .env
# edit .env if needed
npm run dev
```

API endpoints:

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

This backend provides a simple users API using Express and Mongoose.

Notes

- During development, if `MONGODB_URI` is not provided, the server starts an in-memory MongoDB instance (via `mongodb-memory-server`). This makes it easy to run locally without installing MongoDB.

Install and run (PowerShell)

```powershell
cd "backend"
npm install
Copy-Item .env.example .env
# edit .env if you want to provide a real MONGODB_URI
npm run dev
```

Run the smoke test (verifies create/list/delete flow against the running server):

```powershell
cd "backend"
npm run smoke
```

Environment

- `MONGODB_URI` (optional) — MongoDB connection string. If omitted, an in-memory MongoDB will be used.
- `PORT` (optional) — server port (default: `5000`).

Examples

- Create: `POST /api/users` with JSON `{ "name": "Alice", "email": "alice@example.com" }`
- List: `GET /api/users`

If you plan to run against a real MongoDB instance, set `MONGODB_URI` in `.env` before starting the server.
