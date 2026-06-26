Absolutely. Below is a **complete definition of backend methods** (REST API endpoints) for each Spring Boot microservice in SafeTrade. I've also included **implementation tips** for each method to help your team get started.

---

## 🧱 Microservice Overview

| Service                         | Base Path     | Responsibility                                |
| ------------------------------- | ------------- | --------------------------------------------- |
| **User Service**                | `/api/users`  | Registration, login, profile, JWT             |
| **Trade Service**               | `/api/trades` | Create, view, list trades                     |
| **Escrow Service**              | `/api/escrow` | State machine: fund, deliver, release, refund |
| **Notification Service** (mock) | `/api/notify` | Log events (email/SMS mock)                   |

> **API Gateway** routes external requests:  
> `/users/*` → User Service  
> `/trades/*` → Trade Service  
> `/escrow/*` → Escrow Service  
> `/notify/*` → Notification Service

---

## 1. User Service – Methods

### `POST /api/users/register`

**Description:** Create a new user account.  
**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@campus.edu",
  "password": "secret123"
}
```

**Response:** `201 Created`

```json
{ "userId": 1, "name": "John Doe", "email": "john@campus.edu" }
```

**Tips:**

- Hash password using `BCryptPasswordEncoder`.
- Check email uniqueness before insert.
- Return JWT token immediately (or after login).

---

### `POST /api/users/login`

**Description:** Authenticate and receive JWT.  
**Request Body:**

```json
{ "email": "john@campus.edu", "password": "secret123" }
```

**Response:** `200 OK`

```json
{ "token": "eyJhbGciOiJIUzI1NiIs...", "userId": 1, "name": "John Doe" }
```

**Tips:**

- Validate credentials against DB.
- Generate JWT with `jjwt` or `Nimbus JOSE + JWT`.
- Set expiration (e.g., 24 hours).

---

### `GET /api/users/{userId}`

**Description:** Get public profile.  
**Headers:** `Authorization: Bearer <JWT>`  
**Response:** `200 OK`

```json
{ "userId": 1, "name": "John Doe", "email": "john@campus.edu" }
```

**Tips:**

- Verify that the requesting user is the same as `userId` or admin (optional).

---

## 2. Trade Service – Methods

### `POST /api/trades`

**Description:** Create a new trade listing (buyer creates).  
**Headers:** `Authorization: Bearer <JWT>`  
**Request Body:**

```json
{
  "title": "Calculus Textbook",
  "description": "Like new, no highlights",
  "price": 25.0,
  "sellerId": 2
}
```

**Response:** `201 Created`

```json
{ "tradeId": 101, "buyerId": 1, "sellerId": 2, "status": "PENDING" }
```

**Tips:**

- Extract `buyerId` from JWT (the creator is the buyer).
- Insert into `trades` table with initial status `PENDING`.
- After insert, call Escrow Service `POST /api/escrow/init/{tradeId}`.

---

### `GET /api/trades/{tradeId}`

**Description:** Get trade details.  
**Headers:** `Authorization: Bearer <JWT>`  
**Response:** `200 OK`

```json
{
  "tradeId": 101,
  "title": "Calculus Textbook",
  "price": 25.0,
  "buyerId": 1,
  "sellerId": 2,
  "status": "FUNDED"
}
```

**Tips:**

- Join with `escrow_states` table to get current escrow status.

---

### `GET /api/trades?role=buyer` or `?role=seller`

**Description:** List all trades for the authenticated user.  
**Headers:** `Authorization: Bearer <JWT>`  
**Response:** `200 OK` array of trade summaries.  
**Tips:**

- Use query param to filter: `GET /trades?role=buyer` returns trades where `buyerId = userId`.
- Paginate with `?page=0&size=10`.

---

## 3. Escrow Service – Methods (Core)

### `POST /api/escrow/init/{tradeId}`

**Description:** Create escrow record when trade is created.  
**Caller:** Trade Service (internal, not exposed via Gateway).  
**Request Body (optional):** none  
**Response:** `201 Created`

```json
{ "escrowId": 1001, "tradeId": 101, "status": "PENDING" }
```

**Tips:**

- Insert into `escrow_states` with `status = 'PENDING'`.
- Generate timestamps (`created_at`, `updated_at`).

---

### `POST /api/escrow/fund/{tradeId}`

**Description:** Buyer simulates depositing funds.  
**Headers:** `Authorization: Bearer <JWT>` (must be buyer)  
**Response:** `200 OK`

```json
{ "tradeId": 101, "status": "FUNDED" }
```

**Tips:**

- Verify JWT user is the buyer of that trade.
- Update `escrow_states.status = 'FUNDED'`.
- Call Notification Service `POST /api/notify` to tell seller.

---

### `PATCH /api/escrow/deliver/{tradeId}`

**Description:** Seller marks item as delivered.  
**Headers:** `Authorization: Bearer <JWT>` (must be seller)  
**Response:** `200 OK`

```json
{ "tradeId": 101, "status": "DELIVERED" }
```

**Tips:**

- Ensure current status is `FUNDED` (cannot deliver before funding).
- Update status to `DELIVERED`.
- Notify buyer.

---

### `POST /api/escrow/release/{tradeId}`

**Description:** Buyer releases payment to seller.  
**Headers:** `Authorization: Bearer <JWT>` (must be buyer)  
**Response:** `200 OK`

```json
{ "tradeId": 101, "status": "RELEASED" }
```

**Tips:**

- Ensure current status is `DELIVERED`.
- Update to `RELEASED`.
- Notify seller that funds are released (simulated).

---

### `POST /api/escrow/refund/{tradeId}` (optional)

**Description:** Cancel trade and refund buyer.  
**Headers:** `Authorization: Bearer <JWT>` (buyer or seller)  
**Response:** `200 OK`

```json
{ "tradeId": 101, "status": "REFUNDED" }
```

**Tips:**

- Only allowed if status is `PENDING` or `FUNDED` (not after delivery).
- Update status to `REFUNDED`.

---

### `GET /api/escrow/status/{tradeId}`

**Description:** Get current escrow status.  
**Headers:** `Authorization: Bearer <JWT>`  
**Response:** `200 OK`

```json
{ "tradeId": 101, "status": "FUNDED", "updatedAt": "2025-03-30T10:00:00Z" }
```

**Tips:**

- Simple read from `escrow_states` table.

---

## 4. Notification Service (Mock) – Methods

### `POST /api/notify`

**Description:** Send a notification (email, SMS, or in‑app).  
**Caller:** Escrow Service (internal)  
**Request Body:**

```json
{
  "userId": 2,
  "type": "ESCROW_FUNDED",
  "message": "Buyer has funded the escrow for trade #101"
}
```

**Response:** `200 OK` (always success in mock)  
**Tips:**

- In prototype, just log to console: `System.out.println("NOTIFY: " + message);`
- For future: integrate with Firebase Cloud Messaging or email API.

---

## 🧠 Implementation Tips for Spring Boot

### General

- Use **Spring Boot 3.x** with Java 17 or Kotlin.
- Each microservice is a separate Spring Boot application (different ports: 8081, 8082, 8083, 8084).
- Use **Spring Data JPA** for PostgreSQL access.
- Define entity classes: `User`, `Trade`, `EscrowState`.

### Service-to‑Service Communication

- **Option A (simple):** Use `RestTemplate` or `WebClient` inside services (e.g., Trade Service calls Escrow Service).
- **Option B (scalable):** Use **OpenFeign** – declarative REST client.
- **Option C (future):** Add service discovery with Eureka + load balancing.

### API Gateway (Spring Cloud Gateway)

- Add dependency: `spring-cloud-starter-gateway`.
- Configure routes in `application.yml`:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: http://localhost:8081
          predicates: Path=/api/users/**
        - id: trade-service
          uri: http://localhost:8082
          predicates: Path=/api/trades/**
        - id: escrow-service
          uri: http://localhost:8083
          predicates: Path=/api/escrow/**
```

