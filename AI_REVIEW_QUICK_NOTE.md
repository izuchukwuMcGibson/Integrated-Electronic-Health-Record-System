# AI Review Endpoint - Quick Guide

**Endpoints:**

- `GET /api/ai-review/daily-data` - Auto-fetch daily health data from database
- `POST /api/ai-review/analyze` - Analyze data and get AI insights

**Auth:** Required (JWT token in Authorization header)

**What it does:** Automatically fetches daily health facility data from database, sends it to Gemini AI, and returns insights about trends, disease patterns, risks, and recommendations.

---

## Frontend Implementation (Copy-Paste Ready)

### **Simple 1-Click Solution**

```javascript
const generateAIReview = async (token) => {
  try {
    // Step 1: Fetch today's auto-calculated data
    const dailyDataResponse = await fetch("/api/ai-review/daily-data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { data: dailyData } = await dailyDataResponse.json();

    // Step 2: (Optional) Add manual overrides for weather/staff
    dailyData.weatherCondition = "rainy"; // User selects this
    dailyData.staffOnDuty = 35; // User enters this
    dailyData.availableBeds = 45;
    dailyData.totalBeds = 100;

    // Step 3: Send to AI for analysis
    const reviewResponse = await fetch("/api/ai-review/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: dailyData }),
    });

    const review = await reviewResponse.json();

    // Display results
    if (review.success) {
      console.log("AI Insights:", review.data);
      return review.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### **What Gets Auto-Fetched:**

✅ Total patients (from database)  
✅ Disease cases (from today's visits)  
✅ Admissions (today's visit count)  
✅ Previous day data (for trend comparison)

### **Auto-Fetch Endpoint Example:**

```
GET /api/ai-review/daily-data
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "date": "2025-03-15",
    "totalPatients": 150,
    "newCases": { "Malaria": 12, "Typhoid": 5 },
    "admissions": 12,
    "discharges": 0,
    "deaths": 0,
    "previousDayData": {
      "totalPatients": 142,
      "newCases": { "Malaria": 8, "Typhoid": 3 }
    }
  }
}
```

---

## AI Analysis Response Example

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
      "Conduct water quality testing",
      "Prepare for increased bed demand"
    ]
  }
}
```

---

## UI Implementation Suggestions

**Add a button on your dashboard:**

```jsx
<button onClick={() => generateAIReview(token)}>
  Generate AI Review
</button>

// Display results
<div className="ai-review">
  <h2>Daily AI Review</h2>
  <p><strong>{review.insights}</strong></p>

  <h3>Key Points</h3>
  <ul>
    {review.keyPoints.map(pt => <li key={pt}>{pt}</li>)}
  </ul>

  <h3>Disease Patterns</h3>
  <ul>
    {review.trends.diseasePatterns.map(pattern =>
      <li key={pattern}>{pattern}</li>
    )}
  </ul>

  <h3>Risk Factors</h3>
  <ul>
    {review.trends.riskFactors.map(risk =>
      <li key={risk}>{risk}</li>
    )}
  </ul>

  <h3>Recommendations</h3>
  <ul>
    {review.recommendations.map(rec =>
      <li key={rec}>{rec}</li>
    )}
  </ul>
</div>
```

---

**That's it!** One click → auto-fetches data → AI analyzes → displays insights. 🚀
