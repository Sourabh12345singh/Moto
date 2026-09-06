# MotoShare — Interview Prep Guide

Peer-to-peer bike rental platform. Bike owners (**BIKER**) list bikes and availability windows; riders (**TAKER**) search by city and book time slots; **ADMIN** reviews KYC documents before anyone can list or rent.

> Use this document as your interview cheat sheet: architecture, flows, concurrency, security, infra, and likely Q&A.

---

## 1. Elevator Pitch (30 seconds)

> MotoShare is a full-stack peer-to-peer bike sharing app. I built a Spring Boot REST API with JWT auth, KYC gating, and pessimistic locking so two riders can’t double-book the same slot. The React frontend has role-based routes for takers, bikers, and admins. It’s containerized with Docker Compose locally and deployed to AWS with Terraform — VPC, ALB path routing, ECS Fargate, and RDS Postgres.

**Problem it solves:** City riders need short-term bikes; owners want to monetize idle bikes — with trust (KYC), availability windows, and safe concurrent booking.

---

## 2. Tech Stack

| Layer | Technology |
|--------|------------|
| Backend | **Java 21**, **Spring Boot 3.5.3**, Spring Security, Spring Data JPA |
| Auth | JWT (jjwt 0.12.6), BCrypt, Google OAuth (auth-code) |
| Database | **PostgreSQL 16** (prod/local), **H2** (tests) |
| Frontend | **React 18**, **Vite 5**, React Router 6, Axios, Tailwind CSS 3 |
| Images | Cloudinary (unsigned upload for KYC + bike photos) |
| Mail | Spring Mail → Gmail SMTP (OTP + booking emails) |
| Local infra | Docker Compose (Postgres + backend + frontend/nginx) |
| Cloud | Terraform → AWS VPC, ALB, ECS Fargate, RDS |
| CI | GitHub Actions (build + test; deploy is manual) |
| Load test | k6 script (`load-test.js`) |

---

## 3. High-Level Architecture

```
┌─────────────┐     JWT      ┌──────────────────┐      JDBC      ┌────────────┐
│ React SPA   │─────────────▶│ Spring Boot API  │───────────────▶│ PostgreSQL │
│ (Vite/nginx)│◀─────────────│ /api/**          │                │            │
└─────────────┘              └────────┬─────────┘                └────────────┘
       │                              │
       │ Cloudinary upload            │ SMTP / Strategy notifications
       ▼                              ▼
┌─────────────┐              ┌──────────────────┐
│ Cloudinary  │              │ Gmail / SMS stub │
└─────────────┘              └──────────────────┘
```

**Production (AWS):**

```
Browser → ALB :80
            ├─ /api/*  → ECS Fargate (backend :8080)
            └─ /*      → ECS Fargate (frontend nginx :80)
Backend → RDS Postgres 16 (sslmode=require)
```

**Local Docker Compose:** browser → frontend `:80`, API → backend `:8080`, DB → Postgres `:5433`.

**Local Vite dev:** `npm run dev` on `:3000`, proxy `/api` → `localhost:8080`.

---

## 4. Domain Model

```
User 1──1 Biker 1──* Bike 1──* AvailabilitySlot
User 1──1 Taker
User 1──1 Kyc
User 1──* Booking *──1 Bike
Booking *──1 AvailabilitySlot
Otp (keyed by email)
FailedNotification (email DLQ)
```

### Roles (`Role` enum)

| Role | Can do |
|------|--------|
| `TAKER` | Search bikes, book, view/cancel own bookings |
| `BIKER` | Add bikes/slots, view bookings on owned bikes |
| `ADMIN` | Approve/reject KYC; can also browse search UI |

### Key entities

| Entity | Important fields |
|--------|------------------|
| **User** | email, phone, BCrypt password, role, `kycStatus`, `@Version` (optimistic lock) |
| **Bike** | company, model, `ratePerHour`, unique `bikeNumber`, RC, kms, imageUrl |
| **AvailabilitySlot** | UUID id, start/end, pricePerHour, city, pickupLocation, `isAvailable` |
| **Booking** | start/end, totalPrice, status (`CONFIRMED`/`CANCELLED`/`COMPLETED`), `@Version` |
| **Kyc** | selfieUrl, licenceUrl, PAN, Aadhaar, status |
| **Otp** | 6-digit code, 5-min expiry, verified flag |

### KYC statuses

`NOT_SUBMITTED` → `PENDING` → `APPROVED` | `REJECTED`

- Booking and meaningful host activity require **`APPROVED`**.
- On approve, backend creates the role profile (`Biker` or `Taker` via `@MapsId` shared PK with User).

