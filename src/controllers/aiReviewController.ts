import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError, ApiResponse } from "../middleware/errorHandler";
import {
  DailyHealthData,
  AiReviewRequest,
  AiReviewResponse,
} from "../types/aiReview";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateAiReview = async (
  req: Request<{}, {}, AiReviewRequest>,
  res: Response<ApiResponse<AiReviewResponse["data"]>>,
): Promise<void> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new AppError(500, "Gemini API key not configured");
    }

    const { data, previousData } = req.body;

    // Validate input
    if (!data || typeof data !== "object") {
      throw new AppError(400, "Daily health data is required");
    }

    if (!data.date || !data.totalPatients) {
      throw new AppError(
        400,
        "Date and totalPatients fields are required in data",
      );
    }

    // Build the analysis prompt
    const prompt = buildAnalysisPrompt(data, previousData);

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText =
      result.response.text() || "Unable to generate insights";

    // Parse and structure the response
    const insights = parseGeminiResponse(responseText);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("AI Review Error:", error);
    throw new AppError(
      500,
      error instanceof Error ? error.message : "Failed to generate AI review",
    );
  }
};

function buildAnalysisPrompt(
  data: DailyHealthData,
  previousData?: DailyHealthData,
): string {
  let prompt = `You are a healthcare analytics AI. Analyze the following daily health facility data and provide concise, actionable insights.

TODAY'S DATA (${data.date}):
- Total Patients: ${data.totalPatients}
- Admissions: ${data.admissions || 0}
- Discharges: ${data.discharges || 0}
- Deaths: ${data.deaths || 0}
- New Cases by Disease: ${JSON.stringify(data.newCases)}
- Weather Condition: ${data.weatherCondition || "Not specified"}
- Available Beds: ${data.availableBeds || "Not specified"}/${data.totalBeds || "Not specified"}
- Staff on Duty: ${data.staffOnDuty || "Not specified"}
`;

  if (previousData) {
    const patientChange = data.totalPatients - previousData.totalPatients;
    const patientChangePercent =
      previousData.totalPatients > 0
        ? ((patientChange / previousData.totalPatients) * 100).toFixed(2)
        : 0;

    prompt += `
PREVIOUS DAY'S DATA (${previousData.date}):
- Total Patients: ${previousData.totalPatients}
- New Cases by Disease: ${JSON.stringify(previousData.newCases)}

COMPARISON:
- Patient Trend: ${patientChange > 0 ? "↑" : patientChange < 0 ? "↓" : "→"} ${Math.abs(parseFloat(patientChangePercent as string))}% ${patientChange > 0 ? "increase" : patientChange < 0 ? "decrease" : "no change"} in total patients
`;
  }

  prompt += `
TASK: Provide a brief healthcare facility report with:
1. A 2-3 sentence overall assessment highlighting key patterns
2. Specific disease trend observations (any spikes, correlations with weather)
3. 3-5 bullet points of key findings
4. Any risk factors or concerning patterns
5. 2-3 actionable recommendations

Format your response as JSON with this structure:
{
  "insights": "Overall assessment here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "trends": {
    "patientTrend": "Trend description",
    "diseasePatterns": ["pattern 1", "pattern 2"],
    "riskFactors": ["risk 1", "risk 2"]
  },
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

  return prompt;
}

function parseGeminiResponse(responseText: string): AiReviewResponse["data"] {
  try {
    // Extract JSON from response (in case Gemini adds extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      insights: parsed.insights || "No insights available",
      keyPoints: Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints
        : ["Unable to parse key points"],
      trends: {
        patientTrend: parsed.trends?.patientTrend || "No trend data",
        diseasePatterns: Array.isArray(parsed.trends?.diseasePatterns)
          ? parsed.trends.diseasePatterns
          : [],
        riskFactors: Array.isArray(parsed.trends?.riskFactors)
          ? parsed.trends.riskFactors
          : [],
      },
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    // Return a fallback response with the raw text as insights
    return {
      insights: responseText,
      keyPoints: ["Analysis provided by AI"],
      trends: {
        patientTrend: "Analysis in progress",
        diseasePatterns: [],
        riskFactors: [],
      },
      recommendations: [],
    };
  }
}
