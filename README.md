## 🍽️ Restaurant Management System

A full-stack Restaurant Management System built with **Node.js**, **Express**, **MySQL**, and **React**. This system allows restaurant staff and admins to manage tables, menus, orders, and view reports in real time.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Role Based Access](#role-based-access)
- [Screenshots](#screenshots)

---

## ✨ Features

### Admin
- 📊 Dashboard with live stats (orders, revenue, table status)
- 🍴 Full menu management (add, edit, delete items)
- 🪑 Table management (add, delete, update status)
- 📋 Order management (create, update status, delete)
- 📈 Reports (revenue by date range, top selling items)
- 🗂️ Category management

### Staff
- 📋 View active orders dashboard
- 🪑 View table availability
- 🛒 Create new orders
- 🔄 Update order status (pending → preparing → served → paid)
- 🍴 View full menu

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MySQL | Database |
| mysql2 | MySQL driver |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| dotenv | Environment variables |
| cors | Cross-origin requests |
| nodemon | Development server |

### Frontend
| Technology | Purpose |
|---|---|
| React | UI framework |
| React Router DOM | Page navigation |
| Axios | API calls |

---

## 📁 Project Structure

```
restaurant-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authcontrollers.js     # Register & Login
│   │   ├── categoryController.js  # Category CRUD
│   │   ├── menuController.js      # Menu item CRUD
│   │   ├── tableController.js     # Table management
│   │   ├── orderController.js     # Order management
│   │   └── reportController.js    # Reports & dashboard
│   ├── middleware/
│   │   └── auth.js                # JWT verification & role check
│   ├── routes/
│   │   ├── authroutes.js
│   │   ├── categoryRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── tableRoutes.js
│   │   ├── orderRoutes.js
│   │   └── reportRoutes.js
│   ├── app.js                     # Express app setup
│   ├── server.js                  # Server entry point
│   ├── .env                       # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── dashboard.jsx
    │   │   ├── menu.jsx
    │   │   ├── tables.jsx
    │   │   ├── orders.jsx
    │   │   └── report.jsx
    │   ├── services/
    │   │   └── api.js             # All API call functions
    │   ├── App.js                 # Routes & protected routes
    │   └── App.css                # Global styles
    └── package.json
```

---

## 🗄️ Database Schema

```sql
restaurant_db
├── users              # Staff and admin accounts
├── categories         # Menu categories (Starters, Main Course, etc.)
├── menu_items         # Menu items with price and availability
├── restaurant_tables  # Restaurant tables with status
├── orders             # Orders linked to tables and staff
└── order_items        # Individual items within each order
```

### Relationships
```
users ──────────────── orders (one user → many orders)
restaurant_tables ───── orders (one table → many orders)
orders ──────────────── order_items (one order → many items)
menu_items ──────────── order_items (one item → many order_items)
categories ──────────── menu_items (one category → many items)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/ThivyaVenkatachalam/restaurant-management-system.git
cd restaurant-management-system
```

### 2. Setup the database

Open MySQL Workbench and run:

```sql
CREATE DATABASE restaurant_db;
USE restaurant_db;

CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  category_id  INT NOT NULL,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE restaurant_tables (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  number   INT UNIQUE NOT NULL,
  capacity INT NOT NULL,
  status   ENUM('available', 'occupied', 'reserved') DEFAULT 'available'
);

CREATE TABLE orders (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  table_id   INT NOT NULL,
  user_id    INT NOT NULL,
  status     ENUM('pending', 'preparing', 'served', 'paid') DEFAULT 'pending',
  total      DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
  FOREIGN KEY (user_id)  REFERENCES users(id)
);

CREATE TABLE order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  price        DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);
```

### 3. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=restaurant_db
JWT_SECRET=your_secret_key
PORT=8000
```

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:8000`

### 4. Setup the frontend

```bash
cd ../frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |

### Categories
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/categories` | Get all categories | Staff + Admin |
| POST | `/api/categories` | Create category | Admin only |
| DELETE | `/api/categories/:id` | Delete category | Admin only |

### Menu
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/menu` | Get all menu items | Staff + Admin |
| GET | `/api/menu/category/:id` | Get items by category | Staff + Admin |
| POST | `/api/menu` | Create menu item | Admin only |
| PUT | `/api/menu/:id` | Update menu item | Admin only |
| DELETE | `/api/menu/:id` | Delete menu item | Admin only |

### Tables
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/tables` | Get all tables | Staff + Admin |
| GET | `/api/tables/available` | Get available tables | Staff + Admin |
| POST | `/api/tables` | Create table | Admin only |
| PUT | `/api/tables/:id/status` | Update table status | Staff + Admin |
| DELETE | `/api/tables/:id` | Delete table | Admin only |

### Orders
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/orders` | Get all orders | Staff + Admin |
| GET | `/api/orders/:id` | Get single order with items | Staff + Admin |
| POST | `/api/orders` | Create order | Staff + Admin |
| PUT | `/api/orders/:id/status` | Update order status | Staff + Admin |
| DELETE | `/api/orders/:id` | Delete order | Admin only |

### Reports
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/reports/dashboard` | Get dashboard stats | Admin only |
| GET | `/api/reports/revenue?from=&to=` | Revenue by date range | Admin only |
| GET | `/api/reports/top-items` | Top selling items | Admin only |

---

## 👥 Role Based Access

### Admin
- Full access to everything
- Can manage menu, tables, categories
- Can view reports and revenue
- Can delete orders

### Staff
- Can create and manage orders
- Can update order and table status
- Can view menu and tables
- Cannot access reports or manage menu/tables

---

## 🔄 Order Status Flow

```
pending → preparing → served → paid
```

When an order is created → table status changes to **occupied**

When an order is marked **paid** → table status changes back to **available**

---

## 🔐 Authentication

This project uses **JWT (JSON Web Token)** authentication.

1. Register/Login → receive a token
2. Include token in every request header:
```
Authorization: Bearer <your_token>
```
3. Token expires in **7 days**

---