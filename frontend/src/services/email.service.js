// email.service.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const sendEmail = async (emailData) => {
  const response = await fetch(`${BASE_URL}/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorData = await response.json(); // Attempt to get server error message
    throw new Error(errorData.message || 'Failed to send message');
  }

  return await response.json(); // Return server response, e.g., { message: "Email sent!" }
};

export default sendEmail;