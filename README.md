# 🛡️ SafeTrade Backend Services

> The backend infrastructure for SafeTrade, a peer-to-peer campus trading and escrow application.

---

## 🚀 Recent Changes


## 🔗 API Endpoints

### 👤 Users (`/api/v2/users`, `/api/users`, `/api/auth`)
- **POST** `/register` - Register a new user
- **POST** `/login` - User login
- **GET** `/{id}` or `/get/id/{id}` - Get user by ID
- **GET** `/get/username/{username}` - Get user by username
- **GET** `/all` - Get all users
- **POST** `/push-token` - Update push notification token
- **POST** `/topup` - Top up user balance

### 📦 Trades (`/api/v2/trades`, `/api/trades`)
- **GET** `/` - Get all trades
- **GET** `/{id}` - Get trade by ID
- **POST** `/` - Create a new trade
- **POST** `/{id}/deposit` - Deposit funds for a trade
- **POST** `/{id}/seller-upload` - Seller uploads item photo
- **POST** `/{id}/rider-pickup` - Rider picks up the item
- **POST** `/{id}/post-dropoff` - Rider drops off the item at post
- **POST** `/{id}/buyer-collect` - Buyer collects the item

### 🔐 Escrow (`/api/escrow`)
- **POST** `/init/{tradeId}` - Initialize escrow for a trade
- **POST** `/fund/{tradeId}` - Fund escrow
- **PATCH** `/deliver/{tradeId}` - Update delivery status
- **POST** `/release/{tradeId}` - Release funds to seller
- **POST** `/refund/{tradeId}` - Refund buyer
- **GET** `/status/{tradeId}` - Get escrow status

### 🔔 Notifications (`/api/notify`)
- **POST** `/` - Send a notification

---

## 🏗️ Technology Stack

* **Framework:** Spring Boot (Java)
* **Database:** PostgreSQL
* **Communication:** REST APIs
* **Authentication:** JWT-based authentication
* **Task Scheduling:** Spring Boot `@Scheduled`
