# SwipeHire - Job Matching Platform 

![Joborithm Logo](https://dodoproject22-03.vercel.app/)

## Table of Contents
1. [About the Project](#about-the-project)
2. [Project Website](#project-website)
3. [Features](#features)
4. [Getting Started](#getting-started)
5. [Installation](#installation)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Technologies Used](#technologies-used)
9. [Architecture](#architecture)
10. [ML Components](#ml-components)
11. [Contributors](#contributors)

## About the Project

Joborithm is an innovative job hiring platform that combines modern UI/UX design with machine learning technology to create an intuitive job matching experience. The platform features a swipe-based interface for job seekers, AI-powered resume parsing, intelligent job matching using pre-trained models, and code assessment capabilities for employers.

## Project Website

Visit our website: [link.com](https://dodoproject22-03.vercel.app/)

## Features

- **Swipe-Based Job Matching**: Intuitive interface for job seekers to browse and apply to relevant positions
- **AI Resume Parser**: Powered by LLama 3.2 model to automatically extract information from candidate resumes
- **Intelligent Job Matching**: Integration with JobBERT v2 for accurate job recommendations
- **Code Assessment System**: Time-constrained coding challenges with visible and hidden test cases
- **Firebase Authentication**: Secure user authentication and management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/BGlowacki-kcl/dodo_project.git
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Environment setup:
   
   **Backend (.env file in backend directory)**:
   ```
   TODO
   ```
   
   **Frontend (.env file in frontend directory)**:
   ```
   TODO
   ```

## Running the Application

### Backend Server

```bash
(Root folder)
npm run dev
```

The backend will be available at `http://localhost:5000`.

### Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Testing

### Backend Tests

Our backend uses Jest for testing API endpoints, controllers, and in-memory database interactions.

```bash
(Root folder)
npm test
```

Coverage for these tests will be displayed in the CLI terminal after all tests run, along with the number of all tests and their status. The screenshot of coverage is also attached to the report.

### Frontend Tests

Our frontend tests utilize React Testing Library and Vitest to ensure correct UI behavior, component rendering, and user interactions. Coverage for these tests are attache to the report.

```bash
cd frontend
npm test
```

### Black-box Functional Tests

Our project consists of multiple functional tests utilizing Cypress. These tests ensure the correct end-to-end working of the application and tests functionality that normally would be technically hard to test. 

```bash
cd frontend
npm test:e2e
```

## Technologies Used

- **Frontend**: React.js, Vite.js, Material UI, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
- **ML Models**: 
  - JobBERT v2 (Hugging Face) for job matching
  - LLama 3.2 (3B parameters) for resume parsing
- **Deployment**:
  - Frontend: Vercel.com
  - Backend: Render.com
  - Database: MongoDB Atlas

## Architecture

Joborithm follows a modular architecture with separate layers for:

1. **Frontend**: User interface and client-side logic
2. **Backend**: API endpoints, business logic, and integration with third-party services
3. **Database**: MongoDB collections for users, job postings, applications, code assessments, code submissions, and shortlists.

## ML Components

### Job Matching Algorithm

The platform utilizes the JobBERT v2 model from Hugging Face for job matching. This pre-trained model analyzes job seeker profiles and job postings to provide a ranked list of suitable matches, which are then presented in the swipe interface.

### AI CV Parser

The CV parsing functionality uses LLama 3.2 model with 3B parameters. The process involves:

1. Extracting text from PDF resumes
2. Passing the text to the LLM
3. Generating structured JSON output with relevant information
4. Pre-populating profile forms with the extracted data

## Testing website manually

The Joborithm platform offers distinct user experiences for job seekers and employers. Follow these guides to explore the key functionality for each user type.

### JobSeeker Experience

1. Authentication

Navigate to the Login page using the navbar
Login with these credentials:
Email: john.doe@example.com
Password: Password123

2. Job Discovery

From the landing page, utilize search filters or select one of three quick-access job categories
After searching, browse through paginated job listings with additional filtering options
Click any job post to view detailed information
Add interesting positions to your shortlist via the "+" icon in the upper-right corner or the "Add to shortlist" button (shortlisted jobs are marked with a white checkmark)

3. User Dashboard

Access the Dashboard to view your application statistics and activity
The left sidebar navigation provides access to:
Shortlisted jobs
Application statistics and tracking
Profile management

4. Applications

From your shortlist, apply to jobs through the application interface
Submit customized cover letters for each position
Answer employer-specific screening questions

5. Profile Management

View and edit your professional information section by section
Alternatively, upload a new resume to have our AI parser automatically extract and update your profile information

6. Support

Use the Contact Us form to reach out to our support team directly
Log out via the dedicated button, which returns you to the landing page

### Employer Experience

1. Authentication

Navigate to the employer login page via the navbar and "Are you an employer? Sign in here" option
Login with these credentials:
Email: careers@google.com
Password: Password123
Dashboard Analytics

2. After logging in, view comprehensive recruitment analytics including:

Engagement rate on active job postings
Applications awaiting review
Acceptance rate metrics
Total active job postings
Application status distribution via interactive pie chart
Application timeline graph with job-specific filtering

3. Job Management

Access the Posts tab to view all your active job postings
Each job displays a quick-reference table showing applicants by status
Click on any job to view its applicant pool

4. Candidate Evaluation

Review detailed candidate profiles including:
Resume/CV
Skills assessment
Code challenge results (if applicable)
Responses to screening questions
Update application status (progress or reject) based on candidate evaluation

5. Support

Access the Contact Us page to communicate with our support team
Both interfaces are designed to provide intuitive, role-appropriate experiences that streamline the hiring process from either perspective.

## Contributors

- Bartosz Glowacki
- Nayel Muhammad Zahid
- Tianzhi Hou
- Saad Abdeen
- Jay TODO
- Muhammad Sharif
- Muhammad Chikhun

---

© 2025 Joborithm. All Rights Reserved.