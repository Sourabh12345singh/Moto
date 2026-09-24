# MotoShare — Interview Prep Guide

Use this document as your interview cheat sheet: architecture, flows, concurrency, security, infra, and likely Q&A. For setup, API reference, and project structure, see [README.md](./README.md).

## Elevator Pitch (30 seconds)

> MotoShare is a full-stack peer-to-peer bike sharing app. I built a Spring Boot REST API with JWT auth, KYC gating, and pessimistic locking so two riders can’t double-book the same slot. The React frontend has role-based routes for takers, bikers, and admins. It’s containerized with Docker Compose locally and deployed to AWS with Terraform — VPC, ALB path routing, ECS Fargate, and RDS Postgres.

**Problem it solves:** City riders need short-term bikes; owners want to monetize idle bikes — with trust (KYC), availability windows, and safe concurrent booking.

## Interview Q&A Bank

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

## One-Page Mental Model

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
