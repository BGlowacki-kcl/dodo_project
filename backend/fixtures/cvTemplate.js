export const generateCV = (name, location, education, experience, email, skills = [], projects = []) => {

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
${projects.map(project => `- ${project}`).join("\n")}

Contact: [${email}] | LinkedIn: [linkedin.com/in/example] | GitHub: [github.com/example]
`;
};
