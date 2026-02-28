# PawStore: A Beginner's Guide to Full-Stack Web Development

This tutorial walks you through the **PawStore** pet store app — a real, working project
built with **Spring Boot** (Java backend) and **React** (JavaScript frontend).

If you are new to web development, this guide will explain not just *what* the code does
but *why* it is written that way. Every section builds on the one before it.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Project Layout](#2-project-layout)
3. [The Backend: Spring Boot](#3-the-backend-spring-boot)
   - 3.1 [How a Request Travels Through the App](#31-how-a-request-travels-through-the-app)
   - 3.2 [Models — The Database Tables](#32-models--the-database-tables)
   - 3.3 [DTOs — Controlling What Goes In and Out](#33-dtos--controlling-what-goes-in-and-out)
   - 3.4 [Repositories — Talking to the Database](#34-repositories--talking-to-the-database)
   - 3.5 [Services — The Business Logic Layer](#35-services--the-business-logic-layer)
   - 3.6 [Controllers — The HTTP Endpoints](#36-controllers--the-http-endpoints)
   - 3.7 [Seeding the Database on Startup](#37-seeding-the-database-on-startup)
4. [The Frontend: React](#4-the-frontend-react)
   - 4.1 [How React Works](#41-how-react-works)
   - 4.2 [Entry Point and Routing](#42-entry-point-and-routing)
   - 4.3 [Sharing State with Context](#43-sharing-state-with-context)
   - 4.4 [Pages and Components](#44-pages-and-components)
   - 4.5 [Keeping Filters in the URL](#45-keeping-filters-in-the-url)
   - 4.6 [Protecting Admin Pages](#46-protecting-admin-pages)
   - 4.7 [Calling the API from React](#47-calling-the-api-from-react)
   - 4.8 [Styles with SCSS](#48-styles-with-scss)
5. [How Frontend and Backend Talk to Each Other](#5-how-frontend-and-backend-talk-to-each-other)
6. [Authentication and Security](#6-authentication-and-security)
   - 6.1 [What is Authentication?](#61-what-is-authentication)
   - 6.2 [Session-Based Login (Browser)](#62-session-based-login-browser)
   - 6.3 [JWT Token Auth (API Clients)](#63-jwt-token-auth-api-clients)
   - 6.4 [The JWT Filter](#64-the-jwt-filter)
   - 6.5 [Authorization — Who Can Do What?](#65-authorization--who-can-do-what)
7. [Configuration Files Explained](#7-configuration-files-explained)
8. [Build and Docker](#8-build-and-docker)
9. [Running the Project](#9-running-the-project)
10. [Monitoring: Actuator, Prometheus, and Grafana](#10-monitoring-actuator-prometheus-and-grafana)
    - 10.1 [What is Monitoring and Why Does It Matter?](#101-what-is-monitoring-and-why-does-it-matter)
    - 10.2 [Spring Boot Actuator — Built-in Health and Metrics](#102-spring-boot-actuator--built-in-health-and-metrics)
    - 10.3 [Prometheus — Collecting the Metrics](#103-prometheus--collecting-the-metrics)
    - 10.4 [Grafana — Visualising the Metrics](#104-grafana--visualising-the-metrics)
    - 10.5 [The Pre-built PawStore Dashboard](#105-the-pre-built-pawstore-dashboard)
    - 10.6 [How the Pieces Wire Together](#106-how-the-pieces-wire-together)
11. [Quick Reference](#11-quick-reference)

---

## 1. The Big Picture

A web application has two main parts:

```
┌─────────────────────────────────────────────────────┐
│  BROWSER (the user's computer)                      │
│                                                     │
│  React app — what the user sees and clicks on       │
│  Runs entirely in JavaScript inside the browser     │
└────────────────────┬────────────────────────────────┘
                     │  HTTP requests  (JSON data)
                     │  ◄──────────────────────────────
                     ▼
┌─────────────────────────────────────────────────────┐
│  SERVER (a computer in the cloud, or your laptop)   │
│                                                     │
│  Spring Boot app — handles requests, runs logic     │
│  Reads and writes to the database                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  PostgreSQL database — stores all the data    │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

The browser and server communicate using **HTTP** — the same protocol your browser uses
to load any webpage. Data is sent back and forth as **JSON**, which looks like this:

```json
{
  "id": 1,
  "name": "Buddy",
  "species": "Dog",
  "price": 850.00,
  "status": "AVAILABLE"
}
```

The React app asks the Spring Boot server for data, the server reads it from the database,
and sends it back as JSON. React then displays it as a webpage.

---

## 2. Project Layout

Here is what the repository looks like, and what each folder is for:

```
sbr/
│
├── frontend/                   ← Everything the BROWSER runs
│   ├── package.json            ← List of JavaScript dependencies (like pom.xml for Java)
│   ├── vite.config.js          ← Build tool configuration
│   └── src/
│       ├── main.jsx            ← The very first file React loads
│       ├── App.jsx             ← Defines all the pages/routes
│       ├── context/            ← Global shared state (who is logged in)
│       ├── components/         ← Small, reusable UI pieces (Navbar, PetCard…)
│       ├── pages/              ← One file per page (HomePage, PetsPage…)
│       ├── services/api.js     ← All calls to the backend in one place
│       └── styles/             ← SCSS stylesheets
│
└── src/main/java/com/petstore/ ← Everything the SERVER runs
    ├── PetStoreApplication.java  ← The very first file Java runs
    ├── DataInitializer.java      ← Creates demo data on startup
    ├── model/                    ← Database table definitions
    ├── dto/                      ← Shapes of request and response data
    ├── repository/               ← Database queries
    ├── service/                  ← Business logic
    ├── controller/               ← HTTP endpoints (the URLs)
    ├── security/                 ← JWT token handling
    └── config/                   ← Spring Security and other setup
```

> **Mental model:** Think of the backend like a restaurant kitchen. The **controller**
> is the waiter (takes orders from the outside), the **service** is the chef
> (decides how to prepare the meal), and the **repository** is the pantry
> (fetches the raw ingredients from the database).

---

## 3. The Backend: Spring Boot

Spring Boot is a Java framework that takes care of a lot of repetitive setup so you can
focus on writing your application logic.

When you annotate a class with `@RestController`, Spring Boot automatically:
- Detects it on startup
- Registers its methods as HTTP endpoints
- Converts Java objects to/from JSON

You write the logic. Spring handles the plumbing.

### 3.1 How a Request Travels Through the App

Let's trace what happens when someone opens the pet list page:

```
Browser sends:  GET /api/pets?status=AVAILABLE&page=0&size=8

  ┌─────────────────────┐
  │  PetController      │  1. Receives the request, reads the parameters
  │  @GetMapping        │     Delegates to the service
  └────────┬────────────┘
           │
  ┌────────▼────────────┐
  │  PetService         │  2. Decides which query to run (with or without filters)
  │  findFiltered(...)  │     Calls the repository
  └────────┬────────────┘
           │
  ┌────────▼────────────┐
  │  PetRepository      │  3. Runs the SQL query against the database
  │  findByStatus(...)  │     Returns a Page<Pet> (list + total count)
  └────────┬────────────┘
           │
  ┌────────▼────────────┐
  │  PetController      │  4. Wraps the result in an HTTP 200 response
  │  ResponseEntity.ok()│     Spring converts the Java object to JSON automatically
  └─────────────────────┘

Browser receives:
{
  "content": [ { "id": 1, "name": "Buddy", ... }, ... ],
  "totalElements": 12,
  "totalPages": 2
}
```

Every API request follows this same path: **Controller → Service → Repository → Database → back**.

### 3.2 Models — The Database Tables

A **model** (also called an **entity**) is a Java class where each field becomes a
column in a database table. Spring and Hibernate read these classes and create the tables
for you.

```java
// model/Pet.java

@Data               // Lombok: auto-generates getters, setters, equals(), hashCode(), toString()
@NoArgsConstructor  // Lombok: generates Pet() with no arguments — JPA requires this
@AllArgsConstructor // Lombok: generates Pet(id, name, species, ...) with all arguments
@Entity             // JPA: "this class is a database table"
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment: 1, 2, 3, ...
    private Long id;

    @NotBlank               // Validation: reject empty or whitespace-only values
    @Column(nullable = false)
    private String name;

    @Min(0)                 // Validation: age must be 0 or more
    private int age;

    @DecimalMin("0.0")      // Validation: price must be 0.0 or more
    private double price;

    @Enumerated(EnumType.STRING)  // Store "AVAILABLE" in the DB, not the number 0
    private PetStatus status = PetStatus.AVAILABLE;

    // Relationship: many pets belong to one category
    // EAGER means: when you load a Pet, automatically load its Category too
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;
}
```

**What is Lombok?**
Without Lombok you would need to write dozens of lines of repetitive code:

```java
// Without Lombok — you'd need to write all of this by hand:
public String getName() { return name; }
public void setName(String name) { this.name = name; }
public int getAge() { return age; }
public void setAge(int age) { this.age = age; }
// ... 10 more fields × 2 methods each = 20+ methods

public boolean equals(Object o) { ... }   // Another 10 lines
public int hashCode() { ... }             // Another 5 lines
public String toString() { ... }          // Another 5 lines
```

`@Data` replaces all of that with one annotation. Lombok generates the code at
compile time — it's as if you wrote it yourself.

**What is `@ManyToOne`?**
In a real database, pets and categories are stored in separate tables. The `category_id`
column in the `pets` table stores the ID of the category. JPA's `@ManyToOne` annotation
tells Hibernate: "when you load a Pet, automatically fetch the Category it belongs to."

**What does `EAGER` mean?**
It means load the Category *immediately* when you load the Pet. The alternative is
`LAZY`, which would only load the Category when you first access `pet.getCategory()`.
LAZY can cause errors if you access it after the database connection has closed, so
we use EAGER here for simplicity.

---

The `User` model also implements Spring Security's `UserDetails` interface so Spring
knows how to use it for authentication:

```java
// model/User.java

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {  // Spring Security knows what to do with this

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;  // Always stored as a BCrypt hash, never plain text

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.CUSTOMER;  // Default role when you register

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Spring Security calls this to know what this user is allowed to do
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // "ROLE_ADMIN" or "ROLE_CUSTOMER" — Spring Security's convention
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    // These tell Spring the account is valid and usable
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
```

---

### 3.3 DTOs — Controlling What Goes In and Out

A **DTO** (Data Transfer Object) is a class that defines the *shape* of data that comes
in through an HTTP request or goes out in a response.

**Why not just use the entity directly?**

Imagine using `User` directly as the response body. The JSON would include the
`password` field. That would be a serious security bug — you'd be sending password
hashes to the browser.

DTOs let you be explicit about what is allowed in and out:

```java
// dto/UserResponse.java — sent BACK to the browser (no password)
public record UserResponse(
    Long id,
    String username,
    String email,
    String role,
    LocalDateTime createdAt
    // notice: no password field!
) {
    // Factory method: converts a User entity into this safe response object
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name(),
            user.getCreatedAt()
        );
    }
}
```

> **`record`** is a modern Java feature. Writing `record UserResponse(Long id, ...)` is
> shorthand for a class with those fields, a constructor, getters, `equals()`,
> `hashCode()`, and `toString()` — all generated automatically. Use records for
> simple data containers that never change after creation.

```java
// dto/RegisterRequest.java — received FROM the browser when signing up
@Data
public class RegisterRequest {

    @NotBlank
    @Size(min = 3, max = 30)    // Username must be 3–30 characters
    private String username;

    @NotBlank
    @Email                       // Must look like an email address
    private String email;

    @NotBlank
    @Size(min = 6, max = 72)    // Password must be at least 6 characters
    private String password;
}
```

```java
// dto/PetRequest.java — received FROM the browser when creating or editing a pet
@Data
public class PetRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String species;

    private String breed;

    @Min(0)
    private int age;

    @DecimalMin("0.0")
    private double price;

    private String description;
    private String imageUrl;
    private PetStatus status;

    // The client sends a category ID (a number), not the whole Category object.
    // The service layer will look up the Category by this ID.
    private Long categoryId;
}
```

---

### 3.4 Repositories — Talking to the Database

A **repository** is an interface for running database queries. You define the
interface; Spring Data JPA writes the actual SQL for you based on the method names.

```java
// repository/PetRepository.java
public interface PetRepository extends JpaRepository<Pet, Long> {
    //                                               ^^^^^^^^^^
    //                           Pet = the entity, Long = the type of its ID

    // JpaRepository already gives you for free:
    //   findAll(), findById(id), save(pet), deleteById(id), count(), ...

    // Spring reads "findByStatus" and generates:
    //   SELECT * FROM pets WHERE status = ? ORDER BY ... LIMIT ? OFFSET ?
    Page<Pet> findByStatus(PetStatus status, Pageable pageable);

    // SELECT * FROM pets WHERE category_id = ?
    Page<Pet> findByCategoryId(Long categoryId, Pageable pageable);

    // Two conditions combined with AND
    Page<Pet> findByStatusAndCategoryId(PetStatus status, Long categoryId, Pageable pageable);

    // LOWER(name) LIKE LOWER('%?%') — case-insensitive search
    Page<Pet> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
```

**What is `Page<Pet>`?**
It wraps a list of pets *plus* metadata needed for pagination:

```json
{
  "content": [ { "id": 1, ... }, { "id": 2, ... } ],
  "totalElements": 47,
  "totalPages": 6,
  "number": 0,
  "size": 8
}
```

The frontend uses `totalPages` to know how many page buttons to show.

**What is `Pageable`?**
It tells the database which page you want and how to sort:

```java
// page=0 (first page), size=8, sorted by price ascending
Pageable pageable = PageRequest.of(0, 8, Sort.by(Sort.Direction.ASC, "price"));
```

---

### 3.5 Services — The Business Logic Layer

The **service** is where you write rules and decisions that don't belong in the
database layer (repository) or the HTTP layer (controller).

```java
// service/PetService.java
@Service              // Registers this class as a Spring bean
@RequiredArgsConstructor  // Lombok: injects petRepository and categoryRepository via constructor
public class PetService {

    private final PetRepository petRepository;
    private final CategoryRepository categoryRepository;

    // The controller doesn't know which query to run — the service decides.
    public Page<Pet> findFiltered(PetStatus status, Long categoryId, Pageable pageable) {
        if (status != null && categoryId != null)
            return petRepository.findByStatusAndCategoryId(status, categoryId, pageable);
        if (status != null)
            return petRepository.findByStatus(status, pageable);
        if (categoryId != null)
            return petRepository.findByCategoryId(categoryId, pageable);
        return petRepository.findAll(pageable);  // No filters — return everything
    }

    public Pet create(PetRequest req) {
        Pet pet = new Pet();
        applyRequest(pet, req);      // Copy fields from DTO to entity
        return petRepository.save(pet);   // INSERT into database
    }

    public Pet update(Long id, PetRequest req) {
        Pet pet = petRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pet not found: " + id));
        applyRequest(pet, req);
        return petRepository.save(pet);   // UPDATE in database
    }

    private void applyRequest(Pet pet, PetRequest req) {
        pet.setName(req.getName());
        pet.setSpecies(req.getSpecies());
        pet.setBreed(req.getBreed());
        pet.setAge(req.getAge());
        pet.setPrice(req.getPrice());
        pet.setDescription(req.getDescription());
        pet.setImageUrl(req.getImageUrl());
        if (req.getStatus() != null) pet.setStatus(req.getStatus());

        // Look up the Category by ID — throw a clear error if it doesn't exist
        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
            pet.setCategory(category);
        }
    }
}
```

**Why a separate service layer?**
- **Testability:** You can test `PetService` without starting an HTTP server.
- **Reusability:** Multiple controllers could call the same service method.
- **Clarity:** The controller stays thin. The service has all the "if this then that" logic.

---

### 3.6 Controllers — The HTTP Endpoints

Controllers are the public face of the backend. Each method handles one URL pattern.

```java
// controller/PetController.java
@RestController            // Combines @Controller and @ResponseBody
@RequestMapping("/api/pets")  // All methods in this class start with /api/pets
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    // GET /api/pets?status=AVAILABLE&page=0&size=8&sort=price&dir=asc
    @GetMapping
    public ResponseEntity<Page<Pet>> list(
            @RequestParam(required = false) PetStatus status,     // ?status=AVAILABLE (optional)
            @RequestParam(required = false) Long categoryId,       // ?categoryId=1    (optional)
            @RequestParam(defaultValue = "0")  int page,           // ?page=0  (default: 0)
            @RequestParam(defaultValue = "8")  int size,           // ?size=8  (default: 8)
            @RequestParam(defaultValue = "id") String sort,        // ?sort=price
            @RequestParam(defaultValue = "asc") String dir) {      // ?dir=desc

        // Limit page size — don't let a client request 1 million rows
        size = Math.min(size, 50);

        // Whitelist: only allow sorting by known column names
        // This prevents a bug where a client could inject arbitrary SQL
        Set<String> allowed = Set.of("id", "name", "price", "age");
        if (!allowed.contains(sort)) sort = "id";

        Sort.Direction direction = "desc".equalsIgnoreCase(dir)
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort));

        return ResponseEntity.ok(petService.findFiltered(status, categoryId, pageable));
    }

    // GET /api/pets/42
    @GetMapping("/{id}")
    public ResponseEntity<Pet> get(@PathVariable Long id) {
        return petService.findById(id)
            .map(ResponseEntity::ok)                    // Found → 200 OK
            .orElse(ResponseEntity.notFound().build()); // Missing → 404 Not Found
    }

    // POST /api/pets  (body: PetRequest JSON)
    @PostMapping
    public ResponseEntity<Pet> create(@Valid @RequestBody PetRequest req) {
        // @Valid triggers all the @NotBlank, @Min etc. checks on PetRequest
        // If any check fails, Spring returns 400 Bad Request automatically
        return ResponseEntity.status(201).body(petService.create(req));  // 201 Created
    }

    // PUT /api/pets/42  (body: PetRequest JSON)
    @PutMapping("/{id}")
    public ResponseEntity<Pet> update(@PathVariable Long id,
                                      @Valid @RequestBody PetRequest req) {
        return ResponseEntity.ok(petService.update(id, req));
    }

    // DELETE /api/pets/42
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        petService.delete(id);
        return ResponseEntity.noContent().build();  // 204 No Content
    }
}
```

**HTTP status codes you'll see:**

| Code | Meaning | When to use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE (nothing to return) |
| 400 | Bad Request | Invalid input (validation failed) |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Logged in but not allowed |
| 404 | Not Found | Resource does not exist |

**The SPA Controller:** There is one special controller that forwards any non-API URL
to `index.html`. This lets React Router handle URLs like `/pets/3` in the browser.
Without it, refreshing the page would give a 404.

```java
// controller/SpaController.java
@Controller
public class SpaController {
    // Match paths like /pets, /login, /admin  — but NOT /api/..., NOT files ending in .js
    @GetMapping(value = {"/", "/{path:[^\\.]*}", "/{path:[^\\.]*}/{sub:[^\\.]*}"})
    public String spa() {
        return "forward:/index.html";  // Tell Tomcat to serve index.html
    }
}
```

---

### 3.7 Seeding the Database on Startup

`DataInitializer` creates demo users and pets when the app starts. It only runs if
the database is empty, so it is safe to restart the server.

```java
// DataInitializer.java
@Component           // Register as a Spring bean
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    // CommandLineRunner: Spring calls run() after the app is fully started

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // ...

    @Override
    public void run(String... args) {
        seedUsers();
        seedCatalog();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;  // Already seeded — skip

        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@pawstore.com");
        admin.setPassword(passwordEncoder.encode("admin123")); // NEVER store plain text!
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        // ...
    }
}
```

> **Why encode the password?** Passwords must never be stored as plain text.
> `BCryptPasswordEncoder` turns "admin123" into a long random-looking string like
> `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`.
> Even if someone steals your database, they cannot reverse the hash back to
> the original password.

---

## 4. The Frontend: React

### 4.1 How React Works

Traditional websites send a new HTML page from the server every time you click a link.
React works differently — the server sends **one** HTML page, and JavaScript updates
what you see without ever reloading.

```
Traditional:   Click link → Server sends new HTML page → Full reload
React (SPA):   Click link → JavaScript swaps out the content → Instant, no reload
```

React builds the UI from **components** — small, reusable JavaScript functions that
return HTML-like code (called JSX).

```jsx
// A simple component
function PetCard({ pet }) {
  return (
    <div className="pet-card">
      <img src={pet.imageUrl} alt={pet.name} />
      <h3>{pet.name}</h3>
      <p>{pet.species} · {pet.breed}</p>
      <span className="price">${pet.price}</span>
    </div>
  )
}

// Using it somewhere else:
<PetCard pet={myPet} />
```

JSX looks like HTML but it is JavaScript. `{pet.name}` inserts a JavaScript value
into the markup. `className` is used instead of `class` because `class` is a
reserved word in JavaScript.

---

### 4.2 Entry Point and Routing

```jsx
// frontend/src/main.jsx — the very first file React loads
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/main.scss'   // Import global styles

// Find the <div id="root"> in index.html and mount React inside it
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

```jsx
// frontend/src/App.jsx — defines which component to show for each URL
import { BrowserRouter, Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>      {/* Enables URL-based navigation */}
      <AuthProvider>     {/* Makes login info available everywhere (explained later) */}
        <Navbar />

        <Routes>         {/* Looks at the current URL and renders the right page */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/pets"     element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetDetailPage />} />  {/* :id is a variable */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ProtectedRoute checks if the user is an admin before showing the page */}
          <Route path="/admin"    element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="/users"    element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
        </Routes>

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  )
}
```

When the URL changes to `/pets/5`, React Router renders `<PetDetailPage />`. Inside
that component, `useParams()` gives you `{ id: "5" }` so you can fetch that specific pet.

---

### 4.3 Sharing State with Context

**The problem:** Lots of components need to know who is logged in — the Navbar,
every admin button, the login redirect, etc. You don't want to pass the user object
as a prop through 10 levels of components.

**The solution:** React Context — a global "broadcast" that any component can tune into.

```jsx
// context/AuthContext.jsx

// 1. Create the context (think of it as a radio channel)
const AuthContext = createContext(null)

// 2. The Provider wraps the app and broadcasts auth state
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // null = not logged in
  const [loading, setLoading] = useState(true)   // true = still checking

  // When the app first loads, ask the server "am I already logged in?"
  // (The browser might have a cookie from a previous session)
  useEffect(() => {
    getMe()
      .then(setUser)           // Got a user → we're logged in
      .catch(() => setUser(null))  // Got a 401 → not logged in
      .finally(() => setLoading(false))
  }, [])  // [] = run only once, when the component first appears

  const login = async (credentials) => {
    const data = await loginUser(credentials)
    setUser(data)   // Update the global user state
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)   // Clear the global user state
  }

  const isAdmin = () => user?.role === 'ADMIN'
  // user?.role means: if user is null, don't crash — just return undefined

  // 3. Make these values available to every component inside <AuthProvider>
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// 4. Custom hook — any component calls useAuth() to access the context
export const useAuth = () => useContext(AuthContext)
```

**Using it in a component:**

```jsx
function Navbar() {
  const { user, logout, isAdmin } = useAuth()  // Grab what you need

  return (
    <nav>
      {user ? (
        <>
          <span>Hello, {user.username}</span>
          {isAdmin() && <a href="/admin">Admin Panel</a>}
          <button onClick={logout}>Log Out</button>
        </>
      ) : (
        <a href="/login">Log In</a>
      )}
    </nav>
  )
}
```

---

### 4.4 Pages and Components

**Pages** are full-screen views, one per route. **Components** are smaller, reusable
pieces used inside pages.

```
pages/
  HomePage.jsx       ← Landing page with hero, stats, categories, featured pets
  PetsPage.jsx       ← Pet catalog with filters, search, pagination
  PetDetailPage.jsx  ← Single pet with full info and admin actions
  AdminPage.jsx      ← Form to create or edit a pet
  LoginPage.jsx      ← Login form
  RegisterPage.jsx   ← Sign up form
  UsersPage.jsx      ← Admin: list and manage users

components/
  Navbar.jsx         ← Top navigation bar
  Footer.jsx         ← Page footer
  PetCard.jsx        ← Pet card shown in grids (image, name, price, status)
  Pagination.jsx     ← Page numbers and size selector
  ProtectedRoute.jsx ← Redirects non-admins away from admin pages
```

Here is a typical page component, showing the standard pattern of:
fetch data → show loading → render:

```jsx
// pages/PetDetailPage.jsx (simplified)
import { useParams } from 'react-router-dom'

export default function PetDetailPage() {
  const { id } = useParams()     // Read :id from the URL (e.g. /pets/5 → id = "5")
  const [pet, setPet] = useState(null)
  const [error, setError] = useState(null)
  const { isAdmin } = useAuth()

  // Fetch the pet from the API when the page loads (or when id changes)
  useEffect(() => {
    getPet(id)
      .then(setPet)
      .catch(() => setError('Pet not found'))
  }, [id])

  if (error) return <p className="error">{error}</p>
  if (!pet)  return <p>Loading...</p>

  return (
    <div className="pet-detail">
      <img src={pet.imageUrl} alt={pet.name} />
      <h1>{pet.name}</h1>
      <p>{pet.species} · {pet.breed} · {pet.age} years old</p>
      <p className="price">${pet.price}</p>
      <p>{pet.description}</p>

      {/* Admin buttons only appear for admin users */}
      {isAdmin() && (
        <div className="admin-actions">
          <button onClick={() => navigate(`/admin/${pet.id}`)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  )
}
```

**`useEffect`** is a React hook that runs code *after* the component renders.
The second argument (`[id]`) is the **dependency array** — the effect re-runs
whenever `id` changes. An empty array `[]` means "run once when the component mounts."

---

### 4.5 Keeping Filters in the URL

Consider the pet catalog page: it has filters (status, category), sorting, and
pagination. Where do you store that state?

If you use `useState`, the state is lost when the user refreshes or shares the URL.

**Better approach:** Store filters in the URL as query parameters.

```
/pets?status=AVAILABLE&categoryId=1&page=1&sort=price&dir=asc
```

Now users can bookmark and share filtered views, and the browser Back button works.

```jsx
// pages/PetsPage.jsx
import { useSearchParams } from 'react-router-dom'

export default function PetsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read current state from the URL
  const status     = searchParams.get('status')     || ''
  const categoryId = searchParams.get('categoryId') || ''
  const page       = parseInt(searchParams.get('page') || '0')
  const sort       = searchParams.get('sort') || 'id'

  const [pets, setPets] = useState(null)

  // Whenever the URL changes, fetch new data
  useEffect(() => {
    getPets({ status: status || undefined, categoryId: categoryId || undefined, page, sort })
      .then(setPets)
  }, [status, categoryId, page, sort])  // Re-run if any of these change

  function handleStatusChange(e) {
    // Update the URL — this triggers the effect above
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('status', e.target.value)
      next.set('page', '0')   // Always go back to page 1 when changing a filter
      return next
    })
  }

  return (
    <div>
      <select value={status} onChange={handleStatusChange}>
        <option value="">All statuses</option>
        <option value="AVAILABLE">Available</option>
        <option value="PENDING">Pending</option>
        <option value="ADOPTED">Adopted</option>
      </select>

      {/* Pets grid */}
      <div className="pets-grid">
        {pets?.content.map(pet => <PetCard key={pet.id} pet={pet} />)}
      </div>

      {/* Pagination */}
      {pets && <Pagination data={pets} searchParams={searchParams} setSearchParams={setSearchParams} />}
    </div>
  )
}
```

The key insight: **URL = state**. Instead of `setPage(2)`, you do
`setSearchParams(p => { p.set('page', '2'); return p })`.

---

### 4.6 Protecting Admin Pages

```jsx
// components/ProtectedRoute.jsx
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  // Still checking if the user is logged in — show a spinner, not a redirect
  // (Without this, you'd briefly flash the login redirect before the check completes)
  if (loading) return <div className="loading-spinner" />

  // Not logged in → send to login page
  if (!user) return <Navigate to="/login" replace />

  // Logged in but not an admin, on an admin-only page → send to home
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />

  // All checks passed → show the page
  return children
}
```

**`replace`** in `<Navigate replace />` replaces the current history entry instead
of adding to it. That way, pressing the browser Back button doesn't send the user
back to the page they were denied from.

---

### 4.7 Calling the API from React

All API calls are in one file. This means if a URL changes, you update it in one place.

```js
// services/api.js
import axios from 'axios'

const client = axios.create({
  baseURL: '/api',         // All calls go to /api/... on the same server
  withCredentials: true,   // Always send cookies (session + JWT cookies)
})

// Interceptor: runs after EVERY response before it reaches your component
// If ANY API call returns 401 (not logged in), fire an event to log out
client.interceptors.response.use(
  response => response,    // Success: pass through unchanged
  error => {
    if (error.response?.status === 401) {
      // Dispatch a browser event that AuthContext is listening for
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(error)  // Still propagate the error
  }
)

// Auth
export const loginUser    = (data) => client.post('/auth/login', data).then(r => r.data)
export const logoutUser   = ()     => client.post('/auth/logout')
export const getMe        = ()     => client.get('/auth/me').then(r => r.data)
export const getApiToken  = (data) => client.post('/auth/token', data).then(r => r.data)
export const deleteApiToken = ()   => client.delete('/auth/token')

// Pets — getPets({ status, categoryId, page, size, sort, dir })
export const getPets    = (params = {}) => client.get('/pets', { params }).then(r => r.data)
export const getPet     = (id)          => client.get(`/pets/${id}`).then(r => r.data)
export const searchPets = (name, extra) => client.get('/pets/search', { params: { name, ...extra } }).then(r => r.data)
export const createPet  = (data)        => client.post('/pets', data).then(r => r.data)
export const updatePet  = (id, data)    => client.put(`/pets/${id}`, data).then(r => r.data)
export const deletePet  = (id)          => client.delete(`/pets/${id}`)

// Categories
export const getCategories  = ()         => client.get('/categories').then(r => r.data)
export const createCategory = (data)     => client.post('/categories', data).then(r => r.data)
export const updateCategory = (id, data) => client.put(`/categories/${id}`, data).then(r => r.data)
export const deleteCategory = (id)       => client.delete(`/categories/${id}`)

// Users (admin only)
export const getUsers       = ()         => client.get('/users').then(r => r.data)
export const updateUserRole = (id, role) => client.patch(`/users/${id}/role`, { role }).then(r => r.data)
export const deleteUser     = (id)       => client.delete(`/users/${id}`)
```

**`.then(r => r.data)`:** Axios wraps every response in an object:
`{ data: {...}, status: 200, headers: {...} }`. Adding `.then(r => r.data)` means
your component receives the parsed JSON directly, not the Axios wrapper.

**Using an API function in a component:**

```jsx
useEffect(() => {
  getPets({ status: 'AVAILABLE', page: 0, size: 8 })
    .then(data => setPets(data))       // data is the JSON: { content: [...], totalPages: 3 }
    .catch(err => setError(err.message))
}, [])
```

---

### 4.8 Styles with SCSS

SCSS is an extension of CSS that adds variables, nesting, and imports.

```
styles/
├── main.scss        ← Only imports — no styles here
├── _variables.scss  ← Color palette, spacing sizes, font sizes
├── _mixins.scss     ← Reusable style "functions"
├── _base.scss       ← Global reset and container styles
├── _navbar.scss     ← Styles for the Navbar component
├── _pet-card.scss   ← Styles for the PetCard component
└── ...              ← One file per component/page
```

```scss
// _variables.scss
$color-primary: #4f46e5;    // Used throughout as the brand color
$color-success: #10b981;
$spacing-md: 1rem;
$border-radius: 8px;

// _pet-card.scss
.pet-card {
  border-radius: $border-radius;   // Reuse the variable
  padding: $spacing-md;

  &:hover {                        // & means "the parent selector" (.pet-card:hover)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .pet-card__name {                // BEM naming: block__element
    font-weight: 600;
    color: $color-primary;
  }
}
```

The underscore in `_variables.scss` tells SCSS "this is a partial — don't generate
a separate CSS file for it, only include it when imported."

`main.scss` imports everything in the right order:

```scss
@use 'variables';   // Must come first (others depend on it)
@use 'mixins';
@use 'base';        // Global styles come before component styles
@use 'navbar';
@use 'pet-card';
// ...
```

---

## 5. How Frontend and Backend Talk to Each Other

### Development: The Vite Proxy

During development you run two servers — React on port `5173` and Spring Boot on `8080`.
Browsers block cross-origin AJAX requests for security. The Vite proxy works around this:

```
Browser at :5173  →  sends /api/pets  →  Vite intercepts
                                          Vite forwards to http://localhost:8080/api/pets
                                          Vite returns the response to the browser
```

The browser thinks everything is on `:5173`. No cross-origin issue.

```js
// frontend/vite.config.js
export default {
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Forward /api/* to the backend
        changeOrigin: true,
      }
    }
  }
}
```

### Production: One Server, One Port

When you run `mvn package`, Maven:

1. Runs `npm run build` → creates `frontend/dist/`
2. Copies `frontend/dist/` → `src/main/resources/static/`
3. Packages everything into one JAR

Spring Boot automatically serves files from `static/` at `/`. So:

- `GET /` → serves `static/index.html` (React app)
- `GET /assets/index.js` → serves `static/assets/index.js`
- `GET /api/pets` → handled by `PetController`
- `GET /pets/3` → `SpaController` forwards to `static/index.html` (React Router takes over)

No proxy needed. One server, one port.

### CORS

CORS is configured on the backend to allow the Vite dev server to make requests
(including sending cookies) across origins:

```java
// config/SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);   // Required to allow cookies in cross-origin requests
    // ...
}
```

In production, frontend and backend are on the same domain, so CORS is not needed.

---

## 6. Authentication and Security

### 6.1 What is Authentication?

**Authentication** = proving who you are ("I am alice, here is my password").
**Authorization** = checking what you are allowed to do ("alice can view pets, but not delete them").

This app uses **two** authentication methods running in parallel:

| Method | Best for | How it works |
|--------|----------|-------------|
| Session | Browser / React UI | Server stores session; browser sends a cookie |
| JWT | Scripts / Mobile apps / Postman | Client stores the token; sends it in a header |

### 6.2 Session-Based Login (Browser)

```
1. User fills in username + password → POST /api/auth/login
2. Server verifies credentials
3. Server creates a session (stores it in memory)
4. Server responds with: Set-Cookie: JSESSIONID=abc123
5. Browser automatically stores the cookie
6. Every future request includes Cookie: JSESSIONID=abc123
7. Server looks up the session → knows who the user is
```

```java
// controller/AuthController.java
@PostMapping("/login")
public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest req,
                                          HttpServletRequest request) {
    // 1. Verify username + password (throws an exception if wrong)
    Authentication auth = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

    // 2. Tell Spring Security who is logged in for THIS request
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(auth);
    SecurityContextHolder.setContext(context);

    // 3. Save the SecurityContext in the HTTP session
    //    This is what creates the JSESSIONID cookie
    HttpSession session = request.getSession(true);
    session.setAttribute(
        HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

    User user = (User) auth.getPrincipal();
    return ResponseEntity.ok(UserResponse.from(user));  // Return user info (no password)
}
```

### 6.3 JWT Token Auth (API Clients)

JWT (JSON Web Token) is a self-contained token — it stores the user's identity
*inside* the token itself. No session lookup needed.

```
Structure:  header.payload.signature

header:    { "alg": "HS256", "typ": "JWT" }
payload:   { "sub": "admin", "role": "ROLE_ADMIN", "exp": 1735689600 }
signature: HMAC-SHA256(header + "." + payload, secretKey)
```

The server signs the token with a secret key. Anyone who tries to change the payload
would break the signature — so the server can detect tampering.

```
1. Client sends: POST /api/auth/token  { "username": "admin", "password": "admin123" }
2. Server verifies credentials, generates a signed JWT
3. Server responds: { "token": "eyJ...", "type": "Bearer" }
                    Set-Cookie: jwt_token=eyJ... (httpOnly, so JS can't read it)
4. Client sends:  Authorization: Bearer eyJ...  (on future requests)
                  OR the browser sends the cookie automatically
5. Server validates the token signature → reads username from token → no DB lookup needed
```

```java
// security/JwtService.java
@Service
public class JwtService {

    private final SecretKey key;     // 256-bit HMAC key loaded from config
    private final long expirationMs; // How long the token is valid (24 hours)

    public String generate(UserDetails user) {
        String role = user.getAuthorities().stream()
            .findFirst()
            .map(a -> a.getAuthority())
            .orElse("");

        return Jwts.builder()
            .subject(user.getUsername())       // "sub": who this token belongs to
            .claim("role", role)               // Extra data embedded in the token
            .issuedAt(new Date())              // "iat": when it was issued
            .expiration(new Date(System.currentTimeMillis() + expirationMs))  // "exp"
            .signWith(key)                     // Sign with the secret key
            .compact();                        // Build the token string "eyJ..."
    }

    public boolean isValid(String token) {
        try {
            // This verifies the signature AND checks that the token has not expired
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            return false;   // Expired, tampered with, or just garbage
        }
    }

    public String extractUsername(String token) {
        return Jwts.parser()
            .verifyWith(key).build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();   // The "sub" claim
    }
}
```

### 6.4 The JWT Filter

Spring Security processes every request through a **filter chain** before it
reaches a controller. `JwtAuthFilter` is inserted into that chain:

```
Request arrives
    │
    ▼
JwtAuthFilter       ← checks for JWT in header or cookie
    │                 if valid: sets "who is logged in" in Spring Security context
    │                 if missing/invalid: does nothing (session auth may still work)
    ▼
Spring's session filter  ← checks for JSESSIONID cookie
    │
    ▼
Spring's authorization checks  ← checks the route rules in SecurityConfig
    │
    ▼
Your Controller
```

```java
// security/JwtAuthFilter.java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    // OncePerRequestFilter: guaranteed to run exactly once per HTTP request

    private final JwtService jwtService;
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);

        // Only act if there is a valid token AND no one is already authenticated
        if (token != null
                && jwtService.isValid(token)
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String username = jwtService.extractUsername(token);
            UserDetails user = userService.loadUserByUsername(username);

            // Tell Spring Security "this request is authenticated as this user"
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        // ALWAYS continue down the filter chain, even if the token was invalid
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // Option 1: Authorization: Bearer eyJ...
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer "))
            return header.substring(7);   // Remove "Bearer " prefix

        // Option 2: jwt_token cookie (set automatically by the browser)
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt_token".equals(cookie.getName()))
                    return cookie.getValue();
            }
        }
        return null;
    }
}
```

### 6.5 Authorization — Who Can Do What?

The rules are defined in `SecurityConfig` and evaluated top-to-bottom:

```java
.authorizeHttpRequests(auth -> auth
    // ── Public (no login required) ─────────────────────────────────────────
    .requestMatchers("/actuator/health").permitAll()    // Monitoring health checks
    .requestMatchers("/h2-console/**").permitAll()      // Dev database console

    .requestMatchers(HttpMethod.POST,
        "/api/auth/login", "/api/auth/register", "/api/auth/token").permitAll()
    .requestMatchers(HttpMethod.DELETE, "/api/auth/token").permitAll()

    .requestMatchers(HttpMethod.GET,
        "/api/pets/**", "/api/categories/**").permitAll()    // Anyone can browse

    // ── Requires login ──────────────────────────────────────────────────────
    .requestMatchers("/api/auth/**").authenticated()    // GET /api/auth/me requires login

    // ── Requires ADMIN role ─────────────────────────────────────────────────
    .requestMatchers(HttpMethod.POST,
        "/api/pets/**", "/api/categories/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.PUT,
        "/api/pets/**", "/api/categories/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.DELETE,
        "/api/pets/**", "/api/categories/**").hasRole("ADMIN")
    .requestMatchers("/api/users/**").hasRole("ADMIN")

    // ── Everything else (SPA routes, static files) ──────────────────────────
    .anyRequest().permitAll()
)
```

`hasRole("ADMIN")` checks that the user has an authority called `ROLE_ADMIN`.
Spring automatically adds the `ROLE_` prefix when checking, so you only write `"ADMIN"`.

---

## 7. Configuration Files Explained

### `application.properties` (backend config)

```properties
# Which port the server listens on
server.port=8080

# Database connection
# ${DB_URL:jdbc:postgresql://...} means: use the DB_URL environment variable
# if it exists, otherwise use the default value after the colon.
# This is how Docker Compose passes the database location to the app.
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/petstore}
spring.datasource.username=${DB_USER:petstore}
spring.datasource.password=${DB_PASSWORD:petstore}

# "update" = create tables if they don't exist, add columns if they're new,
# but don't delete any existing data. Good for development.
spring.jpa.hibernate.ddl-auto=update

# JWT settings
app.jwt.secret=${JWT_SECRET:dGhpcy1pcy1hLTI1Ni1...}  # Secret key (override in production!)
app.jwt.expiration-ms=86400000                          # 24 hours in milliseconds
```

### `src/test/resources/application.properties` (test config)

```properties
# Tests use H2 (in-memory database) so they don't need a real PostgreSQL server
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop   # Fresh schema for every test run

# Must include JWT settings — tests load this file instead of the main one
app.jwt.secret=dGhpcy1pcy1hLTI1Ni1iaXQtc2VjcmV0LWtleS1mb3ItcGV0c3RvcmUtandk
app.jwt.expiration-ms=86400000
```

### `vite.config.js` (frontend build config)

```js
export default {
  plugins: [react()],    // Enable JSX support
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist'       // npm run build → puts files here → Maven copies to JAR
  }
}
```

---

## 8. Build and Docker

### How the Production Build Works

```
mvn package
  │
  ├─ Phase: generate-resources
  │    └─ npm install
  │    └─ npm run build  →  frontend/dist/
  │
  ├─ Phase: process-resources
  │    └─ Copy frontend/dist/* → target/classes/static/
  │
  └─ Phase: package
       └─ Compile Java, bundle everything → target/pet-store-1.0.0.jar
```

One command produces one file. `java -jar pet-store-1.0.0.jar` runs both the
React app and the Spring Boot server.

### The Dockerfile (Multi-Stage Build)

Instead of installing Node.js, Maven, and Java all in one image (which would be huge),
we use **multi-stage builds** — each stage does one job, and we only keep what we need:

```dockerfile
# ─── Stage 1: Build the React app ───────────────────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci                  # Install deps (exact versions from package-lock.json)
COPY frontend/ ./
RUN npm run build           # → frontend/dist/

# ─── Stage 2: Build the Spring Boot JAR ─────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /workspace
COPY pom.xml .
RUN mvn dependency:resolve -Dskip.frontend=true   # Cache Maven deps in a separate layer
COPY src ./src
# Copy the React build output from Stage 1 (Node.js is NOT in this stage)
COPY --from=frontend-build /app/dist ./frontend/dist
RUN mvn package -DskipTests -Dskip.frontend=true

# ─── Stage 3: Lean runtime image ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre   # JRE only (not JDK) — much smaller
RUN adduser --system spring   # Run as a non-root user (security best practice)
USER spring
COPY --from=backend-build /workspace/target/pet-store-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

The final image only contains the JRE and the JAR — not Node.js, Maven, or source code.
This makes it smaller (~200MB vs ~1GB) and safer.

### Docker Compose

```yaml
services:
  db:      # PostgreSQL
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: petstore
      POSTGRES_USER: petstore
      POSTGRES_PASSWORD: petstore
    healthcheck:
      test: pg_isready -U petstore  # Check if PostgreSQL is ready to accept connections

  app:     # The Spring Boot + React application
    build: .
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:postgresql://db:5432/petstore  # "db" resolves to the db container
      DB_USER: petstore
      DB_PASSWORD: petstore
    depends_on:
      db:
        condition: service_healthy  # Don't start app until PostgreSQL is ready

  prometheus:  # Collects metrics from /actuator/prometheus every 15 seconds
    image: prom/prometheus:v3.2.1
    ports:
      - "9090:9090"

  grafana:     # Visualizes Prometheus metrics as dashboards
    image: grafana/grafana:11.5.2
    ports:
      - "3000:3000"
```

`depends_on` with `service_healthy` prevents a common race condition: the app
starting before the database is ready, crashing immediately, and Docker marking
the container as failed.

---

## 9. Running the Project

### Option A: Development mode (fast iteration, hot reload)

You need: **Java 17**, **Maven**, **Node.js**, and **PostgreSQL** (or use H2).

```bash
# Terminal 1 — Start the backend
# With H2 (no PostgreSQL needed — great for learning):
JAVA_HOME=/path/to/java-17 mvn spring-boot:run -Dskip.frontend=true -Dspring.profiles.active=h2

# Terminal 2 — Start the frontend dev server
cd frontend
npm install      # Only needed the first time
npm run dev
# Open http://localhost:5173
```

Changes to Java files → restart the backend.
Changes to React files → browser updates instantly (hot module replacement).

### Option B: Full Docker stack (closest to production)

You need: **Docker** and **Docker Compose**.

```bash
docker compose up --build

# Then open:
# App:        http://localhost:8080
# Grafana:    http://localhost:3000   (login: admin / admin)
# Prometheus: http://localhost:9090
```

### Option C: Build and run the JAR

```bash
JAVA_HOME=/path/to/java-17 mvn clean package
java -jar target/pet-store-1.0.0.jar
# Open http://localhost:8080
```

### Default accounts (created by DataInitializer)

| Username   | Password      | Role     | Can do                          |
|------------|---------------|----------|---------------------------------|
| `admin`    | `admin123`    | ADMIN    | Everything — add, edit, delete  |
| `customer` | `customer123` | CUSTOMER | Browse and view pets only       |

### Test JWT auth from the command line

```bash
# 1. Get a token
curl -X POST http://localhost:8080/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# → { "token": "eyJhbGc...", "type": "Bearer" }

# 2. Use the token to access a protected endpoint
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer eyJhbGc..."
# → [ { "id": 1, "username": "admin", ... }, ... ]
```

---

## 11. Quick Reference

### Spring Boot annotations

| Annotation | What it does |
|---|---|
| `@SpringBootApplication` | Entry point; enables auto-configuration |
| `@Entity` | This class maps to a database table |
| `@Table(name = "...")` | Override the default table name |
| `@Id` + `@GeneratedValue` | Auto-increment primary key |
| `@Column(nullable = false)` | Make the column NOT NULL in the database |
| `@ManyToOne` | Foreign key relationship |
| `@Enumerated(EnumType.STRING)` | Store enum as text, not a number |
| `@RestController` | Handle HTTP requests, return JSON |
| `@RequestMapping("/api/pets")` | Base URL for all methods in this controller |
| `@GetMapping`, `@PostMapping` | Handle GET, POST requests |
| `@PathVariable` | Read `{id}` from the URL path |
| `@RequestParam` | Read `?key=value` from the URL |
| `@RequestBody` | Deserialize JSON body into a Java object |
| `@Valid` | Run Bean Validation on this parameter |
| `@Service` | Business logic bean |
| `@Component` | Generic Spring bean |
| `@RequiredArgsConstructor` | Lombok: constructor injection for all `final` fields |

### React hooks

| Hook | What it does |
|---|---|
| `useState(initial)` | Declare state; returns `[value, setter]` |
| `useEffect(fn, deps)` | Run code after render; re-run when `deps` change |
| `useParams()` | Read URL path variables (`:id`) |
| `useSearchParams()` | Read and update URL query params (`?key=value`) |
| `useNavigate()` | Navigate programmatically (`navigate('/pets')`) |
| `useContext(MyContext)` | Read from a Context |
| `useAuth()` | Custom hook — calls `useContext(AuthContext)` |

### HTTP methods and what they mean

| Method | Meaning | Example |
|---|---|---|
| `GET` | Read data | `GET /api/pets` — get all pets |
| `POST` | Create something new | `POST /api/pets` — add a pet |
| `PUT` | Replace an existing resource | `PUT /api/pets/1` — update pet #1 |
| `PATCH` | Partially update | `PATCH /api/users/1/role` — change one field |
| `DELETE` | Remove | `DELETE /api/pets/1` — delete pet #1 |

### The layered architecture at a glance

```
HTTP Request (from browser or curl)
        │
        ▼
┌───────────────┐
│  Controller   │  Reads HTTP params, calls service, returns HTTP response
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Service     │  Business rules, validation, orchestration
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Repository   │  Database queries only
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Database    │  PostgreSQL (prod) / H2 (dev/test)
└───────────────┘
```

---

## 10. Monitoring: Actuator, Prometheus, and Grafana

### 10.1 What is Monitoring and Why Does It Matter?

When an app runs in production, you can't just sit and watch the logs. You need to
know: Is the server healthy? Is it running out of memory? Are requests getting slow?
Are errors spiking?

**Monitoring** means continuously collecting numbers (called **metrics**) from your
running app and displaying them on graphs so you can spot problems before users do.

PawStore uses a three-layer monitoring stack that is the industry standard:

```
┌─────────────────────────────────────────────────────────────┐
│  Spring Boot app (port 8080)                                │
│  Spring Boot Actuator exposes metrics at /actuator/prometheus│
└──────────────────────────┬──────────────────────────────────┘
                           │  Prometheus scrapes this URL every 15 seconds
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Prometheus (port 9090)                                     │
│  Stores a time-series database of all the metrics           │
└──────────────────────────┬──────────────────────────────────┘
                           │  Grafana queries Prometheus
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Grafana (port 3000)                                        │
│  Displays the metrics as live charts and dashboards         │
└─────────────────────────────────────────────────────────────┘
```

Think of it like this:
- **Actuator** is a health monitor strapped to the app — it measures everything
- **Prometheus** is a data recorder that snapshots those measurements every 15 seconds
- **Grafana** is the screen on the wall that draws the charts

---

### 10.2 Spring Boot Actuator — Built-in Health and Metrics

Spring Boot Actuator is a dependency that automatically adds a set of built-in
HTTP endpoints to your app. You don't write any code — just add the dependency
and turn on the endpoints you want.

**The dependency is already in `pom.xml`:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<!-- Micrometer: formats metrics in Prometheus's text format -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**Configured in `application.properties`:**

```properties
# Which actuator endpoints to expose over HTTP
management.endpoints.web.exposure.include=prometheus,health,info

# Show full detail on the /actuator/health endpoint
management.endpoint.health.show-details=always

# Tag every metric with application="pawstore" so Grafana can filter by app name
management.metrics.tags.application=pawstore
```

**The endpoints this creates:**

| URL | What it returns |
|-----|----------------|
| `/actuator/health` | Is the app up? Is the database reachable? |
| `/actuator/info` | App version and build info (if configured) |
| `/actuator/prometheus` | All metrics in Prometheus text format |

Try it while the app is running:

```bash
# Check if the app and database are healthy
curl http://localhost:8080/actuator/health
```

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP", "details": { "database": "PostgreSQL" } },
    "diskSpace": { "status": "UP" },
    "ping": { "status": "UP" }
  }
}
```

```bash
# See the raw metrics Prometheus will collect
curl http://localhost:8080/actuator/prometheus
```

This returns hundreds of lines of text like:

```
# HELP http_server_requests_seconds Duration of HTTP server request handling
http_server_requests_seconds_count{application="pawstore",method="GET",status="200",uri="/api/pets"} 42.0
http_server_requests_seconds_sum{...} 1.234

# HELP jvm_memory_used_bytes The amount of used memory
jvm_memory_used_bytes{application="pawstore",area="heap",...} 8.5E7

# HELP hikaricp_connections_active Active connections in the HikariCP pool
hikaricp_connections_active{application="pawstore",...} 1.0
```

Each line is: `metric_name{labels} value`. Prometheus reads and stores these numbers
over time so you can see trends — for example, whether memory usage is slowly climbing.

**Which metrics does Actuator expose automatically?**

Micrometer (the library underneath Actuator) instruments the most important things
without any configuration:

| Category | What's measured |
|---|---|
| **HTTP requests** | Count, total duration, errors — per endpoint and status code |
| **JVM memory** | Heap used, heap max, non-heap — per memory pool |
| **JVM threads** | Live threads, daemon threads, peak |
| **Garbage collection** | Pause duration and frequency — per GC type |
| **Database pool** | Active, idle, and pending connections (HikariCP) |
| **CPU** | Process CPU usage percentage |
| **Disk** | Free disk space |

---

### 10.3 Prometheus — Collecting the Metrics

Prometheus is a time-series database. Its job is to **scrape** (fetch) the metrics
endpoint of your app at a regular interval and store every value with a timestamp.

**Its config lives in `docker/prometheus/prometheus.yml`:**

```yaml
global:
  scrape_interval: 15s      # Fetch metrics from every target every 15 seconds
  evaluation_interval: 15s  # Evaluate alert rules every 15 seconds

scrape_configs:
  - job_name: 'pawstore'
    metrics_path: '/actuator/prometheus'   # The URL to scrape
    static_configs:
      - targets: ['app:8080']   # 'app' is the Docker Compose service name
```

`app:8080` works because Docker Compose puts all services on the same internal network,
so containers can reach each other by service name. Prometheus calls
`http://app:8080/actuator/prometheus` every 15 seconds and stores everything it gets.

**Exploring Prometheus directly:**

With Docker Compose running, open `http://localhost:9090` in your browser.
You can type PromQL (Prometheus Query Language) expressions and get raw results.

Some useful queries to try:

```promql
# Total number of HTTP requests received by the app
http_server_requests_seconds_count{application="pawstore"}

# Request rate per second over the last minute (smoothed)
rate(http_server_requests_seconds_count{application="pawstore"}[1m])

# JVM heap currently in use (in bytes)
jvm_memory_used_bytes{application="pawstore", area="heap"}

# How many active database connections right now
hikaricp_connections_active{application="pawstore"}

# CPU usage as a percentage
process_cpu_usage{application="pawstore"} * 100
```

> **What is `rate(...[1m])`?** Prometheus counters only go up (e.g. total request
> count since startup). `rate()` converts a cumulative counter into a "per-second"
> rate over the given time window. This is more useful for graphs than raw totals.

---

### 10.4 Grafana — Visualising the Metrics

Grafana is a dashboarding tool. It queries Prometheus for data and draws charts.

**Open it at `http://localhost:3000`** (login: `admin` / `admin`) when Docker
Compose is running.

**How Grafana is configured:**

Grafana supports **provisioning** — loading its configuration from files instead of
clicking through the UI. This means the datasource and dashboards are already set up
the moment Docker Compose starts; you don't have to configure anything manually.

```
docker/grafana/
├── provisioning/
│   ├── datasources/
│   │   └── prometheus.yml    ← Tells Grafana where Prometheus is
│   └── dashboards/
│       └── dashboards.yml    ← Tells Grafana where to find dashboard JSON files
└── dashboards/
    └── pawstore.json         ← The actual pre-built dashboard definition
```

**`provisioning/datasources/prometheus.yml`** — connects Grafana to Prometheus:

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090   # 'prometheus' is the Docker Compose service name
    isDefault: true
```

**`provisioning/dashboards/dashboards.yml`** — tells Grafana to load JSON files:

```yaml
apiVersion: 1
providers:
  - name: PawStore
    type: file
    options:
      path: /var/lib/grafana/dashboards   # Folder inside the container
```

The `docker-compose.yml` mounts `./docker/grafana/dashboards` into that container
path, so `pawstore.json` is loaded automatically on startup.

---

### 10.5 The Pre-built PawStore Dashboard

The dashboard at `docker/grafana/dashboards/pawstore.json` contains eight panels,
each visualising a different aspect of the running app:

| Panel | What it shows | Why it matters |
|-------|--------------|----------------|
| **HTTP Request Rate** | Requests per second, split by endpoint and method | Spot traffic spikes and which endpoints are busiest |
| **HTTP Error Rate** | 5xx responses per second, split by endpoint | Detect server errors the moment they happen |
| **HTTP Response Time (P95)** | 95th-percentile latency in ms, per endpoint | 95% of users experience ≤ this response time; high values mean slowness |
| **CPU Usage** | Process CPU % | Sustained high CPU can mean a bug or under-provisioning |
| **JVM Heap Memory** | Used vs max heap in bytes | Gradual climb without drops = memory leak |
| **Database Connections** | Active / idle / pending HikariCP connections | Pending connections = the DB pool is exhausted (too much load) |
| **JVM Threads** | Live and daemon thread count | Unexpected growth = thread leak |
| **GC Pause Duration (P99)** | Garbage collection pause time in ms | Long GC pauses cause request latency spikes |

**What is P95 / P99 (percentile)?**

Averages can be misleading. If 99 requests take 10ms and 1 request takes 10 seconds,
the average is ~110ms — but clearly something is very wrong for that 1 user.

Percentiles tell a better story:
- **P95 = 200ms** means 95% of requests finished in under 200ms
- **P99 = 2000ms** means 99% of requests finished in under 2000ms
- The remaining 1% took longer — those are your slow outliers

**HikariCP** is the database connection pool Spring Boot uses by default. Instead of
opening a new database connection for every request (slow and expensive), it keeps a
pool of open connections ready to reuse. The metrics tell you:
- `active` — connections currently in use by a request
- `idle` — connections in the pool, waiting to be used
- `pending` — requests waiting because all connections are busy (bad — means the pool is too small or the DB is too slow)

---

### 10.6 How the Pieces Wire Together

Here is the full data flow from the app to your screen:

```
Every HTTP request to Spring Boot
        │
        ▼
Micrometer (inside the app)
  Records: method, URI, status code, duration
  Increments counters and histograms in memory
        │
        ▼  (every 15 seconds)
Prometheus scrapes GET /actuator/prometheus
  Reads the current counter/gauge/histogram values
  Stores them with a timestamp in its time-series DB
        │
        ▼  (when you open a dashboard)
Grafana sends a PromQL query to Prometheus
  e.g. rate(http_server_requests_seconds_count[1m])
  Prometheus computes the result over stored data
  Grafana draws it as a line chart
        │
        ▼
You see a live graph in your browser
```

**How `management.metrics.tags.application=pawstore` helps:**

Every metric Micrometer records gets an extra label: `application="pawstore"`.
This lets you filter in Grafana — useful if you later add more services and they
all report to the same Prometheus instance. Your PromQL queries can then use
`{application="pawstore"}` to look at only this app's metrics.

**Security note:** In this project, `/actuator/prometheus` and `/actuator/health`
are publicly accessible (no login required). This is fine for development and for
internal networks where Prometheus scrapes directly, but in a public-facing production
deployment you would want to restrict these endpoints to internal traffic only,
for example by putting them behind a firewall or requiring a Prometheus-specific
auth token.

---

*Happy coding! The best way to learn is to run the project, change something small,
and see what breaks. Start by adding a field to `Pet`, then trace it through the
controller, service, repository, and the React UI.*