---

## 5. Core User Flows

### A. Register / Login

1. User enters email → `POST /api/auth/send-otp` (async email).
2. Verify OTP → `POST /api/auth/verify-otp` (must be verified within window for register).
3. New user: name, phone, role (`TAKER`/`BIKER`), password → `POST /api/auth/register`.
4. Existing user path: password reset via OTP → `POST /api/auth/reset-password`.
5. Login → `POST /api/auth/login` → JWT string.
6. Optional: Google OAuth auth-code → `POST /api/auth/google` → find-or-create user → JWT.

JWT claims: `userId`, `role`, `name`, `kycStatus`, subject = email. TTL ~24h. Stored in `localStorage` on the frontend.

### B. KYC

1. User uploads selfie + licence (Cloudinary) + PAN/Aadhaar → `POST /api/kyc/{userId}`.
2. Status → `PENDING`.
3. Admin lists pending → `GET /api/admin/kyc/pending`.
4. Approve → `POST /api/admin/kyc/verify/{userId}` (creates Biker/Taker).
5. Reject → `POST /api/admin/kyc/reject/{userId}` (deletes KYC row, user → `REJECTED`, can resubmit).

### C. Biker lists inventory

1. `POST /api/biker/{bikerId}/bike` — plate normalized (uppercase, no spaces), unique plate, RC required.
2. `POST /api/biker/bike/{bikeId}/slot` — max **24h** window; price taken from bike `ratePerHour`; city lowercased.

### D. Taker books a ride (the hard part)

1. Search: `GET /api/users/bikes?city=` — available slots for next **7 days**.
2. Book: `POST /api/users/book` with `slotId`, `startTime`, `endTime`.
3. Cancel: `POST /api/users/cancel/{bookingId}` if ≥ **60 minutes** before start.

---

## 6. Booking Engine (must-know for interviews)

File: `BookBikeService.java`

### Business rules

| Rule | Value |
|------|--------|
| KYC required | Must be `APPROVED` (checked **before** locking) |
| Min booking | **1 hour** |
| Pricing | `ceil(minutes / 60) * pricePerHour` |
| Turnaround buffer | **30 minutes** after booking end before next leftover slot |
| Leftover slot min | Pre/post gap must be ≥ **60 minutes** to create a new available slot |
| Cancel window | Not allowed within **60 minutes** of start |
| Cancel effect | Status → `CANCELLED`, original slot `isAvailable = true` |

### Concurrency: pessimistic locking

```
Thread A                          Thread B
────────                          ────────
KYC OK                            KYC OK
SELECT FOR UPDATE slot X          (blocks waiting for lock)
mark unavailable, book, split
COMMIT
                                  acquires lock
                                  sees isAvailable=false
                                  → BusinessRuleException (409)
```

- `AvailabilitySlotRepository.findByIdForUpdate` → `@Lock(PESSIMISTIC_WRITE)` = SQL `SELECT FOR UPDATE`.
- Same pattern on cancel: `BookingRepository.findByIdForUpdate` prevents double-cancel.
- Cheap checks (KYC) run **before** expensive locks — fail-fast design.
- Covered by `BookBikeConcurrencyTest` (50 concurrent bookers, H2 test profile).

### Slot splitting (example)

Original slot: `10:00–18:00`. Booking: `13:00–15:00`.

1. Original slot marked unavailable.
2. **Pre-slot** created: `10:00–13:00` (3h ≥ 1h).
3. **Post-slot** created: `15:30–18:00` (30-min buffer + leftover ≥ 1h).

If someone books the full window, no leftovers are created.

### Optimistic locking

`User` and `Booking` use `@Version` for lower-contention updates (e.g. admin KYC races). Conflicts → `ObjectOptimisticLockingFailureException` → HTTP **409**.

---

## 7. API Surface

Base path: `/api`. Auth: `Authorization: Bearer <jwt>` except `/api/auth/**`.

### Auth — public (`AuthController`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/auth/health` | Health check |
| POST | `/auth/send-otp` | Send OTP email |
| POST | `/auth/verify-otp` | Verify OTP |
| POST | `/auth/register` | Register after OTP |
| POST | `/auth/login` | Returns JWT |
| POST | `/auth/google` | Google code → JWT |
| POST | `/auth/reset-password` | OTP-gated reset |

### Users — authenticated (`UserController`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/users/me/status` | Current user + KYC |
| GET | `/users/bikes?city=` | Search available slots |
| POST | `/users/book` | Create booking |
| GET | `/users/my-bookings` | Taker bookings |
| POST | `/users/cancel/{bookingId}` | Cancel booking |

