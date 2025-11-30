# HMS Backend API Documentation

Base URL: `http://localhost:5000`

## 1. Health Checks

### Check Server Status
- **URL**: `/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "ok",
    "message": "Backend is running"
  }
  ```

### Liveness Probe
- **URL**: `/api/health/live`
- **Method**: `GET`
- **Response**:
  ```json
  { "status": "live" }
  ```

### Readiness Probe
- **URL**: `/api/health/ready`
- **Method**: `GET`
- **Response**:
  ```json
  { "status": "ready" }
  ```

---

## 2. Tenants (Hospital Registration)

### Register a New Hospital
- **URL**: `/api/tenants/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "City General Hospital",
    "address": "123 Medical Drive, NY",
    "contactEmail": "admin@citygeneral.com",
    "contactPhone": "+15551234567",
    "licenseNumber": "LIC-2024-001",
    "domain": "citygeneral"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Tenant registered successfully. Please verify your email.",
    "data": {
      "tenantId": "uuid-string",
      "domain": "citygeneral",
      "verificationToken": "token-string"
    }
  }
  ```

### Verify Hospital (Email Verification)
- **URL**: `/api/tenants/verify?token=YOUR_VERIFICATION_TOKEN`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Tenant verified successfully"
  }
  ```

---

## 3. Authentication

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "tenantDomain": "citygeneral",
    "username": "admin",
    "password": "AdminPassword123!"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "user": {
        "id": "user-id",
        "username": "admin",
        "roles": ["HOSPITAL_ADMIN"],
        "permissions": ["USER_CREATE", "USER_READ", ...]
      }
    }
  }
  ```

### Refresh Token
- **URL**: `/api/auth/refresh`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Body**: `{}`

---

## 4. Users (Staff Management)

**Headers Required**: `Authorization: Bearer <ACCESS_TOKEN>`

### Create User (Staff)
- **URL**: `/api/users`
- **Method**: `POST`
- **Roles**: `HOSPITAL_ADMIN`, `SUPER_ADMIN`
- **Body**:
  ```json
  {
    "username": "dr.smith",
    "email": "smith@citygeneral.com",
    "firstName": "John",
    "lastName": "Smith",
    "password": "Password123!",
    "roles": ["DOCTOR"],
    "department": "CARDIOLOGY",
    "attributes": {
      "specialization": "Heart Surgery"
    }
  }
  ```

### List Users
- **URL**: `/api/users?page=1&limit=10&role=DOCTOR`
- **Method**: `GET`
- **Roles**: `HOSPITAL_ADMIN`, `SUPER_ADMIN`

### Get Single User
- **URL**: `/api/users/:userId`
- **Method**: `GET`

### Update User
- **URL**: `/api/users/:userId`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "firstName": "Johnny",
    "department": "NEUROLOGY"
  }
  ```

### Update User Status
- **URL**: `/api/users/:userId/status`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```

---

## 5. Patients

**Headers Required**: `Authorization: Bearer <ACCESS_TOKEN>`

### Create Patient
- **URL**: `/api/patients`
- **Method**: `POST`
- **Roles**: `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`
- **Body**:
  ```json
  {
    "firstName": "Alice",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "gender": "FEMALE",
    "bloodGroup": "O+",
    "contactPhone": "+19876543210",
    "contactEmail": "alice@example.com",
    "address": "456 Elm St",
    "patientType": "OPD",
    "department": "CARDIOLOGY",
    "emergencyContactName": "Bob Doe",
    "emergencyContactPhone": "+11234567890"
  }
  ```

### List Patients
- **URL**: `/api/patients?page=1&limit=10&department=CARDIOLOGY`
- **Method**: `GET`
- **Note**: Doctors will only see patients in their department automatically.

### Get Patient
- **URL**: `/api/patients/:patientId`
- **Method**: `GET`

---

## 6. Prescriptions

**Headers Required**: `Authorization: Bearer <ACCESS_TOKEN>`

