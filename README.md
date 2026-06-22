# Cartly — Enterprise E-Commerce Platform (PERN)

Production-grade storefront + admin dashboard. Node/Express/PostgreSQL/Prisma backend, React (Vite) + Redux Toolkit frontend, Stripe payments, Cloudinary images, HTTP-only cookie auth, CSS Modules design system.

## Stack
- **Backend:** Node, Express, PostgreSQL, Prisma, JWT (HTTP-only cookies), bcrypt, Stripe, Cloudinary, Zod
- **Frontend:** React (Vite), Redux Toolkit, React Router, Axios, Recharts, CSS Modules

## Project structure
```
backend/   layered API (routes -> middleware -> controllers -> services -> utils)
frontend/  Vite app (features/ slices, components/, pages/, styles/ design system)
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env          # fill DATABASE_URL, JWT_SECRET, Stripe + Cloudinary keys
npx prisma migrate dev --name init
npm run dev                   # http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173 (proxies /api -> :4000)
```

### 3. Stripe webhook (local)
```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
# paste the printed whsec_... into backend/.env as STRIPE_WEBHOOK_SECRET
```

### 4. Make yourself an admin
Register a user, then in `npx prisma studio` set that user's `role` to `admin`.

## API overview
- `auth`     register / login / logout / me  (cookie session, auto-login on refresh)
- `products` public list (search/filter/sort/paginate) + detail; admin CRUD
- `cart`     customer cart; DB is source of truth; server-calculated totals
- `orders`   checkout (server-priced Stripe session); order history
- `webhooks` Stripe `checkout.session.completed` — idempotent, stock-safe
- `admin`    dashboard analytics, order management, user management
- `uploads`  admin image upload to Cloudinary

## Security highlights
HTTP-only cookie JWT, bcrypt hashing, RBAC on both layers, server-only pricing,
idempotent webhook (atomic pending->paid claim), guarded stock decrement (never negative),
Zod validation on every input, no secrets in responses.
