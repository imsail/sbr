# 🐾 PawStore

A full-stack pet store application built with **Spring Boot 3** and **React + SASS**, packaged as a single Maven project.

---

## Tech Stack

| Layer    | Technology                                                  |
|----------|-------------------------------------------------------------|
| Backend  | Spring Boot 3.4.3 · Java 17 · Spring Data JPA · Spring Security 6 |
| Database | H2 (in-memory, dev) — swap to MySQL/Postgres easily         |
| Frontend | React 18 · Vite · SASS                                      |
| Build    | Maven · frontend-maven-plugin                               |

---

## Project Structure

```
sbr/
├── pom.xml                              # Maven build (includes frontend plugin)
├── frontend/                            # React + Vite app
│   ├── src/
│   │   ├── context/AuthContext.jsx      # Session auth state + hooks
│   │   ├── components/                  # Navbar, Footer, PetCard, Pagination, ProtectedRoute
│   │   ├── pages/                       # Home, Pets, PetDetail, Admin, Login, Register, Users
│   │   ├── services/api.js              # Axios client (withCredentials, 401 interceptor)
│   │   └── styles/                      # SASS partials + main.scss
│   └── vite.config.js                   # Proxies /api → :8080 in dev
└── src/main/java/com/petstore/
    ├── config/                          # SecurityConfig, AppConfig (PasswordEncoder)
    ├── controller/                      # PetController, CategoryController,
    │                                    # AuthController, UserController, SpaController
    ├── dto/                             # PetRequest, RegisterRequest, LoginRequest, UserResponse
    ├── model/                           # Pet, Category, PetStatus, User, Role
    ├── repository/                      # Spring Data JPA repositories
    └── service/                         # PetService, CategoryService, UserService
```

---

## Features

### Pet Store
- **Browse pets** — responsive grid with category icons and status badges
- **Filter & search** — by status, category, or name (all server-side)
- **Pagination** — server-driven with page size picker and sort options (newest, price, name, age)
- **Pet detail** — full info page; write actions visible to admins only

### Auth & Users
- **Register / Login** — session-based auth via `JSESSIONID` cookie; BCrypt passwords
- **Role-gated UI** — navbar, buttons, and routes adapt to role automatically
- **Admin panel** — add / edit pets, manage all users
- **User management** — admin table with promote/demote toggle and delete

---

## Demo Accounts

| Username   | Password      | Role     |
|------------|---------------|----------|
| `admin`    | `admin123`    | ADMIN    |
| `customer` | `customer123` | CUSTOMER |

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.6+
- Node 18+ / npm 9+

### Development (two terminals)

```bash
# Terminal 1 — Spring Boot backend (port 8080)
mvn spring-boot:run

# Terminal 2 — Vite dev server (port 5173, proxies /api to :8080)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### Production build (single JAR)

```bash
mvn clean package
java -jar target/pet-store-1.0.0.jar
```

Maven will:
1. Install Node & npm via `frontend-maven-plugin`
2. Run `npm install` and `npm run build`
3. Copy `frontend/dist` into `target/classes/static`
4. Package everything into one executable JAR

Open **http://localhost:8080**

---

## REST API

Base path: `/api`

### Auth

| Method | Endpoint              | Access | Description                        |
|--------|-----------------------|--------|------------------------------------|
| POST   | `/api/auth/register`  | Public | Create account (returns UserResponse) |
| POST   | `/api/auth/login`     | Public | Start session (returns UserResponse)  |
| POST   | `/api/auth/logout`    | Auth   | Invalidate session                 |
| GET    | `/api/auth/me`        | Auth   | Current user info                  |

### Users

| Method | Endpoint                  | Access | Description           |
|--------|---------------------------|--------|-----------------------|
| GET    | `/api/users`              | ADMIN  | List all users        |
| GET    | `/api/users/:id`          | ADMIN  | Get single user       |
| PATCH  | `/api/users/:id/role`     | ADMIN  | Change role           |
| DELETE | `/api/users/:id`          | ADMIN  | Delete user           |

`PATCH /api/users/:id/role` body: `{ "role": "ADMIN" }` or `{ "role": "CUSTOMER" }`

### Pets

| Method | Endpoint            | Access | Description                               |
|--------|---------------------|--------|-------------------------------------------|
| GET    | `/api/pets`         | Public | List pets (paginated, filterable, sorted) |
| GET    | `/api/pets/:id`     | Public | Get single pet                            |
| GET    | `/api/pets/search`  | Public | Search by name (paginated)                |
| POST   | `/api/pets`         | ADMIN  | Create pet                                |
| PUT    | `/api/pets/:id`     | ADMIN  | Update pet                                |
| DELETE | `/api/pets/:id`     | ADMIN  | Delete pet                                |

**Query params for `GET /api/pets`:**

| Param        | Default | Description                               |
|--------------|---------|-------------------------------------------|
| `page`       | `0`     | 0-based page index                        |
| `size`       | `8`     | Page size (max 50)                        |
| `sort`       | `id`    | Field: `id`, `name`, `price`, `age`       |
| `dir`        | `asc`   | Direction: `asc` or `desc`               |
| `status`     | —       | Filter: `AVAILABLE`, `PENDING`, `ADOPTED` |
| `categoryId` | —       | Filter by category ID                     |

### Categories

| Method | Endpoint               | Access | Description  |
|--------|------------------------|--------|--------------|
| GET    | `/api/categories`      | Public | List all     |
| GET    | `/api/categories/:id`  | Public | Get single   |
| POST   | `/api/categories`      | ADMIN  | Create       |
| PUT    | `/api/categories/:id`  | ADMIN  | Update       |
| DELETE | `/api/categories/:id`  | ADMIN  | Delete       |

---

## Security

- **Mechanism**: HTTP session (`JSESSIONID` cookie, 24-hour TTL)
- **Passwords**: BCrypt via Spring Security
- **CSRF**: disabled — protected by strict CORS (`allowCredentials + specific origin`)
- **Unauthenticated write attempts**: `403 Forbidden`

---

## Database

H2 in-memory database seeded on startup with **6 categories**, **12 pets**, and **2 users**.

H2 console: **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:mem:petstore`
- User: `sa` · Password: *(empty)*

### Switch to PostgreSQL

`application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/petstore
spring.datasource.username=your_user
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

`pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```