### Biker — `ROLE_BIKER` (`BikerController`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/biker/{bikerId}/bike` | Add bike |
| POST | `/biker/bike/{bikeId}/slot` | Add availability |
| GET | `/biker/my-bikes` | Owned bikes + slots |
| GET | `/biker/my-bookings` | Bookings on owned bikes |

### KYC / Admin

| Method | Path | Role |
|--------|------|------|
| POST | `/kyc/{userId}` | Authenticated |
| GET | `/admin/kyc/pending` | ADMIN |
| POST | `/admin/kyc/verify/{userId}` | ADMIN |
| POST | `/admin/kyc/reject/{userId}?reason=` | ADMIN |

### Error model

`GlobalExceptionHandler` → `ApiError { timeStamp, error, statusCode }`

| Exception | HTTP |
|-----------|------|
| Validation | 400 |
| Auth / JWT | 401 |
| Access denied | 403 |
| Not found | 404 |
| Business rule / optimistic lock | **409** |
| Rate limit | **429** |
| Unhandled | 500 |

---

## 8. Security Deep Dive

### Filter chain order

1. **`RateLimitingFilter`** — token bucket per IP (capacity 10, refill ~2/s). Respects `X-Forwarded-For` / `X-Real-IP` (important behind ALB). Returns 429 JSON.
2. **`JwtAuthFilter`** — skips `/api/auth/**`; loads User by email; sets `SecurityContext`.
3. Spring Security authorization rules.

### Authorization rules (`SecurityBeans`)

| Matcher | Access |
|---------|--------|
| `/api/auth/**` | permitAll |
| `/api/admin/**` | ROLE_ADMIN |
| `/api/biker/**` | ROLE_BIKER |
| `/api/users/**`, `/api/kyc/**` | authenticated |
| everything else | authenticated |

### Other security choices

- Stateless sessions, CSRF disabled (JWT API).
- Passwords hashed with **BCrypt**.
- Login returns the **same error** for bad email vs bad password (no user enumeration).
- OTP: SecureRandom 6 digits, short expiry, consumed after use.
- Frontend: axios interceptor clears token and redirects to `/login` on **401**.
- Role-gated React routes via `ProtectedRoute` + `allowedRoles`.

### Honest gaps (say these if asked “what would you improve?”)

- CORS currently allows `*` (property `FRONTEND_URLS` exists but isn’t wired tightly).
- Secrets in ECS as plain env vars (not Secrets Manager / SSM).
- RDS was publicly accessible in the Terraform design (cost/dev tradeoff).
- No HTTPS/ACM listener yet (HTTP ALB only).
- JWT in `localStorage` (XSS risk vs httpOnly cookies).

---

## 9. Design Patterns & Backend Structure

```
com.example.MotoShare
├── controller/     # REST layer
├── service/        # Business logic
│   └── notification/  # Strategy: Email + SMS
├── repository/     # Spring Data JPA
├── entity/         # JPA models + enums
├── dto/            # Request/response
├── mapper/         # Entity → DTO
├── security/       # JWT, rate limit, SecurityFilterChain
├── config/         # Async thread pool
└── error/          # Exceptions + GlobalExceptionHandler
```

| Pattern | Where |
|---------|--------|
| **Strategy** | `NotificationStrategy` → Email + SMS implementations; `BookBikeService` injects `List<NotificationStrategy>` (Open/Closed) |
| **Filter chain** | Rate limit → JWT → authorization |
| **DTO + Mapper** | Keep entities off the wire |
| **Fail-fast** | KYC before `SELECT FOR UPDATE` |
| **DLQ** | Failed emails → `FailedNotification` after retries |
| **Async** | `@EnableAsync` + custom pool (core 5 / max 10 / queue 50 / `CallerRunsPolicy`) |

Email notifications: `@Async`, exponential backoff (1s, 2s, …), max 3 retries → DLQ.

---

## 10. Frontend Architecture

### Provider tree

```
BrowserRouter → GoogleOAuthProvider → ThemeProvider → AuthProvider → App
```

### Routing

| Route | Access |
|-------|--------|
| `/`, `/login`, `/register` | Public |
| `/dashboard`, `/kyc` | Authenticated |
| `/search` | TAKER or ADMIN |
| `/my-bookings` | TAKER |
| `/my-bikes`, `/add-bike`, `/add-slot/:bikeId` | BIKER |
| `/admin/kyc` | ADMIN |

Pages are **lazy-loaded** (`React.lazy` + `Suspense`).

### State

