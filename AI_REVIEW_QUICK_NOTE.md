# AI Review Endpoint - Quick Guide

**Endpoint:** `POST /api/ai-review/analyze`

**Auth:** Required (JWT token in Authorization header)

**What it does:** Send daily health data (patients, diseases, weather) and get AI-powered insights about trends, disease patterns, risks, and recommendations.

---

## Request Example

```json
{
  "data": {
    "date": "2025-03-15",
    "totalPatients": 150,
    "newCases": { "Malaria": 12, "Typhoid": 5, "Flu": 8 },
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
    "newCases": { "Malaria": 8, "Typhoid": 3, "Flu": 5 }
  }
}
```

## Response Example

```json
{
  "success": true,
  "data": {
    "insights": "5.6% patient increase today. Malaria cases up 50% correlating with rainy weather.",
    "keyPoints": [
      "5.6% increase in patients",
      "Malaria spike - weather related",
      "Adequate bed availability"
    ],
    "trends": {
      "patientTrend": "5.6% increase from yesterday",
      "diseasePatterns": [
        "Malaria spike correlates with rainy weather",
        "Typhoid cases increasing"
      ],
      "riskFactors": ["High admission rate", "Emerging malaria cluster"]
    },
    "recommendations": [
      "Increase malaria prevention programs",
      "Conduct water quality testing"
    ]
  }
}
```

## Copy-Paste Code (Fetch)

```javascript
const response = await fetch("/api/ai-review/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    data: {
      /* today's data */
    },
    previousData: {
      /* yesterday's data (optional) */
    },
  }),
});
const result = await response.json();
```

**That's it!** Send daily health data, get AI analysis back.
