import { faker } from "@faker-js/faker";
import { projectList } from "./projectFixtures.js";

/**
 * CV template generator
 * Creates a formatted curriculum vitae from candidate information
 * Used for generating sample resumes in testing environments
 * @param {String} name - The name of the job applicant
 * @param {String} location - The geographical location of the applicant
 * @param {Array<Object>} education - Educational qualifications with institution and dates
 * @param {Array<Object>} experience - Work history with company and role details
 * @param {String} email - Contact email of the applicant
 * @param {Array<String>} skills - List of relevant technical skills
 * @returns {String} Formatted CV text
 */
export const generateCV = (name, location, education, experience, email, skills = []) => {
    /**
     * Select random projects from project fixtures
     * Adds variety to generated CVs
     */
    const selectedProjects = faker.helpers.arrayElements(projectList, 3);

    return `
${name.toUpperCase()}

Location: ${location}

Education
${education
        .map(
            ed =>
                `- ${ed.degree} in ${ed.fieldOfStudy} from ${ed.institution} (${ed.startDate.getFullYear()} - ${ed.endDate.getFullYear()})`
        )
        .join("\n")}

Experience
${experience
        .map(
            exp =>
                `- ${exp.title} at ${exp.company} (${exp.startDate.getFullYear()} - ${exp.endDate.getFullYear()}): ${exp.description}`
        )
        .join("\n")}

Skills
${skills.map(skill => `- ${skill}`).join("\n")}

Projects
${selectedProjects.map(project => `- ${project}`).join("\n")}

Contact: [${email}] | LinkedIn: [linkedin.com/in/example] | GitHub: [github.com/example]
`;
};