- No Redux — `AuthContext` + `ThemeContext` + local `useState` per page.
- Token + user JSON in `localStorage`.
- Dark mode: `class` strategy on `<html>`, persisted theme preference.

### API client (`src/services/api.js`)

- Axios instance: `VITE_API_URL` or `http://localhost:8080/api`.
- Request interceptor attaches Bearer token.
- Modules: `authAPI`, `userAPI`, `bikerAPI`, `kycAPI`, `adminAPI`.

### Notable UI flows

- Register is a **3-step** OTP wizard (also handles password reset for existing emails).
- Search → `BikeCard` → `BookingModal` (hour picker within slot, live price).
- KYC gate: booking CTA becomes “Verify KYC” until approved.
- Admin KYC page: lightbox for selfie/licence, approve/reject.

---

## 11. Database & Seed Data

- Schema managed by Hibernate `ddl-auto=update` (no Flyway/Liquibase yet).
- Indexes: e.g. availability `(city, is_available, start_hour)`; OTP on email.
- DB checks: rate > 0, start < end, total_price ≥ 0.
- `data.sql` seeds demo users/bikes/slots (`ON CONFLICT` idempotent).

**Demo password for seed users:** `Singh@123`  
Examples: `priya.taker@motoshare.com`, admin/biker accounts in `data.sql`.

Connection (local defaults): Postgres DB name often `bike_`, configurable via `DB_URL` / `DB_HOST` / `DB_PORT` / `DB_NAME`.

---

## 12. Infrastructure & DevOps

### Docker Compose

| Service | Port | Image/build |
|---------|------|-------------|
| `db` | 5433→5432 | postgres:16-alpine |
| `backend` | 8080 | multi-stage Maven → Temurin 21 JRE |
| `frontend` | 80 | Node build → nginx:alpine SPA |

### Terraform (AWS)

| Resource | Name / notes |
|----------|----------------|
| VPC | `motoshare-vpc` `10.0.0.0/16`, 2 public subnets (cost-optimized: no NAT) |
| ALB | Path `/api/*` → backend TG; default → frontend TG |
| ECS Fargate | `motoshare-backend` / `motoshare-frontend` (256 CPU / 512 MB) |
| RDS | Postgres 16.6, `db.t4g.micro`, 20GB gp3 |
| Logs | CloudWatch `/ecs/motoshare`, 7-day retention |
| Images | Pulled from Docker Hub (`sourabhsinghrathore/motoshare-*`) |

**Cost choices to mention:** Graviton micro RDS, tiny Fargate tasks, public subnets (no NAT bill), short log retention.

### CI (GitHub Actions — `.github/workflows/ci-cd.yml`)

1. Backend: JDK 21 → `mvn clean test` (profile `test` / H2) → package JAR.
2. Frontend: Node 20 → `npm ci` → `npm run build`.
3. Docker Buildx: build images with `push: false` (verify Dockerfiles).

**CD is manual:** build/push images → `terraform apply` → optionally rebuild frontend with ALB DNS baked into `VITE_API_URL`.

### Evolution story

Started on **Render** → migrated to **Terraform + AWS ECS** for more control and interview-ready IaC.

---

## 13. Testing & Performance

| Test | What it proves |
|------|----------------|
| `BookBikeConcurrencyTest` | 50 threads, one winner under pessimistic lock |
| `OtpVerificationTest` | OTP lifecycle |
| `GoogleLoginTest` | OAuth path |
| `ValidationAndSecurityTest` | Validation / security edges |
| `load-test.js` (k6) | Ramp to 100 VUs; targets p95 < 500ms, error rate < 5% |

Run backend tests:

```bash
cd backend
./mvnw test
# Windows: .\mvnw.cmd test
```

---

## 14. How to Run Locally

### Prerequisites

- JDK 21, Maven (or wrapper)
- Node 18+
- PostgreSQL **or** Docker

### Option A — Docker Compose (full stack)

```bash
# Root .env: DB_PASSWORD, JWT_SECRET, MAIL_USERNAME, MAIL_PASSWORD, etc.
docker compose up --build
```

- App: http://localhost  
- API: http://localhost:8080  
- Health: `GET http://localhost:8080/api/auth/health`

### Option B — Dev mode (hot reload)

```bash
# Terminal 1 — Postgres running, DB created
cd backend
./mvnw spring-boot:run

# Terminal 2
cd frontend
npm install
npm run dev
# http://localhost:3000
```

Optional `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=...
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=motoshare_kyc
```

---

## 15. Project Structure (top level)

