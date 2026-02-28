# PawStore

A full-stack pet-store application built with **Spring Boot 3** on the backend and **React 18 + SASS** on the frontend, backed by **PostgreSQL**, packaged as a single executable JAR, and fully containerised with Docker.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Data Model](#data-model)
5. [High-Level Design](#high-level-design)
6. [How to Run](#how-to-run)
   - [Option A — Docker Compose (recommended)](#option-a--docker-compose-recommended)
   - [Option B — Local dev with Docker Postgres](#option-b--local-dev-with-docker-postgres)
   - [Option C — Fully local with H2 (no Postgres)](#option-c--fully-local-with-h2-no-postgres)
7. [Build Reference](#build-reference)
8. [REST API](#rest-api)
9. [Security Model](#security-model)
10. [Demo Accounts](#demo-accounts)
11. [Database](#database)
12. [Switching Databases](#switching-databases)

---

## Tech Stack

| Layer        | Technology                                                              |
|--------------|-------------------------------------------------------------------------|
| Backend      | Spring Boot 3.4.3 · Java 17 · Spring Data JPA · Spring Security 6      |
| Database     | PostgreSQL 16 (default) · H2 (dev / test profile)                      |
| Frontend     | React 18 · React Router 6 · Vite · SASS · Axios                       |
| Build        | Maven 3.9 · frontend-maven-plugin · multi-stage Docker                 |
| Container    | Docker Compose · OrbStack-compatible (native ARM64 images)             |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser                                 │
│                                                                  │
│   React 18 · React Router 6 · Axios (withCredentials: true)     │
│                     SASS / CSS modules                           │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP  (JSESSIONID cookie)
                             │ dev: port 5173 → Vite proxy → 8080
                             │ prod: port 8080 (Spring serves SPA)
┌────────────────────────────▼─────────────────────────────────────┐
│                  Spring Boot 3.4.3  (port 8080)                  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ AuthCtrl    │  │ PetCtrl     │  │ UserCtrl / CategoryCtrl │  │
│  │ /api/auth/* │  │ /api/pets/* │  │ /api/users/*  /api/cat/*│  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         │                │                       │               │
│  ┌──────▼────────────────▼───────────────────────▼────────────┐  │
│  │              Spring Security Filter Chain                  │  │
│  │  SessionManagement · DaoAuthProvider · BCrypt · CORS       │  │
│  └───────────────────────────┬────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼────────────────────────────────┐  │
│  │           Spring Data JPA / Hibernate ORM                  │  │
│  └───────────────────────────┬────────────────────────────────┘  │
└──────────────────────────────┼───────────────────────────────────┘
                               │ JDBC
                  ┌────────────▼────────────┐
                  │     PostgreSQL 16        │
                  │       port 5432          │
                  └─────────────────────────┘
```

### Request lifecycle

| Step | What happens |
|------|-------------|
| 1 | Browser sends request with `JSESSIONID` cookie |
| 2 | Spring Security `SessionManagementFilter` looks up session, restores `SecurityContext` |
| 3 | `FilterSecurityInterceptor` checks role rules (public / CUSTOMER / ADMIN) |
| 4 | Controller delegates to Service layer |
| 5 | Service calls JPA Repository → Hibernate generates SQL → PostgreSQL |
| 6 | JSON response returned to browser |

### Authentication flow

```
POST /api/auth/login
        │
        ▼
AuthenticationManager.authenticate()
        │
        ▼
DaoAuthenticationProvider
  └─ UserService.loadUserByUsername()  ← DB lookup
  └─ BCryptPasswordEncoder.matches()
        │
    success ──► SecurityContextHolder.setContext()
                HttpSession.setAttribute(SPRING_SECURITY_CONTEXT_KEY, ctx)
                Response: Set-Cookie: JSESSIONID=...; HttpOnly; Path=/
        │
    failure ──► 401 Unauthorized

Subsequent requests:
  Cookie: JSESSIONID=...
        │
        ▼
  Spring reads session → reconstructs SecurityContext automatically

POST /api/auth/logout
        │
        ▼
  session.invalidate()  → JSESSIONID removed
```

---

## Project Structure

```
sbr/
├── Dockerfile                          # 3-stage build (Node → Maven → JRE)
├── docker-compose.yml                  # PostgreSQL + app services
├── .dockerignore
├── pom.xml                             # Maven build (frontend + backend)
│
├── frontend/                           # React + Vite SPA
│   ├── index.html
│   ├── vite.config.js                  # Proxies /api → :8080 in dev mode
│   ├── package.json
│   └── src/
│       ├── main.jsx                    # Entry point
│       ├── App.jsx                     # Router + AuthProvider wrapper
│       ├── context/
│       │   └── AuthContext.jsx         # Global session state + hooks
│       ├── components/
│       │   ├── Navbar.jsx              # Role-aware navigation
│       │   ├── Footer.jsx
│       │   ├── PetCard.jsx             # Pet grid card
│       │   ├── Pagination.jsx          # Smart ellipsis paginator
│       │   └── ProtectedRoute.jsx      # Redirects unauthenticated / non-admin
│       ├── pages/
│       │   ├── HomePage.jsx            # Featured pets hero
│       │   ├── PetsPage.jsx            # Filterable, paginated grid
│       │   ├── PetDetailPage.jsx       # Full pet info; edit/delete for admins
│       │   ├── AdminPage.jsx           # Add / edit pet form (ADMIN)
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   └── UsersPage.jsx           # User management table (ADMIN)
│       ├── services/
│       │   └── api.js                  # Axios client; auth & CRUD helpers
│       └── styles/
│           ├── main.scss               # Imports all partials
│           ├── _variables.scss
│           ├── _base.scss
│           ├── _navbar.scss
│           ├── _hero.scss
│           ├── _pets.scss
│           ├── _petdetail.scss
│           ├── _admin.scss
│           ├── _pagination.scss
│           ├── _auth.scss              # Login / register cards
│           └── _users.scss             # User management table
│
└── src/main/java/com/petstore/
    ├── PetStoreApplication.java        # @SpringBootApplication entry point
    ├── DataInitializer.java            # Seeds categories, pets, users on startup
    ├── config/
    │   ├── AppConfig.java              # PasswordEncoder bean (BCrypt)
    │   └── SecurityConfig.java         # CORS · CSRF-off · route rules · session
    ├── controller/
    │   ├── AuthController.java         # /api/auth/*
    │   ├── PetController.java          # /api/pets/*
    │   ├── CategoryController.java     # /api/categories/*
    │   ├── UserController.java         # /api/users/*  (ADMIN)
    │   └── SpaController.java          # Forwards /* → index.html
    ├── dto/
    │   ├── PetRequest.java
    │   ├── RegisterRequest.java
    │   ├── LoginRequest.java
    │   └── UserResponse.java           # Safe projection (no password)
    ├── model/
    │   ├── Pet.java
    │   ├── Category.java
    │   ├── PetStatus.java              # AVAILABLE · PENDING · ADOPTED
    │   ├── User.java                   # Implements UserDetails
    │   └── Role.java                   # CUSTOMER · ADMIN
    ├── repository/
    │   ├── PetRepository.java          # Paginated queries + unpaginated for home
    │   ├── CategoryRepository.java
    │   └── UserRepository.java
    └── service/
        ├── PetService.java
        ├── CategoryService.java
        └── UserService.java            # Implements UserDetailsService
```

---

## Data Model

```
┌──────────────────────┐       ┌─────────────────────────────────┐
│ categories           │       │ pets                            │
├──────────────────────┤       ├─────────────────────────────────┤
│ id          BIGSERIAL│◄──┐   │ id          BIGSERIAL  PK       │
│ name        VARCHAR  │   │   │ name        VARCHAR              │
│ description VARCHAR  │   │   │ species     VARCHAR              │
│ icon        VARCHAR  │   └───│ category_id BIGINT   FK         │
└──────────────────────┘       │ breed       VARCHAR              │
                               │ age         INT                  │
                               │ price       DOUBLE               │
                               │ description VARCHAR(1000)        │
                               │ image_url   VARCHAR              │
                               │ status      VARCHAR (enum)       │
                               └─────────────────────────────────┘

┌──────────────────────┐
│ users                │
├──────────────────────┤
│ id          BIGSERIAL│
│ username    VARCHAR  │ UNIQUE
│ email       VARCHAR  │ UNIQUE
│ password    VARCHAR  │ BCrypt hash
│ role        VARCHAR  │ CUSTOMER | ADMIN
│ created_at  TIMESTAMP│
└──────────────────────┘
```

---

## High-Level Design

### Layer responsibilities

```
┌─────────────────────────────────────────────────────────┐
│  Controller layer  (@RestController)                    │
│  • HTTP request/response mapping                        │
│  • Input validation (@Valid, @RequestParam)             │
│  • Delegates ALL business logic to services             │
├─────────────────────────────────────────────────────────┤
│  Service layer  (@Service)                              │
│  • Business rules (pagination limits, sort whitelist)   │
│  • Orchestrates repositories                            │
│  • Maps DTOs ↔ entities                                 │
├─────────────────────────────────────────────────────────┤
│  Repository layer  (JpaRepository)                      │
│  • Data access — Spring Data auto-generates queries     │
│  • Pageable overloads for filtered listing              │
├─────────────────────────────────────────────────────────┤
│  Model / Entity layer  (@Entity)                        │
│  • JPA mapping with Hibernate                           │
│  • Validation constraints (@NotBlank, @Min, etc.)       │
└─────────────────────────────────────────────────────────┘
```

### Frontend state management

```
App.jsx
└─ AuthProvider (AuthContext)
   ├─ user: { id, username, email, role } | null
   ├─ loading: boolean
   ├─ login(creds)   → POST /api/auth/login
   ├─ logout()       → POST /api/auth/logout
   └─ register(data) → POST /api/auth/register

   Consumers:
   ├─ Navbar.jsx     → shows/hides links based on role
   ├─ ProtectedRoute → redirects to /login if not authenticated
   ├─ PetDetailPage  → hides edit/delete for non-admins
   └─ UsersPage      → admin-only user table
```

### SPA routing strategy

The React app uses client-side routing (React Router). To prevent 404s on direct URL access (`/pets/3`, `/admin`), a `SpaController` forwards all non-API, non-asset paths to `index.html`:

```java
@GetMapping({"/" , "/{p:[^\\.]*}", "/{p:[^\\.]*}/{q:[^\\.]*}"})
public String forward() { return "forward:/index.html"; }
```

Spring Security is configured to permit all `/**` static/SPA routes.

---

## How to Run

### Prerequisites

| Tool              | Required for          | Install                                  |
|-------------------|-----------------------|------------------------------------------|
| Java 17+          | backend dev / tests   | sdkman, Homebrew, or manual              |
| Maven 3.6+        | building              | sdkman / Homebrew                        |
| Node 18+ / npm    | frontend dev          | nvm or Homebrew                          |
| Docker + Compose  | containerised runs    | **OrbStack** (Mac) or Docker Desktop     |
| PostgreSQL client | optional inspection   | `brew install postgresql`                |

> **OrbStack on Apple Silicon** — OrbStack is the recommended Docker runtime for macOS.
> It is a lightweight Docker Desktop alternative with native ARM64 support and near-native performance.
> Install: https://orbstack.dev
> Once installed, `docker` and `docker compose` work identically to Docker Desktop.

---

### Option A — Docker Compose (recommended)

Builds everything from source and starts PostgreSQL + the app in one command.

```bash
docker compose up --build
```

What happens:
1. **Stage 1 (Node)** — `npm ci && npm run build` → React bundle in `/app/dist`
2. **Stage 2 (Maven)** — pre-built assets copied in, `mvn package` produces the fat JAR
3. **Stage 3 (JRE)** — minimal runtime image starts with `java -jar app.jar`
4. **PostgreSQL 16** — starts with a health-check; app waits until ready
5. **DataInitializer** — seeds categories, 12 pets, and 2 demo users on first run

Open **http://localhost:8080**

To stop and remove containers (data volume is preserved):
```bash
docker compose down
```

To also wipe the database volume:
```bash
docker compose down -v
```

To rebuild after code changes:
```bash
docker compose up --build
```

To run in the background:
```bash
docker compose up --build -d
docker compose logs -f app    # tail app logs
```

---

### Option B — Local dev with Docker Postgres

Run only the database in Docker and the Spring Boot + Vite dev servers on the host.
This gives hot-reload for both frontend and backend.

**Terminal 1 — start PostgreSQL only:**
```bash
docker compose up db -d
```

**Terminal 2 — Spring Boot backend (port 8080):**
```bash
mvn spring-boot:run
```

Spring Boot connects to `localhost:5432` using the defaults in `application.properties`:
```
DB_URL      = jdbc:postgresql://localhost:5432/petstore
DB_USER     = petstore
DB_PASSWORD = petstore
```

**Terminal 3 — Vite dev server (port 5173, proxies /api to :8080):**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — Vite hot-reloads on every save.

Stop the database when done:
```bash
docker compose down db
```

---

### Option C — Fully local with H2 (no Postgres)

For the quickest spin-up when you don't want to run any Docker containers.

**Terminal 1 — Spring Boot with H2 profile:**
```bash
mvn spring-boot:run -Dspring.profiles.active=h2
```

H2 in-memory console: http://localhost:8080/h2-console
JDBC URL: `jdbc:h2:mem:petstore` · User: `sa` · Password: *(empty)*

**Terminal 2 — Vite:**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

> Data is lost on every restart because H2 is in-memory.

---

## Build Reference

| Command | Description |
|---------|-------------|
| `mvn clean package` | Full build: Node install + npm build + Java compile → fat JAR |
| `mvn clean package -Dskip.frontend=true` | Java-only build (Vite dev server handles frontend) |
| `mvn spring-boot:run` | Run backend with PostgreSQL (default profile) |
| `mvn spring-boot:run -Dspring.profiles.active=h2` | Run backend with H2 (no Postgres needed) |
| `mvn spring-boot:run -Dskip.frontend=true` | Backend only — faster restart during backend iteration |
| `mvn test` | Run unit tests (H2 in-memory, no Postgres required) |
| `java -jar target/pet-store-1.0.0.jar` | Run the packaged JAR directly |
| `docker compose up --build` | Build + start full stack with Docker |
| `docker compose up db -d` | Start only PostgreSQL |

---

## REST API

Base path: `/api`

### Auth — `/api/auth`

| Method | Endpoint               | Access | Description                              |
|--------|------------------------|--------|------------------------------------------|
| POST   | `/api/auth/register`   | Public | Create account; returns `UserResponse`   |
| POST   | `/api/auth/login`      | Public | Start session; returns `UserResponse`    |
| POST   | `/api/auth/logout`     | Auth   | Invalidate session                       |
| GET    | `/api/auth/me`         | Auth   | Current user info                        |

**Login / Register body:**
```json
{ "username": "admin", "password": "admin123" }
```

**UserResponse shape:**
```json
{ "id": 1, "username": "admin", "email": "admin@pawstore.com", "role": "ADMIN", "createdAt": "2024-01-01T00:00:00" }
```

---

### Pets — `/api/pets`

| Method | Endpoint           | Access | Description                                |
|--------|--------------------|--------|--------------------------------------------|
| GET    | `/api/pets`        | Public | Paginated list with optional filters/sort  |
| GET    | `/api/pets/:id`    | Public | Single pet                                 |
| GET    | `/api/pets/search` | Public | Search by name (paginated)                 |
| POST   | `/api/pets`        | ADMIN  | Create pet                                 |
| PUT    | `/api/pets/:id`    | ADMIN  | Update pet                                 |
| DELETE | `/api/pets/:id`    | ADMIN  | Delete pet                                 |

**Query params for `GET /api/pets`:**

| Param        | Default | Description                                  |
|--------------|---------|----------------------------------------------|
| `page`       | `0`     | 0-based page index                           |
| `size`       | `8`     | Items per page (max 50)                      |
| `sort`       | `id`    | Sort field: `id` · `name` · `price` · `age` |
| `dir`        | `asc`   | Sort direction: `asc` · `desc`               |
| `status`     | —       | `AVAILABLE` · `PENDING` · `ADOPTED`          |
| `categoryId` | —       | Filter by category ID                        |

**Example:**
```bash
curl "http://localhost:8080/api/pets?status=AVAILABLE&sort=price&dir=asc&size=4"
```

---

### Categories — `/api/categories`

| Method | Endpoint                 | Access | Description    |
|--------|--------------------------|--------|----------------|
| GET    | `/api/categories`        | Public | List all       |
| GET    | `/api/categories/:id`    | Public | Single         |
| POST   | `/api/categories`        | ADMIN  | Create         |
| PUT    | `/api/categories/:id`    | ADMIN  | Update         |
| DELETE | `/api/categories/:id`    | ADMIN  | Delete         |

---

### Users — `/api/users`

| Method | Endpoint                  | Access | Description                        |
|--------|---------------------------|--------|------------------------------------|
| GET    | `/api/users`              | ADMIN  | List all users                     |
| GET    | `/api/users/:id`          | ADMIN  | Single user                        |
| PATCH  | `/api/users/:id/role`     | ADMIN  | Change role                        |
| DELETE | `/api/users/:id`          | ADMIN  | Delete user (cannot delete self)   |

**Role update body:**
```json
{ "role": "ADMIN" }
```

---

## Security Model

| Concern         | Implementation                                                         |
|-----------------|------------------------------------------------------------------------|
| Auth mechanism  | HTTP session (`JSESSIONID` cookie, 24-hour TTL)                        |
| Passwords       | BCrypt via Spring Security (`BCryptPasswordEncoder`)                   |
| CSRF            | Disabled — protected by strict CORS (`allowCredentials + exact origin`)|
| CORS            | Allowed origin: `http://localhost:5173`; all methods; credentials: yes |
| Route rules     | Public GETs · ADMIN writes on pets/categories · ADMIN user management  |
| Unauthenticated | `401 Unauthorized` on protected endpoints                              |
| Insufficient role | `403 Forbidden`                                                      |

**Security filter chain summary:**

```
/h2-console/**              → permitAll
POST /api/auth/login,register → permitAll
/api/auth/**                → authenticated
GET /api/pets/**, /api/categories/** → permitAll
POST/PUT/DELETE /api/pets/**, /api/categories/** → ROLE_ADMIN
/api/users/**               → ROLE_ADMIN
/**                         → permitAll  (SPA static assets)
```

---

## Demo Accounts

| Username   | Password      | Role     | Can do                               |
|------------|---------------|----------|--------------------------------------|
| `admin`    | `admin123`    | ADMIN    | Everything: CRUD pets, manage users  |
| `customer` | `customer123` | CUSTOMER | Browse and search only               |

Both are created by `DataInitializer` on first startup if no users exist.

---

## Database

### Seed data (loaded on first startup)

| Table      | Rows |
|------------|------|
| categories | 6    |
| pets       | 12   |
| users      | 2    |

Categories: Dogs · Cats · Birds · Fish · Rabbits · Reptiles

### Connect with a local client

```bash
# While Docker Compose is running:
psql -h localhost -p 5432 -U petstore -d petstore
```

### Inspect via pgAdmin or DBeaver

| Field    | Value              |
|----------|--------------------|
| Host     | `localhost`        |
| Port     | `5432`             |
| Database | `petstore`         |
| User     | `petstore`         |
| Password | `petstore`         |

---

## Switching Databases

### To a managed PostgreSQL (cloud / staging)

Set environment variables before running the JAR:

```bash
export DB_URL=jdbc:postgresql://your-host:5432/petstore
export DB_USER=your_user
export DB_PASSWORD=your_password
java -jar target/pet-store-1.0.0.jar
```

Or override in `docker-compose.yml`:

```yaml
environment:
  DB_URL:      jdbc:postgresql://your-host:5432/petstore
  DB_USER:     your_user
  DB_PASSWORD: your_password
```

### Back to H2 (no Postgres)

```bash
mvn spring-boot:run -Dspring.profiles.active=h2
```
