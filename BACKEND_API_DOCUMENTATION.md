# Integrated Electronic Health Record System - Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Response Format](#response-format)

---

## Overview

The **Integrated Electronic Health Record (EHR) System** is a comprehensive healthcare management API built with Express.js, TypeScript, and PostgreSQL. It provides endpoints for:

- User authentication and authorization
- Patient record management
- Medical visit documentation
- Prescription management
- Laboratory test requests

**Base URL:** `http://localhost:3000/api`

**Environment:** Currently running on `PORT 3000` in development mode

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database
- JWT Secret for authentication

### Environment Variables
Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@host:5432/database_name"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=3000
```

### Installation & Running

```bash
# Install dependencies
npm install

# Set up database migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev

# View database (Prisma Studio)
npx prisma studio
```

---

## Authentication

### JWT Token Authentication

All authenticated endpoints require a Bearer token in the Authorization header.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

**Token Payload Example:**
```json
{
  "userId": "user123",
  "email": "user@example.com",
  "role": "doctor"
}
```

**Token Expiry:** 24 hours

---

## API Endpoints

### 1. Authentication Routes (`/api/auth`)

#### POST `/api/auth/signup`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "doctor"
}
```

**Valid Roles:** `admin`, `doctor`, `pharmacist`, `lab_staff`, `records_officer`

**Password Requirements:** Minimum 8 characters

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clh123abc",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "doctor",
      "createdAt": "2026-08-29T10:30:00Z",
      "updatedAt": "2026-08-29T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**HTTP Cookie:** JWT token is also set in an httpOnly cookie (24-hour max age)

**Error Responses:**
- `400` - Invalid input (missing fields, weak password)
- `409` - Email already exists

---

#### POST `/api/auth/login`
Authenticate user and obtain JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clh123abc",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "doctor",
      "createdAt": "2026-08-29T10:30:00Z",
      "updatedAt": "2026-08-29T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `400` - Invalid credentials
- `401` - Invalid email or password

---

### 2. Patient Routes (`/api/patients`)

#### POST `/api/patients/create-patient`
Create a new patient record

**Authentication:** Required (Bearer token)  
**Authorization:** `records_officer` role only

