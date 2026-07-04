# Rolecall

A multi-role task and project management app built to **implement and compare every major authentication and authorization pattern** — each isolated in its own Git branch, on top of the same underlying app.

The task-management features (organizations → projects → tasks) are intentionally simple. The real focus of this project is the auth layer: how different authentication strategies work, and how different authorization models (role-based vs. attribute-based) control access to nested, multi-tenant data.

---

## Why This Project Exists

Most tutorials show *one* way to do auth. This repo shows several, side by side, protecting the exact same application — so the trade-offs between session cookies, JWTs, OAuth, RBAC, and ABAC are visible in code, not just in theory.

---

## Domain Model

```
Organization
   └── Users (each belongs to one org, has one role)
   └── Projects (created by a Manager)
         └── Members (users added to that project)
         └── Tasks (assigned to a specific member)
```

**Roles:** `super_admin` · `org_admin` · `manager` · `member`

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router, Redux Toolkit, Ant Design, Axios |
| Backend | Node.js, Express |
| Database | MySQL |
| Auth | JWT, bcrypt, express-session, Passport.js (OAuth) |

---

## Branch Strategy

| Branch | What it demonstrates |
|---|---|
| `main` | Base app — CRUD for orgs/projects/tasks, no auth |
| `auth/session-cookie` | Stateful auth using server-side sessions |
| `auth/jwt-access-refresh` | Stateless auth — access + refresh token flow with rotation |
| `auth/oauth-google` | Delegated authentication via Google (OAuth2 / OpenID Connect) |
| `auth/rbac` | Role-Based Access Control middleware |
| `auth/abac` | Attribute-Based Access Control — resource ownership + org-scoping |
| `auth/api-key` | Service-to-service authentication |
| `auth/passwordless-magic-link` | Credential-less login via signed email links |

Each auth branch builds on top of `main` (or, for `rbac`/`abac`, on top of `auth/jwt-access-refresh`) and includes its own `docs/AUTH.md` explaining the flow and trade-offs.

Browse any branch above to see that specific implementation in isolation.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/rolecall.git
cd rolecall
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # fill in your DB credentials
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Database setup
```bash
mysql -u root -p
```
```sql
CREATE DATABASE rolecall;
```
Then run the schema in `backend/config/schema.sql`.

---

## Project Structure

```
rolecall/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── app.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       └── api/
└── CLAUDE.md
```

---

## Roadmap

- [x] Base app (schema + CRUD, no auth)
- [ ] Session-based auth
- [ ] JWT access/refresh auth
- [ ] Google OAuth login
- [ ] Role-Based Access Control
- [ ] Attribute-Based Access Control
- [ ] API key auth
- [ ] Passwordless magic-link auth
- [ ] Deployed live demo

---

## License

MIT
