import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "@prisma/client";
import {
  generateAiReview,
  getDailyHealthData,
} from "../controllers/aiReviewController";

const router = Router();

/**
 * POST /api/ai-review/analyze
 * Analyzes daily health facility data and generates AI-powered insights
 *
 * Body:
 * {
 *   "data": {
 *     "date": "2025-03-15",
 *     "totalPatients": 150,
 *     "newCases": { "Malaria": 12, "Typhoid": 5, "Flu": 8 },
 *     "admissions": 20,
 *     "discharges": 15,
 *     "deaths": 0,
 *     "weatherCondition": "rainy",
 *     "availableBeds": 45,
 *     "totalBeds": 100,
 *     "staffOnDuty": 35
 *   },
 *   "previousData": {
 *     "date": "2025-03-14",
 *     "totalPatients": 142,
 *     "newCases": { "Malaria": 8, "Typhoid": 3, "Flu": 5 }
 *   }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "insights": "Overall assessment here",
 *     "keyPoints": ["point 1", "point 2", "point 3"],
 *     "trends": {
 *       "patientTrend": "5% increase from yesterday",
 *       "diseasePatterns": ["Malaria spike correlates with rainy weather", "Flu cases steady"],
 *       "riskFactors": ["High admission rate", "Low bed availability"]
 *     },
 *     "recommendations": ["Increase malaria prevention measures", "Monitor staff capacity"]
 *   }
 * }
 */
router.post(
  "/analyze",
  authenticate,
  authorize(UserRole.admin, UserRole.doctor),
  asyncHandler(generateAiReview),
);

/**
 * GET /api/ai-review/daily-data
 * Auto-fetches daily health facility data from database
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "date": "2025-03-15",
 *     "totalPatients": 150,
 *     "newCases": { "Malaria": 12, "Typhoid": 5 },
 *     "admissions": 12,
 *     "discharges": 0,
 *     "deaths": 0,
 *     "previousDayData": {
 *       "totalPatients": 142,
 *       "newCases": { "Malaria": 8, "Typhoid": 3 }
 *     }
 *   }
 * }
 */
router.get(
  "/daily-data",
  authenticate,
  authorize(UserRole.admin, UserRole.doctor),
  asyncHandler(getDailyHealthData),
);

export default router;
