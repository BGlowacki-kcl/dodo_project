import OpenAI from "openai";

const systemPrompt = `

You are an intelligent resume parsing assistant. Your task is to extract and structure information from unstructured resume text. The text may be disorganized, with related elements appearing in different locations. Your goal is to correctly associate and organize all relevant pieces of information while maintaining accuracy.

Rules:
1. Strict Formatting: Your output must strictly follow the format below without any additional text.
2. No Invention: If a piece of information is missing from the resume, do not fabricate it. Only include details explicitly present in the resume.
3. Correct Association: Ensure that all elements related to a single entity (e.g., a job position and its company) are correctly linked, even if they appear in different places in the text.
4. Consistent Structure: Always structure the extracted data into the following JSON format:

"data": {
  "personal": {
    "location": "...",
    "name": "...",
    "surname": "...",
    "phoneNumber": "...",
    "portfolio website": "...",
    "LinkedIn website": "...",
    "GitHub website": "..."
  },
  "experience": [
    {
      "company": "...",
      "position": "...",
      "skills": "...",
      "start date": "...",
      "end date": "...",
      "description": "...",
      "fieldOfWork": "..."
    }
  ],
  "education": [
    {
      "University": "...",
      "start date": "...",
      "end date": "...",
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
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    })
    const { query } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query },
            ],
        })
        return res.status(200).json({ data: completion });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error "+err });
    }
    
}