**Request Body:**
```json
{
  "patient_no": "PAT-001",
  "name": "Jane Smith",
  "dob": "1990-05-15",
  "sex": "Female",
  "contact": "0712345678",
  "address": "123 Main St, City"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "pat123abc",
    "patient_no": "PAT-001",
    "name": "Jane Smith",
    "dob": "1990-05-15T00:00:00Z",
    "sex": "Female",
    "contact": "0712345678",
    "address": "123 Main St, City",
    "createdAt": "2026-08-29T10:30:00Z",
    "updatedAt": "2026-08-29T10:30:00Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (missing token)
- `403` - Forbidden (insufficient permissions)
- `409` - Conflict (patient_no already exists)

---

#### GET `/api/patients/get-patients`
Retrieve all patients

**Authentication:** Required (Bearer token)  
**Authorization:** Any authenticated user

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pat123abc",
      "patient_no": "PAT-001",
      "name": "Jane Smith",
      "dob": "1990-05-15T00:00:00Z",
      "sex": "Female",
      "contact": "0712345678",
      "address": "123 Main St, City",
      "createdAt": "2026-08-29T10:30:00Z",
      "updatedAt": "2026-08-29T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized

---

#### GET `/api/patients/get-patient/:id`
Retrieve a specific patient by ID

**Authentication:** Required (Bearer token)  
**Authorization:** Any authenticated user

**Path Parameters:**
- `id` (string): Patient ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "pat123abc",
    "patient_no": "PAT-001",
    "name": "Jane Smith",
    "dob": "1990-05-15T00:00:00Z",
    "sex": "Female",
    "contact": "0712345678",
    "address": "123 Main St, City",
    "createdAt": "2026-08-29T10:30:00Z",
    "updatedAt": "2026-08-29T10:30:00Z",
    "visits": [
      {
        "id": "vis123",
        "patient_id": "pat123abc",
        "doctor_id": "user123",
        "date": "2026-08-29T10:30:00Z",
        "complaint": "Fever",
        "diagnosis": "Common Cold",
        "notes": "Rest advised"
      }
    ]
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Patient not found

---

### 3. Visit Routes (`/api/patients`)

#### POST `/api/patients/:patientId/visits`
Create a new medical visit for a patient

**Authentication:** Required (Bearer token)  
**Authorization:** `records_officer` role only

**Path Parameters:**
- `patientId` (string): Patient ID

**Request Body:**
```json
{
  "doctor_id": "user123",
  "complaint": "Fever and cough",
  "diagnosis": "Respiratory infection",
  "notes": "Prescribed antibiotics, advised rest"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "vis123abc",
    "patient_id": "pat123abc",
    "doctor_id": "user123",
    "date": "2026-08-29T10:30:00Z",
    "complaint": "Fever and cough",
    "diagnosis": "Respiratory infection",
    "notes": "Prescribed antibiotics, advised rest",
    "createdAt": "2026-08-29T10:30:00Z",
    "updatedAt": "2026-08-29T10:30:00Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Patient not found

---

### 4. Prescription Routes (`/api/patients`)

#### POST `/api/patients/visits/:visitId/create-prescription`
Add a prescription to a visit

**Authentication:** Required (Bearer token)  
**Authorization:** `doctor` role only

**Path Parameters:**
- `visitId` (string): Visit ID

**Request Body:**
```json
{
  "drug": "Amoxicillin",
  "dosage": "500mg three times daily for 7 days"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "presc123abc",
    "visit_id": "vis123abc",
    "drug": "Amoxicillin",
    "dosage": "500mg three times daily for 7 days",
    "status": "pending",
    "createdAt": "2026-08-29T10:30:00Z",
    "updatedAt": "2026-08-29T10:30:00Z"
  }
}
```

**Prescription Status Values:** `pending`, `dispensed`

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Visit not found

---

### 5. Lab Request Routes (`/api/patients`)

#### POST `/api/patients/visits/:visitId/create-lab-request`
Create a laboratory test request for a visit

**Authentication:** Required (Bearer token)  
**Authorization:** `lab_staff` role only

**Path Parameters:**
- `visitId` (string): Visit ID

**Request Body:**
```json
{
  "test_name": "Full Blood Count (FBC)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "lab123abc",
    "visit_id": "vis123abc",
    "test_name": "Full Blood Count (FBC)",
    "status": "pending",
    "result_text": null,
    "createdAt": "2026-08-29T10:30:00Z",
    "updatedAt": "2026-08-29T10:30:00Z"
  }
}
```

**Lab Request Status Values:** `pending`, `completed`

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Visit not found

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **admin** | Full system access (can be extended) |
| **doctor** | View patients, create prescriptions, write visit notes |
| **pharmacist** | View prescriptions, dispense medications |
| **lab_staff** | Create lab requests, update test results |
| **records_officer** | Create patient records, create visits |

---

## Data Models

### User Model
```typescript
{
  id: string;              // Unique identifier
  email: string;           // Unique email
  name: string;
  password_hash: string;   // Bcrypt hashed password
  role: UserRole;          // Admin, doctor, pharmacist, lab_staff, records_officer
  createdAt: DateTime;
  updatedAt: DateTime;
  visits: Visit[];         // Visits created by this user
}
```

### Patient Model
```typescript
{
  id: string;              // Unique identifier
  patient_no: string;      // Unique patient number
  name: string;
  dob: DateTime;           // Date of birth
  sex: string;             // Male/Female
  contact: string;         // Phone number
  address: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  visits: Visit[];         // All visits for this patient
}
```

### Visit Model
```typescript
{
  id: string;              // Unique identifier
  patient_id: string;      // Foreign key to Patient
  doctor_id: string;       // Foreign key to User (doctor)
  date: DateTime;          // Visit date
  complaint: string;       // Patient's complaint
  diagnosis: string?;      // Doctor's diagnosis (optional)
  notes: string?;          // Additional notes (optional)
  createdAt: DateTime;
  updatedAt: DateTime;
  prescriptions: Prescription[];  // Associated prescriptions
  labRequests: LabRequest[];      // Associated lab requests
}
```

### Prescription Model
```typescript
{
  id: string;              // Unique identifier
  visit_id: string;        // Foreign key to Visit
  drug: string;            // Drug name
  dosage: string;          // Dosage instructions
  status: PrescriptionStatus;  // pending | dispensed
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### LabRequest Model
```typescript
{
  id: string;              // Unique identifier
  visit_id: string;        // Foreign key to Visit
  test_name: string;       // Name of the test
  status: LabRequestStatus;    // pending | completed
  result_text: string?;    // Test results (optional)
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | OK | Successful GET request |
| `201` | Created | Successful POST request |
| `400` | Bad Request | Invalid input, missing fields |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | User lacks required permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate unique value (e.g., patient_no) |
| `500` | Internal Server Error | Server-side error |

### Common Error Examples

**Missing Token:**
```json
{
  "success": false,
  "error": "Missing or invalid Authorization header"
}
```

**Invalid Token:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Insufficient Permissions:**
```json
{
  "success": false,
  "error": "User does not have permission to perform this action"
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": "Patient number is required"
}
```

---

## Response Format

### Success Response
All successful API responses follow this format:

```json
{
  "success": true,
  "data": {}  // Response-specific data
}
```

### Error Response
All error API responses follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

## Health Check

### GET `/api/health`
Simple health check endpoint

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "Server is running"
  }
}
```

---

## Frontend Integration Tips

1. **Store the JWT Token:** After login/signup, store the token in localStorage or sessionStorage
2. **Set Authorization Header:** Include token in all authenticated requests:
   ```javascript
   headers: {
     "Authorization": `Bearer ${token}`
   }
   ```
3. **Handle Token Expiry:** Implement logout when receiving 401 responses
4. **CORS Configuration:** Frontend should be able to connect from `http://localhost:5173` (Vite dev server)
5. **Cookie Support:** Ensure credentials are enabled in fetch/axios calls:
   ```javascript
   fetch(url, { credentials: 'include' })
   ```

---

## Example Frontend Integration (JavaScript/TypeScript)

### Authentication
```javascript
// Signup
const signup = async (name, email, password, role) => {
  const response = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
    credentials: 'include'
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
};
```

### Protected API Calls
```javascript
const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

// Get all patients
const getPatients = async () => {
  const response = await fetch('http://localhost:3000/api/patients/get-patients', {
    headers: getAuthHeader(),
    credentials: 'include'
  });
  return await response.json();
};

// Create patient
const createPatient = async (patientData) => {
  const response = await fetch('http://localhost:3000/api/patients/create-patient', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(patientData),
    credentials: 'include'
  });
  return await response.json();
};
```

---

## Support & Questions

For backend-related issues or questions, refer to the database schema in `prisma/schema.prisma` or check the TypeScript type definitions in `src/types/`.

Last Updated: August 29, 2026
