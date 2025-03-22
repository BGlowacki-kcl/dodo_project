import { checkTokenExpiration } from "./auth.service.js";

export async function getAllUserApplications() {
  const response = await fetch('${BASE_URL}/application/all', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    }
  })
  checkTokenExpiration(response);

  const responseJson = await response.json();
  if (!responseJson.success) {
    throw new Error(response.data.message || "Failed to fetch applications");
  }
  return responseJson.data;
}

export async function getApplicationById(appId) {
    try {
        const response = await fetch(`/api/application/byId?id=${appId}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            }
        });
        checkTokenExpiration(response);
        const responseJson = await response.json();
        if (!responseJson.success) {
            throw new Error(responseJson.message || "Failed to fetch application");
        }
        return responseJson.data;
    } catch (error) {
        console.error("Error fetching application:", error);
        throw error;
    }
}

export async function getJobApplicants(jobId) {
  try {
    const response = await fetch(`/api/application/byJobId?jobId=${jobId}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      }
    });
    checkTokenExpiration(response);
    const responseJson = await response.json();
    if (!responseJson.success) {
      throw new Error(response.data.message || "Failed to fetch applicants");
    }
    return responseJson.data;
  } catch (error) {
    console.error("Error fetching applicants:", error);
    if (error.response && error.response.status === 403) {
      return {status: 403, message: "You are not authorized to view these applicants"};
    }
    return {status: 500, message: "Failed to fetch applicants"};
  }
}

export async function applyToJob({ jobId, coverLetter, answers }) {
  const response = await fetch('/api/application/apply', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      jobId,
      coverLetter,
      answers,
    })
  });
  checkTokenExpiration(response);
  const responseJson = await response.json();
  if (!responseJson.success) {
    throw new Error(responseJson.message || "Failed to apply");
  }
  return responseJson.data; 
}

export async function withdrawApplication(appId) {
    const response = await fetch(`/api/application/withdraw?id=${appId}`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        }
    });
    checkTokenExpiration(response);

    const responseJson = await response.json(); // Parse the response JSON
    if (!responseJson.success) {
        throw new Error(responseJson.message || "Failed to withdraw application");
    }
    return responseJson.message; // Return the success message
}

export async function getDashboardData() {
  const response = await fetch('/api/application/dashboard', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    }
  });
  checkTokenExpiration(response);

  const responseJson = await response.json();

  if (!responseJson.success) {
    throw new Error(response || "Failed to fetch dashboard data");
  }
  return responseJson.data;

  
}

export async function getAssessmentDeadline(appId){
  const response = await fetch(`/api/application/deadline?id=${appId}`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    }
  });
  checkTokenExpiration(response);
  const responseJson = await response.json();
  if (!responseJson.success) {
    throw new Error(response.data.message || "Failed to fetch deadline");
  }

  return responseJson.data;
}

export async function setAssessmentDeadline(appId, deadline){
  const response = await fetch(`/api/application/deadline?id=${appId}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
    body: JSON.stringify({ deadline })
  });
  checkTokenExpiration(response);
  const responseJson = await response.json();
  if (!responseJson.success) {
    throw new Error(response.data.message || "Failed to set deadline");
  }
  return responseJson.data;
}

export async function updateStatus(appId, reject) {
  const sentToReject = reject ? `&reject=true` : '';
  const response = await fetch(`/api/application/status?id=${appId}${sentToReject}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    }
  });
  checkTokenExpiration(response);
  console.log("RESSSSS: " + response);
  const responseJson = await response.json();
  if (!responseJson.success) {
    throw new Error(response.data.message || "Failed to progress with the application");
  }
  return responseJson.data;
}

export async function saveApplication({ applicationId, jobId, coverLetter, answers }) {
  const response = await fetch('/api/application/save', {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      applicationId, // Include applicationId in the request body
      jobId,
      coverLetter,
      answers,
    }),
  });
  checkTokenExpiration(response);
  const responseJson = await response.json();
  if (!responseJson.success) {
    throw new Error(responseJson.message || "Failed to save application");
  }
  return responseJson.data;
}

export async function submitApplication(applicationId) {
    const response = await fetch('/api/application/submit', {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({ applicationId }), // Send only the applicationId
    });
    checkTokenExpiration(response);
    const responseJson = await response.json();
    if (!responseJson.success) {
        throw new Error(responseJson.message || "Failed to submit application");
    }
    return responseJson.data;
}

