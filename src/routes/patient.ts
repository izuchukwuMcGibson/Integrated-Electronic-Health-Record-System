import { Router } from "express";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import {
  createPatient,
  getPatients,
  getPatientById,
  getVisits,
  getPatientVisits,
  createVisit,
  createPrescription,
  getVisitPrescriptions,
  updatePrescription,
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

router.get("/visits", authenticate, asyncHandler(getVisits));

router.get("/:patientId/visits", authenticate, asyncHandler(getPatientVisits));

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

router.get(
  "/visits/:visitId/prescriptions",
  authenticate,
  asyncHandler(getVisitPrescriptions),
);

router.patch(
  "/prescriptions/:prescriptionId",
  authenticate,
  authorize(UserRole.doctor),
  asyncHandler(updatePrescription),
);

router.post(
  "/visits/:visitId/create-lab-request",
  authenticate,
  authorize(UserRole.lab_staff),
  asyncHandler(createLabRequest),
);

export default router;
