import { JobSeeker } from '../models/user/jobSeeker.model.js'
import Job from '../models/job.model.js'

import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.HUGGING_FACE_API_KEY;
const modelId = "TechWolf/JobBERT-v2";
const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;

export async function query(cvText, jobDescription) {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: {
                source_sentence: jobDescription,
                sentences: [cvText],
            }
        }),
    });

    if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
    }

    const result = await response.json();
    if (!Array.isArray(result) || result.length === 0) {
        throw new Error("Error response");
    }
    const similarityScore = result[0];

    return {
        jobDescription,
        similarityScore
    }
}

export const getUserJobRecommendations = async (req, res) => {
    const { uid } = req;
    if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const user = await JobSeeker.findOne({ uid });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Ensure user has a CV
    if (!user.resume) {
        return res.status(400).json({ message: "User CV is missing" });
    }

    const jobs = await Job.find().limit(30);

    const jobMatches = await Promise.all(
        jobs.map(async (job) => {
            const similarityScore = await query(user.resume, job.description);
            return { ...job.toObject(), similarityScore };
        })
    );

    // Sort jobs by highest similarity score
    jobMatches.sort((a, b) => b.similarityScore - a.similarityScore);

    // Return top 5 job recommendations
    res.status(200).json({ recommendedJobs: jobMatches.slice(0, 5) });
};
