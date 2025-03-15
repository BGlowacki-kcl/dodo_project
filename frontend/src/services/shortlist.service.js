import { checkTokenExpiration } from "./auth.service.js";

const BASE_URL = "http://localhost:5000/api";

// Helper to get the auth token from sessionStorage
function getAuthToken() {
    return sessionStorage.getItem("token");
}

// Helper to build headers including the Authorization token
function getHeaders() {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}

// Retrieve a user's shortlist
export async function getShortlist() {
    const response = await fetch(`${BASE_URL}/shortlist`, {
        headers: getHeaders(),
    });
    // Optionally, call checkTokenExpiration if needed:
    checkTokenExpiration(response);
    if (!response.ok) {
        throw new Error("Failed to fetch shortlist");
    }
    return await response.json();
}

// Add a job to a user's shortlist
export async function addJobToShortlist(jobId) {
    const response = await fetch(`${BASE_URL}/shortlist`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ jobId }),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
        throw new Error("Failed to add job to shortlist");
    }
    return await response.json();
}

// Remove a job from a user's shortlist
export async function removeJobFromShortlist(jobId) {
    const response = await fetch(`${BASE_URL}/shortlist/${jobId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
        throw new Error("Failed to remove job from shortlist");
    }
    return await response.json();
}
