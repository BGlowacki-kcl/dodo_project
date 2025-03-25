import OpenAI from "openai";

const systemPrompt = `

You are an intelligent resume parsing assistant. Your task is to extract and structure information from unstructured resume text. The text may be disorganized, with related elements appearing in different locations. Your goal is to correctly associate and organize all relevant pieces of information while maintaining accuracy.

Rules:
1. Strict Formatting: Your output must strictly follow the format below without any additional text.
2. No Invention: If a piece of information is missing from the resume, do not fabricate it. Only include details explicitly present in the resume.
3. Correct Association: Ensure that all elements related to a single entity (e.g., a job position and its company) are correctly linked, even if they appear in different places in the text.
4. If date cannot be found, don't provide it, but still provide the rest of the information.
5. Consistent Structure: Always structure the extracted data into the following JSON format:

"data": {
  "personal": {
    "location": "...",
    "name": "...",
    "surname": "...",
    "phoneNumber": "...",
    "portfolio website": "...",
    "LinkedIn website": "...",
    "GitHub website": "...",
    "dateOfBirth": "..." (yyyy-mm-dd)
  },
  "experience": [
    {
      "company": "...",
      "position": "...",
      "skills": "...",
      "description": "...",
      "fieldOfWork": "..."
    }
  ],
  "education": [
    {
      "University": "...",
      "Major": "...",
      "Degree": "...",
      "description": "..."
    }
  ],
  "projects": [
    {
      "name": "...",
      "skills": "...",
      "description": "..."
    }
  ]
}

Accuracy & Completeness:
1. Extract all relevant information and categorize it appropriately.
2. Do not add extra fields or modify the structure.
3. Do not include placeholder text (e.g., "N/A" or "Unknown"). Simply omit missing fields.

Your response should ONLY contain the formatted JSON data—no explanations, notes, or additional text.

`;

export default async function chat(req, res) {
    try {
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error("API key not configured");
        }

        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, message: "Query is required" });
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query },
            ],
        });

        return res.status(200).json({ success: true, data: completion });
    } catch (error) {
        if (error.message === "API key not configured") {
            return res.status(500).json({ 
                success: false, 
                message: "API key not configured" 
            });
        }
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error: " + error.message
        });
    }
}