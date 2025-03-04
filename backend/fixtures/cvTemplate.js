export const generateCV = (name, education, experience, email) => {
    return `
    ${name.toUpperCase()}
    
    Location: London

    Education
    ${education.map(ed => `- ${ed.degree} in ${ed.fieldOfStudy} from ${ed.institution} (${ed.startDate.getFullYear()} - ${ed.endDate.getFullYear()})`).join("\n")}

    Experience
    ${experience.map(exp => `- ${exp.title} at ${exp.company} (${exp.startDate.getFullYear()} - ${exp.endDate.getFullYear()}): ${exp.description}`).join("\n")}

    Skills
    - JavaScript, Python, C++
    - Cloud Computing (AWS, GCP)
    - Machine Learning & Data Science
    - Agile & Scrum Methodologies

    Projects
    - Developed a full-stack job portal using MERN stack.
    - Built an AI-based resume parser with Python and NLP.
    - Contributed to open-source projects in web development.

    Contact: [${email}] | LinkedIn: [linkedin.com/in/example] | GitHub: [github.com/example]
    `;
};