### Create Prescription
- **URL**: `/api/prescriptions`
- **Method**: `POST`
- **Roles**: `DOCTOR`
- **Body**:
  ```json
  {
    "patientId": "PAT-123456",
    "medicines": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Twice a day",
        "duration": "5 days",
        "instructions": "After food"
      },
      {
        "name": "Amoxicillin",
        "dosage": "250mg",
        "frequency": "Thrice a day",
        "duration": "7 days",
        "instructions": "Complete course"
      }
    ],
    "notes": "Patient advised to rest."
  }
  ```

### List Prescriptions
- **URL**: `/api/prescriptions?patientId=PAT-123456`
- **Method**: `GET`

### Get Prescription
- **URL**: `/api/prescriptions/:prescriptionId`
- **Method**: `GET`

---

## 7. Menu (Dynamic Sidebar)

**Headers Required**: `Authorization: Bearer <ACCESS_TOKEN>`

### Get User Menu
- **URL**: `/api/menu`
- **Method**: `GET`
- **Response**: Returns menu items based on user roles.

---

## 8. Password Management

### Forgot Password
- **URL**: `/api/password/forgot`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "tenantDomain": "citygeneral",
    "usernameOrEmail": "admin"
  }
  ```

### Reset Password
- **URL**: `/api/password/reset`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "tenantDomain": "citygeneral",
    "token": "reset-token-received-in-email",
    "newPassword": "NewSecurePassword123!"
  }
  ```

### Change Password (Authenticated)
- **URL**: `/api/password/change`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Body**:
  ```json
  {
    "oldPassword": "OldPassword123!",
    "newPassword": "NewPassword123!"
  }
  ```

---

## 9. Testing Workflow (Curl Examples)

Use these commands to test the API flow sequentially.

### 1. Check Server Health
```bash
curl http://localhost:5000/api/health
```

### 2. Register a Tenant
```bash
curl -X POST http://localhost:5000/api/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "address": "123 Test St",
    "contactEmail": "admin@testhospital.com",
    "contactPhone": "1234567890",
    "licenseNumber": "LIC-TEST-001",
    "domain": "testhospital"
  }'
```
> **Note**: Copy the `verificationToken` from the response.

### 3. Verify Tenant
Replace `<TOKEN>` with the verification token from step 2.
```bash
curl "http://localhost:5000/api/tenants/verify?token=<TOKEN>"
```

### 4. Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenantDomain": "testhospital",
    "username": "admin@testhospital",
    "password": "Admin@1234"
  }'
```
> **Note**: Copy the `accessToken` from the response.

### 5. Create a User (Doctor)
Replace `<ACCESS_TOKEN>` with the token from step 4.
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dr.smith",
    "email": "smith@testhospital.com",
    "firstName": "John",
    "lastName": "Smith",
    "password": "Password123!",
    "roles": ["DOCTOR"],
    "department": "CARDIOLOGY",
    "attributes": {
      "specialization": "Heart Surgery"
    }
  }'
```

### 6. Create a Patient
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "gender": "FEMALE",
    "bloodGroup": "O+",
    "contactPhone": "19876543210",
    "contactEmail": "alice@example.com",
    "address": "456 Elm St",
    "patientType": "OPD",
    "department": "CARDIOLOGY",
    "emergencyContactName": "Bob Doe",
    "emergencyContactPhone": "11234567890"
  }'
```
> **Note**: Copy the `patientId` from the response (e.g., `...-P-1`).

### 7. Create a Prescription
Replace `<PATIENT_ID>` with the ID from step 6.
```bash
curl -X POST http://localhost:5000/api/prescriptions \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "<PATIENT_ID>",
    "medicines": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Twice a day",
        "duration": "5 days",
        "instructions": "After food"
      }
    ],
    "notes": "Patient advised to rest."
  }'
```

### 8. Get User Menu
```bash
curl http://localhost:5000/api/menu \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
