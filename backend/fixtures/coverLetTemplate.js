/**
 * Cover letter template generator
 * Creates a personalized cover letter using candidate and job information
 * Used for generating sample applications in testing environments
 * @param {String} candidateName - The name of the job applicant
 * @param {String} jobTitle - The position being applied for
 * @param {String} companyName - The name of the hiring company
 * @param {Array<String>} skills - List of relevant skills to highlight
 * @param {String} email - Contact email of the applicant
 * @returns {String} Formatted cover letter text
 */
export const generateCoverLetter = (
    candidateName,
    jobTitle,
    companyName,
    skills = [],
    email
) => {
    return `
Dear Hiring Manager,

My name is ${candidateName} and I am excited to apply for the ${jobTitle} position at ${companyName}. With experience and expertise in ${skills.join(", ")}, I am confident in my ability to contribute effectively to your team.

I have a proven track record of delivering results and am particularly drawn to ${companyName} because of its commitment to innovation and excellence. I am eager to bring my skills, experience, and passion to your organization and help drive future success.

Thank you for considering my application. I look forward to the opportunity to discuss how I can add value to your team.

Sincerely,
${candidateName}
Contact: ${email}
`;
};