```
motoShare/
├── backend/                 # Spring Boot API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/.../MotoShare/
├── frontend/                # React SPA
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/{pages,components,context,services,utils}
├── terraform/               # AWS IaC
├── .github/workflows/       # CI
├── docker-compose.yml
├── load-test.js             # k6
└── README.md                # this file
```

---

## 16. Interview Q&A Bank

### “Walk me through the project.”

Use the elevator pitch, then: roles → KYC trust layer → availability slots → book under lock + slot split → cancel restores slot → notify via Strategy → React role routes → Docker/AWS.

### “How do you prevent double booking?”

Pessimistic write lock (`SELECT FOR UPDATE`) on the slot row inside a `@Transactional` method. First transaction books and flips `isAvailable=false`; others wait, then fail with a business-rule conflict (409). Validated with a 50-thread concurrency test.

### “Why pessimistic and not optimistic for booking?”

High contention on a single hot row (flash-sale style). Optimistic would retry/fail many clients after work; pessimistic serializes writers on that row. Optimistic (`@Version`) is used where contention is lower (User/Booking metadata).

### “Why check KYC before locking?”

Acquiring a DB lock is expensive under load. Cheap authorization/business checks first = fail-fast, less lock hold time, better throughput.

### “Explain slot splitting.”

Booking can be a sub-window of a larger availability. Unused head/tail become new available slots if ≥1 hour remains; post-booking start is delayed by a 30-minute turnaround buffer so the owner can reclaim/prep the bike.

### “What happens on cancel?”

Pessimistic lock on booking → ownership + status + time-window checks → `CANCELLED` + restore original slot availability. (Note: split child slots from the original booking are a known simplification — discuss as future work if asked.)

### “How does auth work end to end?”

OTP/email or Google → JWT with role/KYC claims → frontend stores token → axios Bearer header → `JwtAuthFilter` builds SecurityContext → method/URL role rules. Frontend also gates routes with `ProtectedRoute`.

### “Why Strategy for notifications?”

Email and SMS share the same contract. Adding WhatsApp/push = new class, no change to booking core (OCP). Failures are isolated per strategy; email has async retries + DLQ.

### “How is the app deployed?”

CI builds/tests on GitHub Actions. Images go to Docker Hub. Terraform provisions VPC/ALB/ECS/RDS. ALB routes `/api/*` to backend and everything else to the SPA. Frontend `VITE_*` vars are build-time.

### “How would you scale this?”

- Horizontal ECS tasks behind ALB  
- Move rate limiter to Redis (in-memory is per-instance)  
- Read replicas + `@Transactional(readOnly=true)` already hints at read scaling  
- Private subnets + NAT or VPC endpoints  
- Connection pooling (Hikari already tuned)  
- Cache city search (Redis) with short TTL  
- Consider slot fragmentation / cleanup job for tiny leftover gaps  

### “Tradeoffs / what you’d improve next?”

1. Flyway/Liquibase migrations instead of `ddl-auto=update`  
2. HTTPS + Secrets Manager + private RDS  
3. Tighten CORS to real frontend origins  
4. Cancel should reconcile split slots / re-merge availability  
5. Payments, ratings UI, real SMS provider  
6. Relative `/api` base URL so frontend isn’t rebuilt with ALB DNS  
7. Automated CD (push image → ECS force deploy)

### “Why Java/Spring + React?”

Strong typing and mature concurrency/transaction tooling on the booking path; React SPA for role-based UX and fast iteration. Postgres for relational integrity (unique plates, FKs, row locks).

### “Explain your rate limiter.”

In-memory token bucket keyed by client IP, applied as a servlet filter before auth. Returns structured 429. Good for single-instance demos; for multi-instance ECS you’d use Redis or API Gateway throttling.

---

## 17. One-Page Mental Model

```
Register (OTP) → JWT
     → Submit KYC → Admin approve → Biker/Taker profile created
          → Biker: add bike + availability slots
          → Taker: search city (7 days) → book
                → KYC check → SELECT FOR UPDATE → price ceil
                → mark slot busy → split leftovers → notify (Strategy/async/DLQ)
          → Cancel (≥1h before) → lock booking → restore slot
Infra: Compose locally · Terraform ALB+ECS+RDS in AWS · GHA CI
```

---

## 18. Seed Credentials (local demo)

| Account type | Example email | Password |
|--------------|---------------|----------|
| Seed users | See `backend/src/main/resources/data.sql` | `Singh@123` |

Use these only for local demos — never ship real secrets in git.

---

*Built as a portfolio / interview project: end-to-end product thinking (KYC, roles, bookings) plus backend depth (locking, transactions, patterns) and cloud packaging (Docker + Terraform).*
