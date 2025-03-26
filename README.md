# SwipeHire - Job Matching Platform 

![SwipeHire Logo](https://[to fill])

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

SwipeHire is an innovative job hiring platform that combines modern UI/UX design with advanced machine learning technology to create an intuitive job matching experience. The platform features a swipe-based interface for job seekers, AI-powered resume parsing, intelligent job matching using pre-trained models, and secure code assessment capabilities for employers.

## Project Website

Visit our website: [link.com](https://link.com)

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
   git clone https://github.com/[to fill]/SwipeHire.git
   cd SwipeHire
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Environment setup:
   
   **Backend (.env file in backend directory)**:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/swipehire
   JWT_SECRET=[to fill]
   FIREBASE_API_KEY=[to fill]
   HUGGINGFACE_API_KEY=[to fill]
   FRONTEND_URL=http://localhost:3000
   ```
   
   **Frontend (.env file in frontend directory)**:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_FIREBASE_API_KEY=[to fill]
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[to fill]
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=[to fill]
   ```

## Running the Application

### Backend Server

```bash
cd backend
npm run dev
```

The backend will be available at `http://localhost:5000`.

### Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Testing

### Backend Tests

Our backend uses Jest for testing API endpoints, controllers, and database interactions.

```bash
cd backend
npm test
```

This will run all backend tests and generate a coverage report which can be viewed in the `coverage/lcov-report` folder. Open `index.html` in that folder to see a detailed coverage summary.

### Frontend Tests

Our frontend tests utilize React Testing Library and Vitest to ensure correct UI behavior, component rendering, and user interactions.

```bash
cd frontend
npm test
```

### Code Assessment Tests

To test the code assessment system:

1. Log in as an employer account
2. Create a job posting with a code assessment requirement
3. Log in as a job seeker and apply to the job
4. Accept the application from the employer dashboard
5. The job seeker will then be able to access and complete the code assessment

The code assessment system includes both visible tests (5) and hidden tests (5). Results are displayed in real-time for visible tests, while hidden test results are only shown after submission.

## Technologies Used

- **Frontend**: React.js, Next.js, TailwindCSS
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

SwipeHire follows a modular architecture with separate layers for:

1. **Frontend**: User interface and client-side logic
2. **Backend**: API endpoints, business logic, and integration with third-party services
3. **Database**: MongoDB collections for users, job postings, and applications

## ML Components

### Job Matching Algorithm

The platform utilizes the JobBERT v2 model from Hugging Face for job matching. This pre-trained model analyzes job seeker profiles and job postings to provide a ranked list of suitable matches, which are then presented in the swipe interface.

### AI CV Parser

The CV parsing functionality uses LLama 3.2 model with 3B parameters. The process involves:

1. Extracting text from PDF resumes
2. Passing the text to the LLM
3. Generating structured JSON output with relevant information
4. Pre-populating profile forms with the extracted data

## Contributors

- [to fill]
- [to fill]

---

© 2025 SwipeHire. All Rights Reserved.