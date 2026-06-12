# 🛡️ SafeTrade Backend Services

> The backend infrastructure for SafeTrade, a peer-to-peer campus trading and escrow application. Built using a microservices architecture to ensure secure, trustless physical handoffs through dynamic OTPs and automated state management.

---

## 🏗️ Technology Stack

* **Framework:** Spring Boot (Java/Kotlin)
* **Database:** PostgreSQL
* **Communication:** REST APIs (via API Gateway)
* **Authentication:** JWT-based authentication (Simplified)
* **Task Scheduling:** Spring Boot `@Scheduled`

---

## 🧩 Microservices Architecture

To separate concerns and maintain scalability, the backend is split into the following core components:

### 1. API Gateway
* Acts as the single entry point for the Expo mobile app.
* Forwards requests to the appropriate microservice.
* Centralizes authentication, routing, and logging.

### 2. User Service
* Manages user profiles, registration, and login.
* Generates and validates JWT tokens.
* Tracks rider verification statuses.

### 3. Trade Service
* Handles the creation of trades and listing of items.
* Matches buyers and sellers.
* Writes initial trade records to the database.

### 4. Escrow Service (Core Logic)
* Tracks the exact state of each transaction.
* Generates dynamic OTP codes (Three-Way Handshake) for physical handoffs.
* Enforces delivery and collection timers.
* Simulates the holding and releasing of funds.

### 5. Notification Service
* Mock service for the prototype.
* Logs messages to the console when transaction statuses change (e.g., "Payment released to seller").

---

## 🗄️ Database Schema

All services read and write to a centralized PostgreSQL database. 

| Table | Columns |
| :--- | :--- |
| **`users`** | `id`, `name`, `email`, `password_hash`, `role` |
| **`trades`** | `id`, `item_name`, `price`, `buyer_id`, `seller_id` |
| **`escrow_states`** | `trade_id`, `status`, `dispatch_code`, `dropoff_code`, `release_code`, `timer_deadline`, `created_at`, `updated_at` |

---

## 🔄 Escrow State Machine

The Escrow Service manages the lifecycle of a trade through the following strictly enforced states:

| State | Trigger / Action Required |
| :--- | :--- |
| **`PENDING`** | Trade is successfully created by the buyer. |
| **`FUNDED`** | Buyer deposits funds (Simulated). |
| **`PHOTO_VERIFIED`** | Seller submits a live photo. Dispatch code (CODE #1) generated. |
| **`IN_TRANSIT`** | Rider inputs CODE #1. Liability transfers to rider. **24-hour timer begins.** |
| **`AT_POST`** | Rider inputs CODE #2 at Campus Post. Liability clears. **72-hour timer begins.** |
| **`RELEASED`** | Post operator inputs CODE #3 (Buyer confirmation). |
| **`CLOSED`** | Transaction complete. Funds released to seller. |

---

## ⏱️ Automated Timer Escalation Logic

The backend utilizes Spring Boot `@Scheduled` tasks to periodically check the `timer_deadline` on active trades:

* **24-Hour Rider Limit:** If a rider fails to deliver an `IN_TRANSIT` item within 24 hours, the trade is flagged, funds are frozen, and parties are notified.
* **72-Hour Buyer Limit:** If a buyer fails to collect an `AT_POST` item within 72 hours, the trade is flagged, funds are frozen, and parties are notified.

---

## 📋 Backend Development Tasks

- [ ] **Setup & Config:** Initialize Spring Boot application, configure PostgreSQL connection, and set up API Gateway routing.
- [ ] **Database Setup:** Create tables (`users`, `trades`, `escrow_states`) using JPA/Hibernate or SQL migration scripts.
- [ ] **User Service:** Implement user registration, login endpoints, and JWT generation/validation.
- [ ] **Trade Service:** Implement `POST /trades` endpoint to create a trade and trigger the Escrow service to create a `PENDING` record.
- [ ] **Escrow Service - Funding:** Implement `POST /escrow/fund/{trade_id}` to simulate funding (`FUNDED`).
- [ ] **Escrow Service - OTP Generation:** Build the logic to generate secure, dynamic OTP codes for dispatch, dropoff, and release.
- [ ] **Escrow Service - Handshake Endpoints:** - [ ] `POST /escrow/transit/{trade_id}` (Verifies CODE #1)
  - [ ] `POST /escrow/dropoff/{trade_id}` (Verifies CODE #2)
  - [ ] `POST /escrow/release/{trade_id}` (Verifies CODE #3)
- [ ] **Scheduling Tasks:** Implement `@Scheduled` cron jobs to sweep the database for expired 24-hour and 72-hour deadlines.
- [ ] **Notification Mocking:** Set up a basic service to log state changes locally for debugging.
