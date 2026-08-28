import { Router } from "express";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import {
  createPatient,
  getPatients,
  getPatientById,
  createVisit,
  createPrescription,
  createLabRequest,
} from "../controllers/patientController";

const router = Router();

router.post(
  "/create-patient",
  authenticate,
  authorize(UserRole.records_officer),
  asyncHandler(createPatient),
);

router.get("/get-patients", authenticate, asyncHandler(getPatients));

router.get("/get-patient/:id", authenticate, asyncHandler(getPatientById));

router.post(
  "/:patientId/visits",
  authenticate,
  authorize(UserRole.records_officer),
  asyncHandler(createVisit),
);

router.post(
  "/visits/:visitId/create-prescription",
  authenticate,
  authorize(UserRole.doctor),
  asyncHandler(createPrescription),
);

router.post(
  "/visits/:visitId/create-lab-request",
  authenticate,
  authorize(UserRole.lab_staff),
  asyncHandler(createLabRequest),
);

export default router;
