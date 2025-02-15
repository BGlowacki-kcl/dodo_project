import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.HUGGING_FACE_API_KEY;
const modelId = "TechWolf/JobBERT-v2";
const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;

export async function query(data) {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}

query({
    inputs: {
        source_sentence: "Software Engineer - Backend (Python)\n" +
            "Company: Tech Innovators Ltd.\n" +
            "Location: London, UK\n" +
            "\n" +
            "Description:\n" +
            "We are looking for a skilled Backend Software Engineer to join our team. You will be responsible for developing high-performance APIs, optimizing database queries, and ensuring system scalability.\n" +
            "\n" +
            "Responsibilities:\n" +
            "- Develop and maintain RESTful APIs using Python (Django/Flask).\n" +
            "- Optimize database queries for improved performance and scalability.\n" +
            "- Work with caching mechanisms like Redis or Memcached.\n" +
            "- Collaborate with frontend developers and DevOps engineers.\n" +
            "\n" +
            "Requirements:\n" +
            "- 3+ years of experience in backend development.\n" +
            "- Strong proficiency in Python, Django, Flask.\n" +
            "- Experience with PostgreSQL, MySQL, and database optimization techniques.\n" +
            "- Familiarity with cloud services (AWS, GCP) is a plus.\n" +
            "- Strong understanding of software development best practices.",
        sentences: [
            "John Doe\n" +
            "Email: johndoe@example.com\n" +
            "Phone: +44 1234 567890\n" +
            "LinkedIn: linkedin.com/in/johndoe\n" +
            "\n" +
            "Professional Summary:\n" +
            "Software Engineer with 3+ years of experience in backend development, specializing in Python, Django, and SQL. Passionate about building scalable web applications and optimizing database performance.\n" +
            "\n" +
            "Work Experience:\n" +
            "Software Engineer | XYZ Tech Ltd. | June 2021 - Present\n" +
            "- Developed RESTful APIs using Django and Flask, reducing response times by 30%.\n" +
            "- Implemented caching strategies with Redis, improving system efficiency.\n" +
            "- Led a migration from PostgreSQL to MySQL, enhancing database scalability.\n" +
            "\n" +
            "Software Developer Intern | ABC Solutions | Jan 2020 - June 2021\n" +
            "- Built data visualization dashboards using Python and Matplotlib.\n" +
            "- Assisted in developing a recommendation engine using machine learning techniques.\n" +
            "\n" +
            "Education:\n" +
            "BSc Computer Science | University of London | 2018 - 2021\n" +
            "\n" +
            "Skills:\n" +
            "- Programming: Python, Django, Flask, SQL, JavaScript\n" +
            "- Databases: PostgreSQL, MySQL, Redis\n" +
            "- Tools: Docker, Git, AWS, CI/CD pipelines"
        ]
    }
}).then((response) => {
    console.log(JSON.stringify(response, null, 2));
});