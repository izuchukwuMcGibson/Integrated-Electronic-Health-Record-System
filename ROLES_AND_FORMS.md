# User Roles & Frontend Forms Guide

## Quick Reference: What Each Role Can Create

### 1. **Records Officer** 
Can create:
- **Patients** - New patient records
- **Visits** - Medical visits for patients

---

#### Patient Creation Form
**Endpoint:** `POST /api/patients/create-patient`

**Required Fields:**
```json
{
  "patient_no": "string",    // Unique patient ID (e.g., "PAT-001")
  "name": "string",          // Patient's full name
  "dob": "string",           // Date of birth (YYYY-MM-DD)
  "sex": "string",           // Male or Female
  "contact": "string",       // Phone number
  "address": "string"        // Patient's address
}
```

**Frontend Form Fields:**
- [ ] Patient Number (text input, unique validation)
- [ ] Full Name (text input)
- [ ] Date of Birth (date picker)
- [ ] Sex (dropdown: Male/Female)
- [ ] Contact Number (phone input)
- [ ] Address (textarea)

**Response:** Patient object with ID, createdAt, updatedAt

---

#### Visit Creation Form
**Endpoint:** `POST /api/patients/:patientId/visits`

**Required Fields:**
```json
{
  "doctor_id": "string",     // User ID of attending doctor
  "complaint": "string"      // Patient's complaint/reason for visit
}
```

**Optional Fields:**
```json
{
  "diagnosis": "string",     // Doctor's diagnosis (optional)
  "notes": "string"          // Additional notes (optional)
}
```

**Frontend Form Fields:**
- [ ] Select Patient (dropdown - from list)
- [ ] Select Doctor (dropdown - list of doctors)
- [ ] Complaint (textarea) *required
- [ ] Diagnosis (textarea) *optional
- [ ] Notes (textarea) *optional

**Response:** Visit object with ID, date, createdAt, updatedAt

---

### 2. **Doctor**
Can create:
- **Prescriptions** - Drug prescriptions for visits

---

#### Prescription Creation Form
**Endpoint:** `POST /api/patients/visits/:visitId/create-prescription`

**Required Fields:**
```json
{
  "drug": "string",          // Drug name (e.g., "Amoxicillin")
  "dosage": "string"         // Dosage instructions (e.g., "500mg 3x daily")
}
```

**Frontend Form Fields:**
- [ ] Drug Name (text input or dropdown if you have drug list)
- [ ] Dosage (text input - instructions like "500mg 3 times daily for 7 days")

**Response:** Prescription object with ID, status: "pending", createdAt, updatedAt

---

### 3. **Lab Staff**
Can create:
- **Lab Requests** - Laboratory test requests for visits

---

#### Lab Request Creation Form
**Endpoint:** `POST /api/patients/visits/:visitId/create-lab-request`

**Required Fields:**
```json
{
  "test_name": "string"      // Test name (e.g., "Full Blood Count")
}
```

**Frontend Form Fields:**
- [ ] Test Name (text input or dropdown if you have test list)

**Response:** Lab Request object with ID, status: "pending", createdAt, updatedAt

---

## Summary Table

| Role | Can Create | Form Fields | Notes |
|------|-----------|-------------|-------|
| **Records Officer** | Patient | 6 fields (patient_no, name, dob, sex, contact, address) | Unique patient number required |
| **Records Officer** | Visit | 2 required + 2 optional (doctor_id, complaint, diagnosis, notes) | Must select existing patient and doctor |
| **Doctor** | Prescription | 2 fields (drug, dosage) | Must be added to existing visit |
| **Lab Staff** | Lab Request | 1 field (test_name) | Must be added to existing visit |

---

## Authentication for Each Role

All create operations require:
1. Valid JWT token in `Authorization: Bearer <token>` header
2. User logged in with correct role
3. For visit/prescription/lab request: The parent entity (patient/visit) must exist

**Example Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Form Validation Tips

### Patient Creation
- Patient number must be unique (check before submitting)
- DOB should be a valid date
- Contact should be a valid phone format
- All fields required

### Visit Creation
- Must have both patient and doctor selected
- Complaint is required (cannot be empty)
- Diagnosis and notes are optional

### Prescription
- Drug name is required
- Dosage is required (free text for flexibility)

### Lab Request
- Test name is required

---

## Error Handling

All create endpoints return errors like:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common errors:
- `400` - Missing required fields
- `403` - User role doesn't have permission
- `404` - Referenced resource not found (patient/visit)
- `409` - Duplicate unique value (e.g., patient_no already exists)
