# WeGrow Skill Campus ERP & Admin Portal (v2.0 Modern Stack)

Enterprise ERP & Learning Management System migrated from legacy PHP/MySQL to **React 18 + Vite** (Frontend), **FastAPI + SQLAlchemy 2.0** (Backend), and **PostgreSQL 14+** (Database).

---

## 1. System Architecture

```text
                    WEGROW ERP
                        |
              ---------------------
              |                   |
          FRONTEND             BACKEND
              |                   |
        React 18 (Vite)        Python 3.10+
              |                FastAPI
          React Router            |
              |                Pydantic v2
            Axios                 |
              |                SQLAlchemy 2.0
              ------- REST API ---|
                                  |
                              PostgreSQL 14+
                                  |
                               Alembic
```

---

## 2. Directory Structure

```text
react-admin-portal/
├── frontend/                     # React 18 SPA (Vite, Tailwind, JetBrains Mono & Plus Jakarta Sans)
│   ├── public/                   # Favicon, logo, and static assets
│   ├── src/
│   │   ├── assets/               # Branding assets (wegrow-logo.png)
│   │   ├── components/           # Common components (Header, Sidebar, DataTable, Modal)
│   │   ├── context/              # AuthContext (JWT state management)
│   │   ├── layouts/              # MainLayout, AuthLayout
│   │   ├── pages/                # 18+ Modular pages (Dashboard, Users, Staff, Enrollments, Payments, etc.)
│   │   ├── routes/               # AppRoutes & ProtectedRoute
│   │   ├── services/             # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Unified institutional theme styles
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # High-performance FastAPI backend
│   ├── app/
│   │   ├── core/                 # Config & security (JWT, Bcrypt)
│   │   ├── database/             # SQLAlchemy session & Base
│   │   ├── dependencies/         # OAuth2 auth dependencies
│   │   ├── models/               # SQLAlchemy 2.0 models for all 43 tables
│   │   ├── schemas/              # Pydantic v2 schemas
│   │   ├── routers/              # Modular REST routers (auth, dashboard, enrollments, payments, etc.)
│   │   └── main.py               # Application entry point with Swagger & CORS
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   ├── schema/
│   │   └── db.sql                # Complete PostgreSQL DDL (also in root db.txt)
│   └── migration/
│       └── migrate_mysql_to_postgres.py  # Automated MySQL -> PostgreSQL data ETL tool
│
├── migration_plan.md             # Complete architectural mapping & functional comparison
├── migration_checklist.md        # Comprehensive module delivery checklist
└── README.md
```

---

## 3. Getting Started

### Backend Setup (FastAPI)

1. **Navigate to backend directory**:
   ```bash
   cd react-admin-portal/backend
   ```

2. **Create Python virtual environment & activate**:
   ```bash
   python -m venv venv
   # Windows:
   .env\Scriptsctivate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set your PostgreSQL credentials:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wegrow_erp_db
   SECRET_KEY=your_secret_key_here
   ```

5. **Start FastAPI Development Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Interactive API docs will be live at:
   - **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Database Setup & Migration (PostgreSQL)

When you are ready to install and start PostgreSQL:

1. **Create the database in PostgreSQL**:
   ```sql
   CREATE DATABASE wegrow_erp_db;
   ```

2. **Execute the schema creation script**:
   - Run the full PostgreSQL DDL located at [`../db.txt`](../db.txt) or [`database/schema/db.sql`](database/schema/db.sql) using pgAdmin or psql:
   ```bash
   psql -U postgres -d wegrow_erp_db -f database/schema/db.sql
   ```

3. **Migrate data from MySQL / MariaDB**:
   Ensure XAMPP/MySQL is running, then execute the migration tool:
   ```bash
   python database/migration/migrate_mysql_to_postgres.py
   ```

---

### Frontend Setup (React + Vite)

1. **Navigate to frontend directory**:
   ```bash
   cd react-admin-portal/frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at: [http://localhost:5173](http://localhost:5173)

4. **Default Administrator Credentials**:
   - **Username**: `admin`
   - **Password**: `admin123`
