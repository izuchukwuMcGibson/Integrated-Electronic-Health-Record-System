import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError, ApiResponse } from "../middleware/errorHandler";
import {
  PatientInput,
  VisitInput,
  PrescriptionInput,
  PrescriptionUpdateInput,
  LabRequestInput,
} from "../types/patient";

const prisma = new PrismaClient();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (
  body: Record<string, unknown>,
  key: string,
  fieldName: string,
) => {
  const value = body[key];

  if (typeof value !== "string") {
    throw new AppError(400, `${fieldName} is required`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new AppError(400, `${fieldName} is required`);
  }

  return trimmed;
};


const validatePatientInput = (body: unknown): PatientInput => {
  if (!isRecord(body)) {
    throw new AppError(400, "Patient payload is required");
  }

  return {
    patient_no: readString(body, "patient_no", "Patient number"),
    name: readString(body, "name", "Name"),
    dob: readString(body, "dob", "Date of birth"),
    sex: readString(body, "sex", "Sex"),
    contact: readString(body, "contact", "Contact"),
    address: readString(body, "address", "Address"),
  };
};

const validateVisitInput = (body: unknown): VisitInput => {
  if (!isRecord(body)) {
    throw new AppError(400, "Visit payload is required");
  }

  return {
    doctor_id: readString(body, "doctor_id", "Doctor ID"),
    complaint: readString(body, "complaint", "Complaint"),
    diagnosis:
      typeof body.diagnosis === "string" ? body.diagnosis.trim() : undefined,
    notes: typeof body.notes === "string" ? body.notes.trim() : undefined,
  };
};

const validatePrescriptionInput = (body: unknown): PrescriptionInput => {
  if (!isRecord(body)) {
    throw new AppError(400, "Prescription payload is required");
  }

  return {
    drug: readString(body, "drug", "Drug"),
    dosage: readString(body, "dosage", "Dosage"),
  };
};

const validatePrescriptionUpdateInput = (
  body: unknown,
): PrescriptionUpdateInput => {
  if (!isRecord(body)) {
    throw new AppError(400, "Prescription payload is required");
  }

  const data: PrescriptionUpdateInput = {};

  if ("drug" in body) {
    data.drug = readString(body, "drug", "Drug");
  }

  if ("dosage" in body) {
    data.dosage = readString(body, "dosage", "Dosage");
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(400, "Provide a drug or dosage to update");
  }

  return data;
};

const validateLabRequestInput = (body: unknown): LabRequestInput => {
  if (!isRecord(body)) {
    throw new AppError(400, "Lab request payload is required");
  }

  return {
    test_name: readString(body, "test_name", "Test name"),
  };
};

export const createPatient = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const input = validatePatientInput(req.body);

    const existing = await prisma.patient.findUnique({
      where: { patient_no: input.patient_no },
    });

    if (existing) {
      throw new AppError(409, "Patient number already exists");
    }

    const patient = await prisma.patient.create({
      data: {
        ...input,
        dob: new Date(input.dob),
      },
    });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const getPatients = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        visits: {
          include: {
            prescriptions: true,
            labRequests: true,
          },
        },
      },
    });

    if (!patient) {
      throw new AppError(404, "Patient not found");
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const visitDetails = {
  patient: true,
  doctor: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  prescriptions: true,
  labRequests: true,
};

export const getVisits = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const visits = await prisma.visit.findMany({
      include: visitDetails,
      orderBy: { date: "desc" },
    });

    res.json({ success: true, data: visits });
  } catch (error) {
    next(error);
  }
};

export const getPatientVisits = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const { patientId } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });

    if (!patient) {
      throw new AppError(404, "Patient not found");
    }

    const visits = await prisma.visit.findMany({
      where: { patient_id: patientId },
      include: visitDetails,
      orderBy: { date: "desc" },
    });

    res.json({ success: true, data: visits });
  } catch (error) {
    next(error);
  }
};

export const createVisit = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const { patientId } = req.params;
    const data = validateVisitInput(req.body);

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new AppError(404, "Patient not found");
    }

    const doctor = await prisma.user.findUnique({
      where: { id: data.doctor_id },
    });

    if (!doctor) {
      throw new AppError(404, "Doctor not found");
    }

    const visit = await prisma.visit.create({
      data: {
        patient_id: patientId,
        doctor_id: data.doctor_id,
        complaint: data.complaint,
        diagnosis: data.diagnosis ?? null,
        notes: data.notes ?? null,
      },
    });

    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};

export const createPrescription = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const { visitId } = req.params;
    const data = validatePrescriptionInput(req.body);

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new AppError(404, "Visit not found");
    }

    const prescription = await prisma.prescription.create({
      data: {
        visit_id: visitId,
        drug: data.drug,
        dosage: data.dosage,
      },
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

export const getVisitPrescriptions = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const { visitId } = req.params;
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: { id: true },
    });

    if (!visit) {
      throw new AppError(404, "Visit not found");
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { visit_id: visitId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

export const updatePrescription = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const data = validatePrescriptionUpdateInput(req.body);
    const prescription = await prisma.prescription.findUnique({
      where: { id: req.params.prescriptionId },
      select: { id: true },
    });

    if (!prescription) {
      throw new AppError(404, "Prescription not found");
    }

    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescription.id },
      data,
    });

    res.json({ success: true, data: updatedPrescription });
  } catch (error) {
    next(error);
  }
};

export const createLabRequest = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const { visitId } = req.params;
    const data = validateLabRequestInput(req.body);

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new AppError(404, "Visit not found");
    }

    const labRequest = await prisma.labRequest.create({
      data: {
        visit_id: visitId,
        test_name: data.test_name,
      },
    });

    res.status(201).json({ success: true, data: labRequest });
  } catch (error) {
    next(error);
  }
};
