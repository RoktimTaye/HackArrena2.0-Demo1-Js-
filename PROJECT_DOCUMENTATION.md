# Hospital Management System (HMS) - Backend Documentation

## 1. Project Overview
This project is a robust, **Multi-Tenant Hospital Management System (HMS)** backend built with **Node.js**, **Express**, and **MongoDB**. It is designed to serve multiple hospitals (tenants) from a single deployment while ensuring strict data isolation. Each hospital gets its own dedicated database, while a master database handles tenant registration and routing.

## 2. Architecture: Multi-Tenancy
The core architectural pattern used is **Database-per-Tenant**.

*   **Master Database**: Stores global information, primarily the list of registered tenants (hospitals) and their configuration (domain, contact info, license).
*   **Tenant Databases**: Every time a new hospital registers, a separate MongoDB database is created (e.g., `hms_tenant_uuid`). All data related to that hospital (Users, Patients, Prescriptions, Appointments) resides **only** in that specific database.

### Request Flow
1.  **Tenant Identification**: The system identifies the tenant context from the request (usually via `tenantDomain` in login or `user` context in authenticated requests).
2.  **Database Switching**: The `tenantDbManager` dynamically switches the Mongoose connection to the correct tenant database based on the identified tenant.
3.  **Data Isolation**: Queries are executed against the tenant's specific database, preventing data leakage between hospitals.

## 3. Tech Stack
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Authentication**: JWT (JSON Web Tokens) with Access & Refresh tokens.
*   **Security**:
    *   `helmet`: HTTP header security.
    *   `cors`: Cross-Origin Resource Sharing.
    *   `express-rate-limit`: API rate limiting.
    *   `bcryptjs`: Password hashing.
*   **Logging**: `winston` (logger) & `morgan` (HTTP request logger).
*   **Validation**: `joi` (Input validation).
*   **Email**: `nodemailer` (Transactional emails).

## 4. Folder Structure
The project follows a modular structure within `backend/src`:

```
backend/src/
├── config/             # Configuration files (DB, Logger, Env)
│   ├── dbMaster.js     # Connection to Master DB
│   ├── tenantDbManager.js # Logic to manage/switch Tenant DBs
│   └── logger.js       # Winston logger setup
├── middleware/         # Express middlewares
│   ├── authMiddleware.js # JWT verification & Tenant context setup
│   ├── errorHandler.js   # Global error handling
│   └── validate.js       # Joi validation middleware
├── modules/            # Feature-based modules
│   ├── auth/           # Login, Logout, Refresh Token
│   ├── tenants/        # Hospital registration (Master DB)
│   ├── users/          # Staff management (Doctors, Nurses, etc.)
│   ├── patients/       # Patient records
│   ├── prescriptions/  # Medication & Prescriptions
│   ├── appointments/   # Scheduling
│   ├── lab/            # Lab requests & results
│   ├── vitals/         # Patient vitals tracking
│   └── security/       # Password reset/change
├── utils/              # Helper functions (Email, Response formatting)
└── app.js              # Express app entry point & route mounting
```

## 5. Setup & Installation

### Prerequisites
*   Node.js (v14+)
*   MongoDB (Local or Atlas)

### Installation Steps
1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd HACKARENA_2.0
    ```

2.  **Install Dependencies**:
    ```bash
    cd backend
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5000
    NODE_ENV=development
    
    # Database
    MASTER_DB_URI=mongodb://localhost:27017/hms_master
    
    # JWT Secrets
    JWT_SECRET=your_super_secret_access_key
    JWT_REFRESH_SECRET=your_super_secret_refresh_key
    JWT_EXPIRES_IN=15m
    JWT_REFRESH_EXPIRES_IN=7d
    
    # CORS
    CORS_ORIGIN=http://localhost:3000,http://localhost:5173
    
    # Email (SMTP)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=your_app_password
    ```

4.  **Run the Server**:
    ```bash
    # Development mode (with nodemon)
    npm run dev
    
    # Production start
    npm start
    ```

## 6. Key Modules Breakdown

### A. Tenant Management (`modules/tenants`)
*   **Role**: Registers new hospitals.
*   **Database**: Writes to **Master DB**.
*   **Key Endpoint**: `POST /api/tenants/register`
*   **Process**: Creates a tenant record -> Generates a verification token -> Sends email -> Verifies tenant.

### B. Authentication (`modules/auth`)
*   **Role**: Handles user login and session management.
*   **Process**:
    1.  User provides `tenantDomain`, `username`, `password`.
    2.  System looks up Tenant in Master DB to get the DB name.
    3.  System connects to Tenant DB to verify User credentials.
    4.  Issues **Access Token** (short-lived) and **Refresh Token** (long-lived).

### C. User Management (`modules/users`)
*   **Role**: Manages hospital staff (Doctors, Nurses, Admins).
*   **Database**: Tenant DB.
*   **RBAC**: Supports roles like `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`.

### D. Patient Management (`modules/patients`)
*   **Role**: Stores patient demographics and medical history.
*   **Database**: Tenant DB.
*   **Features**: Emergency contacts, OPD/IPD status.

## 7. API Documentation
For a detailed list of all API endpoints, request bodies, and responses, please refer to the **[API Documentation](backend/api.md)** file located in `backend/api.md`.

**Quick Reference:**
*   **Health**: `GET /api/health`
*   **Register Hospital**: `POST /api/tenants/register`
*   **Login**: `POST /api/auth/login`
*   **Get Patients**: `GET /api/patients` (Requires Auth)

## 8. Database Schema Design

### Master Database (`hms_master`)
*   **Collection: `tenants`**
    *   `name`: String
    *   `domain`: String (Unique)
    *   `dbName`: String (e.g., `hms_tenant_uuid`)
    *   `status`: Enum (ACTIVE, PENDING)

### Tenant Database (`hms_tenant_{id}`)
*   **Collection: `users`** (Staff)
*   **Collection: `patients`**
*   **Collection: `prescriptions`**
*   **Collection: `appointments`**
*   **Collection: `vitals`**

## 9. How to Contribute / Extend
1.  **Create a Module**: Create a new folder in `src/modules/` (e.g., `inventory`).
2.  **Define Model**: Create `inventory.model.js` (Mongoose schema).
3.  **Create Controller**: Implement logic in `inventory.controller.js`.
4.  **Define Routes**: Map endpoints in `inventory.routes.js`.
5.  **Register Route**: Import and use the route in `app.js`.
