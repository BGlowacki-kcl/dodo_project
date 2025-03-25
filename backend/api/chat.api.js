import OpenAI from "openai";

/**
 * System prompt for resume parsing
 * Provides detailed instructions to the AI for extracting structured data from resumes
 * Defines output format and processing rules
 * @type {String}
 */
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

/**
 * Chat API endpoint handler
 * Processes resume text using AI to extract structured information
 * Uses OpenRouter API to access LLaMA 3.2 model
 * @param {Object} req - Express request object containing resume text
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with parsed resume data
 */
export default async function chat(req, res) {
  const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
  })
  const { query } = req.body;
  try {
      /**
       * Send resume text to AI model for parsing
       */
      const completion = await openai.chat.completions.create({
          model: "meta-llama/llama-3.2-3b-instruct:free",
          messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: query },
          ],
      })
      return res.status(200).json({ success: true, data: completion });
  } catch (err) {
      /**
       * Handle and log API errors
       */
      console.log(err);
      res.status(500).json({ success: false, message: "Internal server error "+err });
  }
  
}