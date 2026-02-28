# 🐾 PawStore

A full-stack pet store application built with **Spring Boot 3** and **React + SASS**, packaged as a single Maven project.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | Spring Boot 3.4.3 · Java 17 · Spring Data JPA  |
| Database  | H2 (in-memory, dev) — swap to MySQL/Postgres easily |
| Frontend  | React 18 · Vite · SASS (CSS Modules via partials) |
| Build     | Maven · frontend-maven-plugin                   |

---

## Project Structure

```
sbr/
├── pom.xml                          # Maven build (includes frontend plugin)
├── frontend/                        # React + Vite app
│   ├── src/
│   │   ├── components/              # Navbar, Footer, PetCard, Pagination
│   │   ├── pages/                   # Home, Pets, PetDetail, Admin
│   │   ├── services/api.js          # Axios API client
│   │   └── styles/                  # SASS partials + main.scss
│   └── vite.config.js               # Proxies /api → :8080 in dev
└── src/main/java/com/petstore/
    ├── config/CorsConfig.java
    ├── controller/                  # PetController, CategoryController, SpaController
    ├── dto/PetRequest.java
    ├── model/                       # Pet, Category, PetStatus
    ├── repository/                  # Spring Data JPA repositories
    └── service/                     # PetService, CategoryService
```

---

## Features

- **Browse pets** — grid view with category icons and status badges
- **Filter & search** — by status, category, name (server-side)
- **Pagination** — server-driven with page size picker and sort options (price, name, age)
- **Pet detail** — full info, adopt button, edit/delete actions
- **Admin form** — add or edit pets with validation
- **SPA routing** — React Router with Spring Boot forwarding non-API routes to `index.html`

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.6+ (or use the SDKMAN-managed Maven)
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

### Pets

| Method | Endpoint            | Description                              |
|--------|---------------------|------------------------------------------|
| GET    | `/api/pets`         | List pets (paginated, filterable, sorted)|
| GET    | `/api/pets/:id`     | Get single pet                           |
| GET    | `/api/pets/search`  | Search pets by name (paginated)          |
| POST   | `/api/pets`         | Create pet                               |
| PUT    | `/api/pets/:id`     | Update pet                               |
| DELETE | `/api/pets/:id`     | Delete pet                               |

**Pagination / sort query params for `GET /api/pets`:**

| Param      | Default | Description                              |
|------------|---------|------------------------------------------|
| `page`     | `0`     | 0-based page index                       |
| `size`     | `8`     | Page size (max 50)                       |
| `sort`     | `id`    | Field: `id`, `name`, `price`, `age`      |
| `dir`      | `asc`   | Direction: `asc` or `desc`              |
| `status`   | —       | Filter: `AVAILABLE`, `PENDING`, `ADOPTED`|
| `categoryId` | —     | Filter by category ID                    |

### Categories

| Method | Endpoint               | Description       |
|--------|------------------------|-------------------|
| GET    | `/api/categories`      | List all          |
| GET    | `/api/categories/:id`  | Get single        |
| POST   | `/api/categories`      | Create            |
| PUT    | `/api/categories/:id`  | Update            |
| DELETE | `/api/categories/:id`  | Delete            |

---

## Database

H2 in-memory database is seeded on startup with **6 categories** and **12 pets**.

H2 console available at **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:mem:petstore`
- User: `sa` · Password: *(empty)*

To switch to PostgreSQL, update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/petstore
spring.datasource.username=your_user
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

And add the driver to `pom.xml`:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```