### JWT Handling

- Create a **shared library** or duplicate filter in Gateway and each service.
- Filter extracts token, validates signature, sets `X-User-Id` header.
- Services use that header to identify caller.

### Database Tips

- Use **Flyway** or **Liquibase** for schema versioning.
- `escrow_states` table should have a foreign key to `trades.id`.
- Index `trade_id` and `status` for fast lookups.

### Error Handling

- Use `@ControllerAdvice` to return standard error JSON:

```json
{ "error": "Invalid status transition", "timestamp": "..." }
```

- HTTP status codes:
  - `400` Bad request (invalid state transition)
  - `401` Unauthorized (missing/invalid JWT)
  - `403` Forbidden (user not buyer/seller)
  - `404` Trade/escrow not found

---

## ✅ Summary Table of All Endpoints

| Service | Method | Path                 | Auth Required | Called By      |
| ------- | ------ | -------------------- | ------------- | -------------- |
| User    | POST   | `/register`          | No            | Expo app       |
| User    | POST   | `/login`             | No            | Expo app       |
| User    | GET    | `/{userId}`          | Yes           | Expo app       |
| Trade   | POST   | `/trades`            | Yes           | Expo app       |
| Trade   | GET    | `/trades/{tradeId}`  | Yes           | Expo app       |
| Trade   | GET    | `/trades`            | Yes           | Expo app       |
| Escrow  | POST   | `/init/{tradeId}`    | Internal      | Trade Service  |
| Escrow  | POST   | `/fund/{tradeId}`    | Yes (buyer)   | Expo app       |
| Escrow  | PATCH  | `/deliver/{tradeId}` | Yes (seller)  | Expo app       |
| Escrow  | POST   | `/release/{tradeId}` | Yes (buyer)   | Expo app       |
| Escrow  | POST   | `/refund/{tradeId}`  | Yes           | Expo app       |
| Escrow  | GET    | `/status/{tradeId}`  | Yes           | Expo app       |
| Notify  | POST   | `/notify`            | Internal      | Escrow Service |

---

Would you like me to provide **sample Spring Boot code** for one of these methods (e.g., the escrow state transition with validation)?
