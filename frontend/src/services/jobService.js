import { checkTokenExpiration } from "./auth.service.js";

const API_BASE_URL = "/api/job";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
  };
}

export async function getAllJobs() {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error("Failed to fetch all jobs");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all jobs:", error);
    throw error;
  }
}

export async function getJobById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error(`Failed to fetch job with id ${id}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching job by id ${id}:`, error);
    throw error;
  }
}

export async function createJob(jobData) {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error("Failed to create job");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
}

export async function updateJob(id, jobData) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error(`Failed to update job with id ${id}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating job with id ${id}:`, error);
    throw error;
  }
}

export async function deleteJob(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error(`Failed to delete job with id ${id}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error deleting job with id ${id}:`, error);
    throw error;
  }
}

export async function getJobCountByType(jobType) {
  try {
    const response = await fetch(`${API_BASE_URL}/count/type?type=${jobType}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error(`Failed to get job count for type: ${jobType}`);
    }
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error(`Error getting job count by type: ${jobType}`, error);
    throw error;
  }
}

export async function getAllJobRoles() {
  try {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error("Failed to get all job roles");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching job roles:", error);
    throw error;
  }
}

export async function getAllJobLocations() {
  try {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error("Failed to get all job locations");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching job locations:", error);
    throw error;
  }
}

export async function getAllJobTypes() {
  try {
    const response = await fetch(`${API_BASE_URL}/employmentType`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error("Failed to get all job types");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching job types:", error);
    throw error;
  }
}

export async function getAllCompanies() {
  try {
    const response = await fetch(`${API_BASE_URL}/company`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error("Failed to get all companies");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function getFilteredJobs(filters) {
  try {
    const queryParams = new URLSearchParams();
    filters.jobType?.forEach((type) => queryParams.append("jobType", type));
    filters.location?.forEach((loc) => queryParams.append("location", loc));
    filters.role?.forEach((role) => queryParams.append("role", role));
    filters.company?.forEach((company) => queryParams.append("company", company));
    const url = `${API_BASE_URL}/search?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    checkTokenExpiration(response);
    if (!response.ok) {
      throw new Error("Failed to get filtered jobs");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching filtered jobs:", error);
    throw error;
  }
}
