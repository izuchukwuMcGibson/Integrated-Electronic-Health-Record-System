export interface DailyHealthData {
  date: string;
  totalPatients: number;
  newCases: Record<string, number>; // Disease name -> count, e.g. { "Malaria": 15, "Typhoid": 8 }
  admissions: number;
  discharges: number;
  deaths?: number;
  weatherCondition?: string; // e.g., "rainy", "sunny", "dry"
  staffOnDuty?: number;
  availableBeds?: number;
  totalBeds?: number;
  previousDayData?: {
    totalPatients: number;
    newCases: Record<string, number>;
  };
  [key: string]: any; // Allow additional fields
}

export interface AiReviewRequest {
  data: DailyHealthData;
  previousData?: DailyHealthData;
}

export interface AiReviewResponse {
  success: boolean;
  data?: {
    insights: string;
    keyPoints: string[];
    trends: {
      patientTrend: string;
      diseasePatterns: string[];
      riskFactors: string[];
    };
    recommendations?: string[];
  };
  error?: string;
}
