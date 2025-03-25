/**
 * Tech company fixture data
 * Contains sample employer accounts for testing and seeding the database
 * Each company includes contact information and company profile data
 * @type {Array<Object>}
 */
export const techCompanies = [
    {
        email: "careers@google.com",
        role: "employer",
        name: "Google",
        companyName: "Google",
        companyWebsite: "https://careers.google.com",
        companyDescription: "A global leader in search engines, advertising, and cloud computing.",
        phoneNumber: "(650) 253-0000"
    },
    {
        email: "careers@meta.com",
        role: "employer",
        name: "Meta",
        companyName: "Meta",
        companyWebsite: "https://www.metacareers.com",
        companyDescription: "Connecting people and communities through social media platforms.",
        phoneNumber: "(650) 543-4800"
    },
    {
        email: "careers@amazon.com",
        role: "employer",
        name: "Amazon",
        companyName: "Amazon",
        companyWebsite: "https://www.amazon.jobs",
        companyDescription: "World's largest e-commerce and cloud computing company.",
        phoneNumber: "01604 266878"
    },
    {
        email: "careers@apple.com",
        role: "employer",
        name: "Apple",
        companyName: "Apple",
        companyWebsite: "https://www.apple.com/careers",
        companyDescription: "Innovator in consumer electronics, software, and online services.",
        phoneNumber: "028 9024 9747"
    },
    {
        email: "careers@microsoft.com",
        role: "employer",
        name: "Microsoft",
        companyName: "Microsoft",
        companyWebsite: "https://careers.microsoft.com",
        companyDescription: "A leader in software, cloud computing, and enterprise solutions.",
        phoneNumber: "(0)800 026 0329"
    },
    {
        email: "careers@netflix.com",
        role: "employer",
        name: "Netflix",
        companyName: "Netflix",
        companyWebsite: "https://jobs.netflix.com",
        companyDescription: "Leading streaming entertainment service with global reach.",
        phoneNumber: "01120 241278"

    },
    {
        email: "careers@tesla.com",
        role: "employer",
        name: "Tesla",
        companyName: "Tesla",
        companyWebsite: "https://www.tesla.com/careers",
        companyDescription: "Electric vehicles, clean energy solutions, and AI-driven automation.",
        phoneNumber: "0162 845 0660"
    },
    {
        email: "careers@spacex.com",
        role: "employer",
        name: "SpaceX",
        companyName: "SpaceX",
        companyWebsite: "https://www.spacex.com/careers",
        companyDescription: "Revolutionizing space transportation and exploration.",
        phoneNumber: "(310) 363-6000"
    }
];

/**
 * Job description templates
 * Contains standard descriptions for common tech roles
 * Used for generating realistic job listings
 * @type {Object}
 */
export const techJobDetails = {
    "Software Engineer": "Develop scalable software applications, collaborate with cross-functional teams, and maintain code quality using best practices.",
    "Frontend Developer": "Design and implement user-facing features using modern frontend frameworks such as React and Angular.",
    "Backend Developer": "Build robust server-side logic, APIs, and manage database integrations to support scalable applications.",
    "Full Stack Developer": "Develop full-stack applications with a strong focus on both frontend and backend functionality.",
    "Data Scientist": "Analyze complex data sets to extract actionable insights, build predictive models, and collaborate with business stakeholders.",
    "Data Engineer": "Design and maintain data pipelines, optimize data storage solutions, and ensure high data quality and availability.",
    "Machine Learning Engineer": "Build and deploy machine learning models, fine-tune algorithms, and work with large-scale data sets.",
    "DevOps Engineer": "Automate CI/CD pipelines, manage cloud infrastructure, and ensure high availability and security of applications.",
    "Cloud Architect": "Design and implement cloud solutions using platforms like AWS, Azure, or GCP to optimize scalability and cost efficiency.",
    "Cybersecurity Analyst": "Monitor and secure networks, perform vulnerability assessments, and implement security best practices.",
    "Mobile App Developer": "Develop mobile applications for iOS and Android platforms using Swift, Kotlin, or React Native.",
    "Product Manager": "Define product requirements, work closely with development teams, and ensure timely delivery of product features.",
    "UI/UX Designer": "Create user-centric designs, conduct user research, and ensure a seamless user experience across digital platforms.",
    "Blockchain Developer": "Build decentralized applications, implement smart contracts, and ensure security and performance on blockchain networks.",
    "AR/VR Developer": "Develop immersive AR/VR experiences, optimize 3D graphics, and work with platforms like Unity or Unreal Engine.",
    "SWE Summer Intern": "Collaborate with engineering teams to develop software solutions, participate in code reviews, and learn from senior engineers. Gain hands-on experience with coding, debugging, and version control systems. Contribute to real-world projects and present findings to cross-functional teams.",
    "Research Developer": "Work with researchers and data scientists to design and develop innovative prototypes. Conduct exploratory data analysis, build proof-of-concept solutions, and contribute to research publications. Collaborate on algorithm development and stay up-to-date with emerging technologies."
};

/**
 * Common technical skills
 * List of in-demand technology skills for job listings
 * Used for job requirements and candidate matching
 * @type {Array<String>}
 */
export const techSkills = [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "React",
    "Node.js",
    "SQL",
    "NoSQL",
    "Machine Learning",
    "Deep Learning",
    "AWS",
    "Azure",
    "GCP",
    "Kubernetes",
    "Docker",
    "Cybersecurity",
    "Blockchain"
];
