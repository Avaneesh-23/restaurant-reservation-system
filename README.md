# Restaurant Reservation Management System

A full-stack restaurant reservation application with customer booking flows and an admin management panel.

## Live Demo

- **Frontend:** https://restaurant-reservation-system-cckjtjqye.vercel.app
- **Backend API:** https://restaurant-reservation-api-hsy1.onrender.com

## Tech Stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT

## Features

### Customer
- Register and login
- Create reservations with date, time slot, guest count, and assigned table
- View personal reservations
- Cancel own reservations
- Real-time availability check before booking

### Admin
- View all reservations
- Filter reservations by date
- Update or cancel any reservation
- Manage restaurant tables (add, activate/deactivate, delete)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Availability logic
│   │   ├── seed/           # Database seed script
│   │   └── validators/     # Input validation rules
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd restaurant-reservation
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs at `http://localhost:5000`.

**Default admin credentials (after seed):**
- Email: `admin@restaurant.com`
- Password: `admin123`

Override with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` before seeding.

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Set `VITE_API_URL` in frontend `.env` to your backend API base URL (e.g. `http://localhost:5000/api`).

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register customer |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Current user |
| GET | `/api/reservations/mine` | Customer/Admin | User's reservations |
| GET | `/api/reservations` | Admin | All reservations (optional `?date=YYYY-MM-DD`) |
| GET | `/api/reservations/availability` | Auth | Available tables |
| POST | `/api/reservations` | Customer/Admin | Create reservation |
| PATCH | `/api/reservations/:id` | Owner/Admin | Update reservation |
| PATCH | `/api/reservations/:id/cancel` | Owner/Admin | Cancel reservation |
| GET | `/api/tables` | Public | List tables |
| POST/PATCH/DELETE | `/api/tables` | Admin | Manage tables |

## Assumptions

1. **Single restaurant** with a fixed set of tables seeded in the database.
2. **Discrete time slots** (not free-form ranges): `12:00`, `13:00`, `14:00`, `18:00`, `19:00`, `20:00`, `21:00`.
3. Each reservation occupies one table for one date + time slot combination.
4. Customers register as `customer` role; admin is created via seed script.
5. Table assignment is automatic (smallest suitable table) unless the customer selects a preferred available table.
6. Dates are normalized to UTC midnight for consistent storage and querying.

## Reservation & Availability Logic

This is the core business logic of the system.

### Conflict prevention

A table is considered **unavailable** when there is an existing reservation with:
- Same `table`
- Same `date`
- Same `timeSlot`
- Status `confirmed`

When creating or updating a reservation, the system:
1. Validates the date is not in the past (and time slot not passed if booking today).
2. Finds all **active** tables with `capacity >= guestCount`.
3. Excludes tables already booked for that date/time slot.
4. Assigns the smallest suitable table (or a customer-selected table if still available).

If no table satisfies these rules, the API returns **409 Conflict** with a clear message.

### Capacity validation

- Guest count must be between 1 and 20.
- Only tables with sufficient capacity are considered.
- If a specific table is requested, it must be available and meet capacity requirements.

### Update behavior

When an admin or customer updates a reservation, the current reservation is excluded from conflict checks so the same slot/table can be retained if unchanged.

## Role-Based Access Control

JWT tokens are issued on login/register and sent as `Authorization: Bearer <token>`.

| Role | Permissions |
|------|-------------|
| **customer** | Create/view/cancel own reservations, check availability |
| **admin** | All customer permissions + view all reservations, filter by date, update/cancel any reservation, manage tables |

Protected routes use middleware:
- `protect` — verifies JWT and attaches user to request
- `authorize('admin')` — restricts route to admin role

Frontend routes are also role-aware:
- Customers → `/dashboard`, `/book`
- Admins → `/admin`, `/admin/tables` (distinct admin styling)

## Deployment

### Backend (Render)

1. Create a MongoDB Atlas cluster and copy the connection string.
2. Deploy the `backend` folder as a Node web service via Render dashboard.
3. Set environment variables:
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Random secret key for JWT tokens
   - `CLIENT_URL` - Frontend URL for CORS
   - `PORT` - Render uses port 10000 by default
4. Seed database via POST request to `/api/seed` endpoint after deployment

### Frontend (Vercel / Netlify example)

1. Deploy the `frontend` folder.
2. Set `VITE_API_URL` to your deployed backend URL + `/api`.
3. Build command: `npm run build`
4. Output directory: `dist`

Ensure CORS `CLIENT_URL` on the backend matches your deployed frontend URL.

## Known Limitations

- No email notifications or payment integration.
- Fixed time slots instead of flexible start/end times.
- No waitlist when fully booked.
- Single restaurant only (no multi-tenant support).
- Admin accounts are not self-registerable (seeded only).

## Areas for Improvement

- Add unit/integration tests for availability logic.
- Email confirmation on booking/cancellation.
- Pagination and search for admin reservation list.
- Table layout visualization.
- Rate limiting and refresh tokens for auth.
- Optimistic UI updates on the frontend.

## License

MIT
