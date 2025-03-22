import { getAuth } from "firebase/auth";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getRecommendedJobs() {
    try {
        // Retrieve the current Firebase user token
        const auth = getAuth();
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;

        if (!token) {
            throw new Error("User is not authenticated.");
        }

        const response = await fetch("http://localhost:5000/api/matcher/recommend-jobs", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch recommended jobs");
        }
        const data = await response.json();
        return data.recommendedJobs;
    } catch (error) {
        console.error("Error in matcherService:", error);
        throw error;
    }
}
