# AI Review Route Implementation Guide

## Overview

A new AI-powered analytics route has been added to the backend that analyzes daily health facility data using Google Gemini API and provides intelligent insights about disease patterns, patient trends, and recommendations.

---

## Endpoint Details

### POST `/api/ai-review/analyze`

**Authentication:** Required (JWT Token)  
**Authorization:** `admin` or `doctor` roles only  
**Content-Type:** `application/json`

---

## Request Body

```json
{
  "data": {
    "date": "2025-03-15",
    "totalPatients": 150,
    "newCases": {
      "Malaria": 12,
      "Typhoid": 5,
      "Flu": 8,
      "Cholera": 2
    },
    "admissions": 20,
    "discharges": 15,
    "deaths": 0,
    "weatherCondition": "rainy",
    "availableBeds": 45,
    "totalBeds": 100,
    "staffOnDuty": 35
  },
  "previousData": {
    "date": "2025-03-14",
    "totalPatients": 142,
    "newCases": {
      "Malaria": 8,
      "Typhoid": 3,
      "Flu": 5,
      "Cholera": 1
    }
  }
}
```

### Request Fields Explained

#### `data` (Required)

The current day's health facility data:

- **date** (string): ISO date format (YYYY-MM-DD)
- **totalPatients** (number): Total patients in facility today
- **newCases** (object): Disease name → count mapping
- **admissions** (number): New patient admissions today
- **discharges** (number): Discharged patients today
- **deaths** (number, optional): Deaths today
- **weatherCondition** (string, optional): "rainy", "sunny", "dry", etc.
- **availableBeds** (number, optional): Available beds
- **totalBeds** (number, optional): Total bed capacity
- **staffOnDuty** (number, optional): Staff members on duty

#### `previousData` (Optional but Recommended)

Previous day's data for trend analysis. When provided, the AI will calculate percentage changes and identify trends.

---

## Response Format

**Status Code:** 200 (Success) | 400 (Bad Request) | 401 (Unauthorized) | 500 (Server Error)

```json
{
  "success": true,
  "data": {
    "insights": "The facility is experiencing a 5.6% increase in patient load today. Notable spike in Malaria cases (12 vs 8 yesterday) strongly correlates with the rainy weather conditions. Current bed availability is adequate at 45%.",
    "keyPoints": [
      "5.6% increase in total patients (150 vs 142)",
      "Malaria cases up 50% - likely weather-related spike during rainy season",
      "Stable discharge rate with adequate bed availability",
      "All infectious disease cases trending upward - increase preventive measures"
    ],
    "trends": {
      "patientTrend": "5.6% increase from yesterday",
      "diseasePatterns": [
        "Malaria spike correlates with rainy weather",
        "Typhoid cases increasing - monitor water quality",
        "Flu cases stable",
        "Cholera cases low but present - maintain vigilance"
      ],
      "riskFactors": [
        "High admission-to-discharge ratio suggests longer patient stays",
        "Emerging malaria cluster during rainy season",
        "Need to monitor water-borne diseases (Typhoid, Cholera)"
      ]
    },
    "recommendations": [
      "Increase malaria prevention programs and bed nets distribution",
      "Conduct water quality testing and improve sanitation protocols",
      "Brief staff on current disease trends and update infection control measures",
      "Prepare for potential bed capacity issues if trends continue"
    ]
  }
}
```

### Response Fields

- **insights**: 2-3 sentence overall assessment
- **keyPoints**: Array of 3-5 key findings
- **trends.patientTrend**: Patient trend description (e.g., "5% increase")
- **trends.diseasePatterns**: Array of disease pattern observations
- **trends.riskFactors**: Array of identified risk factors
- **recommendations**: Array of 2-3 actionable recommendations

---

## Error Responses

### Missing API Key

```json
{
  "success": false,
  "error": "Gemini API key not configured"
}
```

### Invalid Request Data

```json
{
  "success": false,
  "error": "Date and totalPatients fields are required in data"
}
```

### Unauthorized Access

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## Setup Requirements

1. **Environment Variable:** Add to `.env` file

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **API Key:** Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Frontend Implementation Example

### Using Fetch API

```javascript
const analyzeHealthData = async (dailyData, previousData = null) => {
  const token = localStorage.getItem("authToken"); // Get JWT token

  const response = await fetch("/api/ai-review/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: dailyData,
      previousData: previousData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate AI review");
  }

  return await response.json();
};
```

### Using Axios

```javascript
import axios from "axios";

const analyzeHealthData = async (dailyData, previousData = null) => {
  const token = localStorage.getItem("authToken");

  try {
    const response = await axios.post(
      "/api/ai-review/analyze",
      {
        data: dailyData,
        previousData: previousData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("AI Review Error:", error.response?.data?.error);
    throw error;
  }
};
```

---

## Sample Data to Test

```javascript
const testData = {
  data: {
    date: "2025-03-15",
    totalPatients: 150,
    newCases: {
      Malaria: 12,
      Typhoid: 5,
      Flu: 8,
      Cholera: 2,
    },
    admissions: 20,
    discharges: 15,
    deaths: 0,
    weatherCondition: "rainy",
    availableBeds: 45,
    totalBeds: 100,
    staffOnDuty: 35,
  },
  previousData: {
    date: "2025-03-14",
    totalPatients: 142,
    newCases: {
      Malaria: 8,
      Typhoid: 3,
      Flu: 5,
      Cholera: 1,
    },
  },
};
```

---

## UI Implementation Suggestions

1. **Daily Review Dashboard**
   - Add a "Generate AI Review" button on the dashboard
   - Display the AI insights in a card format
   - Show key points as bullet points
   - Highlight risk factors in warning colors (yellow/red)

2. **Trend Visualization**
   - Display patient trend with arrow icons (↑ ↓ →)
   - Create a section for disease patterns with disease names and trends
   - Use charts to visualize disease case comparisons

3. **Recommendations Section**
   - Display recommendations in a highlighted box
   - Allow marking recommendations as "completed" or "acknowledged"

4. **Loading States**
   - Show loading spinner while awaiting AI analysis (usually 2-5 seconds)
   - Disable the generate button during processing

---

## Performance Notes

- **API Response Time:** Typically 2-5 seconds depending on data complexity
- **Rate Limiting:** No limits currently, but consider implementing if needed
- **Token Usage:** Gemini API uses tokens; monitor usage to manage costs

---

## Additional Features for Future

- Store AI review history for comparison over time
- Batch analyze multiple days at once
- Export reviews as PDF reports
- Create alerts when risk factors exceed thresholds
- Integration with email notifications for critical findings
