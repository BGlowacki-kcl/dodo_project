// cypress/e2e/job-details.cy.js

describe('Job Details (UI Login) via Search Results', () => {
  before(() => {
    // Set up authentication session that will be reused across tests
    cy.session('user-session', () => {
      // Intercept the role check
      cy.intercept(
        'GET',
        '**/api/user/role?email=john.doe@example.com*',
        { success: true, data: 'jobSeeker' }
      ).as('roleCheck');

      // Intercept the profile completion check
      cy.intercept('GET', '**/api/user/completed', {
        success: true,
        data: { status: true }
      }).as('profileCheck');

      // Intercept the login request
      cy.intercept('POST', '**/api/auth/login', {
        success: true,
        data: { token: 'fake_jwt_token' }
      }).as('loginRequest');

      // Visit the sign-in page
      cy.visit('/signin');

      // Fill the login form
      cy.get('input[placeholder="Enter your email"]').type('john.doe@example.com');
      cy.get('input[placeholder="Enter your password"]').type('Password123');
      cy.get('button[type="submit"]').click();

      // Wait for authentication requests to complete
      cy.wait('@roleCheck');
      cy.wait('@profileCheck');

      // Validate we're successfully logged in
      cy.url().should('not.include', '/signin');

      // Manually set the token in localStorage for validation
      cy.window().then(win => {
        win.localStorage.setItem('token', 'fake_jwt_token');
      });
    }, {
      validate() {
        // Check for token in localStorage to validate the session
        cy.window().then(win => {
          expect(win.localStorage.getItem('token')).to.exist;
        });
      }
    });
  });

  beforeEach(() => {
    // Restore the session - requires setup function even if not used
    cy.session('user-session', () => {
      // This function won't run if the session exists and is valid
      cy.intercept(
        'GET',
        '**/api/user/role?email=john.doe@example.com*',
        { success: true, data: 'jobSeeker' }
      ).as('roleCheck');

      cy.intercept('GET', '**/api/user/completed', {
        success: true,
        data: { status: true }
      }).as('profileCheck');

      cy.intercept('POST', '**/api/auth/login', {
        success: true,
        data: { token: 'fake_jwt_token' }
      }).as('loginRequest');

      cy.visit('/signin');
      cy.get('input[placeholder="Enter your email"]').type('john.doe@example.com');
      cy.get('input[placeholder="Enter your password"]').type('Password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@roleCheck');
      cy.wait('@profileCheck');

      cy.window().then(win => {
        win.localStorage.setItem('token', 'fake_jwt_token');
      });
    }, {
      validate() {
        cy.window().then(win => {
          expect(win.localStorage.getItem('token')).to.exist;
        });
      }
    });
    
    // Update intercepts to match the actual API calls made by the SearchResults page
    cy.intercept('GET', '**/api/job?deadlineValid=true', { 
      statusCode: 200,
      body: { 
        success: true, 
        message: 'Jobs retrieved successfully',
        data: require('../fixtures/jobs.json') 
      }
    }).as('fetchJobs');
    
    cy.intercept('GET', '**/api/job/roles', { 
      statusCode: 200,
      body: { 
        success: true, 
        message: 'Job roles retrieved successfully',
        data: require('../fixtures/jobRoles.json') 
      }
    }).as('getJobRoles');
    
    cy.intercept('GET', '**/api/job/locations', { 
      statusCode: 200,
      body: { 
        success: true, 
        message: 'Job locations retrieved successfully',
        data: require('../fixtures/jobLocations.json') 
      }
    }).as('getJobLocations');
    
    cy.intercept('GET', '**/api/job/employmentType', { 
      statusCode: 200,
      body: { 
        success: true, 
        message: 'Job types retrieved successfully',
        data: require('../fixtures/jobTypes.json') 
      }
    }).as('getJobTypes');
    
    cy.intercept('GET', '**/api/job/company', { 
      statusCode: 200,
      body: { 
        success: true, 
        message: 'Companies retrieved successfully',
        data: require('../fixtures/companies.json') 
      }
    }).as('getCompanies');
    
    cy.intercept('GET', '**/api/job/salary-bounds', {
      body: { success: true, data: { minSalary: 30000, maxSalary: 150000 } }
    }).as('getSalaryBounds');
    cy.intercept('GET', '**/api/shortlist/jobs', { 
      body: { success: true, data: { jobs: [] } }
    }).as('getShortlist');
    
    // Job details intercept
    cy.intercept('GET', '**/api/job/job1', { fixture: 'jobDetails.json' }).as('jobDetails');
  });

  it('should navigate from search results to job details and display info', () => {
    // Intercept the role check for this specific test
    cy.intercept(
      'GET',
      '**/api/user/role?email=john.doe@example.com*',
      { success: true, data: 'jobSeeker' }
    ).as('roleCheck');

    // Intercept the profile completion check for this specific test
    cy.intercept('GET', '**/api/user/completed', {
      success: true,
      data: { status: true }
    }).as('profileCheck');

    // Intercept job details with proper success and data structure
    cy.intercept('GET', '**/api/job/job1', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'job1',
          title: 'Frontend Engineer',
          company: 'Acme Corp',
          location: 'San Francisco, CA',
          employmentType: 'Full-time',
          experienceLevel: 'Mid-Senior',
          salaryRange: { min: 80000, max: 120000 },
          description: 'Join our team as a Frontend Engineer to build innovative web applications.',
          requirements: ['JavaScript', 'React', 'CSS'],
          deadline: '2023-12-31'
        }
      }
    }).as('jobDetails');

    // Go to the search results page
    cy.visit('/search-results');
    
    // Wait for the main jobs data to load
    cy.wait(['@fetchJobs', '@getShortlist']).then(() => {
      cy.log('Jobs data loaded successfully');
    });

    // Wait for filter-related data to load (in case they're needed)
    cy.wait(['@getJobRoles', '@getJobLocations', '@getJobTypes', '@getCompanies'], { timeout: 10000 })
      .its('length')
      .should('eq', 4);

    // Target the specific JobCard for job1
    cy.contains('.bg-white.border.border-gray-200.rounded-xl', 'Frontend Engineer')
      .should('be.visible')
      .should('contain', 'Acme Corp')
      .click();

    // Check that navigation occurred
    cy.url().should('include', '/user/jobs/details/job1');

    // Wait for the job details fixture and check response
    cy.wait('@jobDetails').then((interception) => {
      cy.log('Job Details Response:', JSON.stringify(interception.response.body));
    });

    // Add a longer timeout since the job details might take time to render
    cy.contains('Frontend Engineer', { timeout: 10000 }).should('be.visible');
  });

  it('should allow filtering jobs', () => {
    // Visit the search results page
    cy.visit('/search-results');
    
    // Wait for the jobs to load
    cy.wait('@fetchJobs');
    
    // Click the "Open Filters" button
    cy.contains('button', 'Open Filters').click();
    
    // Verify the filter popup appears
    cy.contains('h2', 'Advanced Filters').should('be.visible');
    
    // Check a filter option (e.g., select a job type)
    cy.contains('Job Types')
      .parent()
      .find('label')
      .first()
      .click();
    
    // Click Apply button to apply the filters
    cy.contains('button', 'Apply').click();
    
    // Verify the filter popup disappears
    cy.contains('h2', 'Advanced Filters').should('not.exist');
    
    // Wait for the filtered jobs to load
    cy.wait('@fetchJobs');
  });

  it('should allow shortlisting the job', () => {
    // Intercept job details with proper success and data structure
    cy.intercept('GET', '**/api/job/job1', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'job1',
          title: 'Frontend Engineer',
          company: 'Acme Corp',
          location: 'San Francisco, CA',
          employmentType: 'Full-time',
          experienceLevel: 'Mid-Senior',
          salaryRange: { min: 80000, max: 120000 },
          description: 'Join our team as a Frontend Engineer to build innovative web applications.',
          requirements: ['JavaScript', 'React', 'CSS'],
          deadline: '2023-12-31'
        }
      }
    }).as('jobDetails');

    // Intercept the PUT call to add job1 to shortlist
    cy.intercept('PUT', '**/api/shortlist/addjob?jobid=job1', {
      statusCode: 200,
      body: {
        success: true,
        data: { jobs: [{ _id: 'job1' }] }
      }
    }).as('addShortlist');

    // Start at search results page
    cy.visit('/search-results');
    cy.wait('@fetchJobs');

    // Click "Frontend Engineer" - navigation happens via React Router, not window.open
    cy.contains('Frontend Engineer').click();
    
    // Verify URL changed to job details page
    cy.url().should('include', '/user/jobs/details/job1');
    
    // Wait for the job details to load and check response
    cy.wait('@jobDetails').then((interception) => {
      cy.log('Job Details Response:', JSON.stringify(interception.response.body));
    });
    
    // Add a longer timeout since the job details might take time to render
    cy.contains('Frontend Engineer', { timeout: 10000 }).should('be.visible');

    // The button says "Add to Shortlist"
    cy.contains('button', 'Add to Shortlist').should('be.visible').click();
    cy.wait('@addShortlist').its('response.statusCode').should('eq', 200);

    // Now the UI might say "Remove from Shortlist"
    cy.contains('Remove from Shortlist').should('be.visible');
  });

  it('should allow applying and navigate to /apply/:jobId', () => {
    // Add proper job details intercept for this test
    cy.intercept('GET', '**/api/job/job1', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'job1',
          title: 'Frontend Engineer',
          company: 'Acme Corp',
          location: 'San Francisco, CA',
          employmentType: 'Full-time',
          experienceLevel: 'Mid-Senior',
          salaryRange: { min: 80000, max: 120000 },
          description: 'Join our team as a Frontend Engineer to build innovative web applications.',
          requirements: ['JavaScript', 'React', 'CSS'],
          deadline: '2026-12-31', // Updated to future date
          questions: [  // Added questions array
            { _id: 'q1', questionText: 'Why do you want to work with us?' },
            { _id: 'q2', questionText: 'Describe your relevant experience' },
            { _id: 'q3', questionText: 'What are your strengths?' }
          ]
        }
      }
    }).as('jobDetails');

    // Intercept the POST /api/application/apply with proper success flag
    cy.intercept('POST', '**/api/application/apply', {
      statusCode: 200,
      body: {
        success: true,
        data: { _id: 'fakeAppId', status: 'Applying' }
      }
    }).as('applyJob');

    // Intercept user applications to show that no application exists yet
    cy.intercept('GET', '**/api/application/all', {
      statusCode: 200,
      body: {
        success: true,
        data: [] // No applications yet
      }
    }).as('getApplications');

    // Start from search results
    cy.visit('/search-results');
    cy.wait('@fetchJobs');

    // Navigate to job details
    cy.contains('Frontend Engineer').click();
    
    // Verify URL changed to job details page
    cy.url().should('include', '/user/jobs/details/job1');
    
    // Wait for the job details to load and check response
    cy.wait('@jobDetails').then((interception) => {
      cy.log('Job Details Response:', JSON.stringify(interception.response.body));
    });
    
    // Wait for applications to be checked
    cy.wait('@getApplications');

    // Verify the page has loaded before clicking Apply
    cy.contains('Frontend Engineer', { timeout: 10000 }).should('be.visible');
    
    // Find and click the "Apply Now" button
    cy.contains('button', 'Apply Now').should('be.visible').click();
    
    // Wait for the API request to complete
    cy.wait('@applyJob').then((interception) => {
      cy.log('Apply response:', JSON.stringify(interception.response.body));
    });
    
    // Verify we're on the apply page
    cy.url().should('include', '/apply/job1');
  });

  it('should complete the application process on the Apply page', () => {
    // Remove the problematic global request logging intercept
    // Instead, add specific logging in each intercept's response handlers
    
    // Intercept job questions with correct format
    cy.intercept('GET', '**/api/job/questions?jobId=job1', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'q1', questionText: 'Why do you want to work with us?' },
          { _id: 'q2', questionText: 'Describe your relevant experience' },
          { _id: 'q3', questionText: 'What are your strengths?' }
        ]
      }
    }).as('getJobQuestions');

    // Ensure we intercept question requests without query params too
    cy.intercept('GET', '**/api/job/questions', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'q1', questionText: 'Why do you want to work with us?' },
          { _id: 'q2', questionText: 'Describe your relevant experience' },
          { _id: 'q3', questionText: 'What are your strengths?' }
        ]
      }
    }).as('getJobQuestionsAlt');

    // Intercept user applications call with an existing application for job1
    cy.intercept('GET', '**/api/application/all', {
      success: true,
      data: [{
        _id: 'app123',
        status: 'Applying',
        job: { 
          _id: 'job1', 
          title: 'Frontend Engineer',
          company: 'Acme Corp',
          questions: [
            { _id: 'q1', questionText: 'Why do you want to work with us?' },
            { _id: 'q2', questionText: 'Describe your relevant experience' },
            { _id: 'q3', questionText: 'What are your strengths?' }
          ]
        },
        coverLetter: '',
        answers: []
      }]
    }).as('getAllApplications');

    // Intercept job details to include questions
    cy.intercept('GET', '**/api/job/job1', {
      statusCode: 200,
      body: {
        success: true, 
        data: {
          _id: 'job1',
          title: 'Frontend Engineer',
          company: 'Acme Corp',
          location: 'San Francisco, CA',
          employmentType: 'Full-time',
          experienceLevel: 'Mid-Senior',
          salaryRange: { min: 80000, max: 120000 },
          description: 'Join our team as a Frontend Engineer to build innovative web applications.',
          requirements: ['JavaScript', 'React', 'CSS'],
          deadline: '2026-12-31',
          questions: [
            { _id: 'q1', questionText: 'Why do you want to work with us?' },
            { _id: 'q2', questionText: 'Describe your relevant experience' },
            { _id: 'q3', questionText: 'What are your strengths?' }
          ]
        }
      }
    }).as('getJobDetails');

    // Intercept the getApplicationById call with detailed job
    cy.intercept('GET', '**/api/application/byId?id=app123', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'app123',
          job: { 
            _id: 'job1', 
            title: 'Frontend Engineer',
            company: 'Acme Corp',
            questions: [
              { _id: 'q1', questionText: 'Why do you want to work with us?' },
              { _id: 'q2', questionText: 'Describe your relevant experience' },
              { _id: 'q3', questionText: 'What are your strengths?' }
            ]
          },
          status: 'Applying',
          coverLetter: '',
          answers: []
        }
      }
    }).as('getApplicationById');

    // Additional intercept for shortlisted jobs
    cy.intercept('GET', '**/api/shortlist/jobs', {
      success: true,
      data: { jobs: [] }
    }).as('getShortlist');

    // Intercept application saving
    cy.intercept('PUT', '**/api/application/save', {
      statusCode: 200,
      body: {
        success: true,
        data: { 
          message: 'Application saved successfully',
          _id: 'app123'
        }
      }
    }).as('saveApplication');

    // Intercept application submission
    cy.intercept('PUT', '**/api/application/submit', {
      statusCode: 200,
      body: {
        success: true,
        data: { message: 'Application submitted successfully' }
      }
    }).as('submitApplication');

    // Start directly from the apply page
    cy.visit('/apply/job1');
    
    // Wait for critical data to load and log responses
    cy.wait('@getJobQuestions');
    cy.log('Job Questions were requested');
    
    cy.wait('@getApplicationById');
    cy.log('Application by ID was requested');
    
    // Log current URL without nesting - use separate commands
    cy.url().then(url => {
      cy.log('Current URL:', url);
    });

    // Wait for cover letter section to be visible
    cy.contains('Cover Letter', { timeout: 15000 }).should('be.visible');
    
    // Fill in cover letter
    cy.get('textarea').first().should('be.visible').clear()
      .type('I am excited to apply for this position because I believe my skills and experience make me an excellent fit.');
    
    // Debug Questions section without nesting promises
    cy.contains('h2', 'Questions').should('exist');
    cy.contains('h2', 'Questions').then($el => {
      cy.log('Questions section HTML:', $el.parent().html());
    });
    
    // Continue with the rest of the test
    // Find questions section and answer the first question
    cy.contains('h2', 'Questions').should('be.visible');
    
    // Get all textareas in the questions section
    cy.contains('h2', 'Questions')
      .parent()
      .find('textarea')
      .should('be.visible')
      .first()
      .clear()
      .type('I want to work with your company because of your innovative approach to technology and strong company culture.');
    
    // Click Next button
    cy.contains('button', 'Next').should('be.visible').click({force: true});
    
    // Answer the second question
    cy.contains('h2', 'Questions')
      .parent()
      .find('textarea')
      .should('be.visible') 
      .first()
      .clear()
      .type('I have 3 years of experience in frontend development, working with React and modern JavaScript.');
    
    // Click Next again
    cy.contains('button', 'Next').should('be.visible').click({force: true});
    
    // Answer the third question
    cy.contains('h2', 'Questions')
      .parent()
      .find('textarea')
      .should('be.visible')
      .first()
      .clear()
      .type('My strengths include problem-solving, attention to detail, and strong communication skills.');
    
    // Save the application
    cy.contains('button', 'Save').should('be.visible').click({force: true});
    
    // Wait for the save request with longer timeout
    cy.wait('@saveApplication', { timeout: 10000 });
    
    // Submit the application
    cy.contains('button', 'Submit Application').should('be.visible').click({force: true});
    cy.wait('@submitApplication');
    
    // Verify we're redirected back to the job details page after submission
    cy.url().should('include', '/user/jobs/details/job1');
    
    // ---- NEW CODE: Navigate to dashboard and check application ----
    
    // Set up intercepts for dashboard navigation
    cy.intercept('GET', '**/api/application/all', {
      success: true,
      data: [{
        _id: 'app123',
        status: 'Applied', // Note: status changed from 'Applying' to 'Applied' after submission
        job: { 
          _id: 'job1', 
          title: 'Frontend Engineer',
          company: 'Tech Company' 
        },
        submittedAt: new Date().toISOString(),
        coverLetter: 'I am excited to apply for this position...'
      }]
    }).as('getDashboardApplications');
    
    cy.intercept('GET', '**/api/shortlist', {
      success: true,
      data: { jobs: [] }
    }).as('getShortlist');
    
    // Set up intercept for application details page
    cy.intercept('GET', '**/api/application/byId?id=app123', {
      success: true,
      data: {
        id: 'app123',
        status: 'Applied',
        coverLetter: 'I am excited to apply for this position because I believe my skills and experience make me an excellent fit.',
        submittedAt: new Date().toISOString(),
        job: {
          _id: 'job1',
          title: 'Frontend Engineer',
          company: 'Tech Company',
          location: 'San Francisco, CA',
          employmentType: 'Full-time',
          experienceLevel: 'Mid-Senior',
          description: 'Join our team as a Frontend Engineer to build innovative web applications.',
          requirements: ['JavaScript', 'React', 'CSS'],
          questions: [
            { _id: 'q1', questionText: 'Why do you want to work with us?' },
            { _id: 'q2', questionText: 'Describe your relevant experience' },
            { _id: 'q3', questionText: 'What are your strengths?' }
          ]
        },
        answers: [
          { 
            questionId: 'q1', 
            answerText: 'I want to work with your company because of your innovative approach to technology and strong company culture.' 
          },
          {
            questionId: 'q2',
            answerText: 'I have 3 years of experience in frontend development, working with React and modern JavaScript.'
          },
          {
            questionId: 'q3',
            answerText: 'My strengths include problem-solving, attention to detail, and strong communication skills.'
          }
        ]
      }
    }).as('getApplicationDetails');
    
    // Navigate to dashboard through navbar
    cy.get('nav').contains('Dashboard').click();
    
    // Wait for applications to load
    cy.wait('@getDashboardApplications');
    
    // Verify we're on the dashboard page
    cy.url().should('include', '/applicant-dashboard');
    
    // Check that "Activity" sidebar button is active
    cy.get('.bg-\\[\\#1B2A41\\] nav button')
      .contains('Activity')
      .should('have.class', 'bg-[#324A5F]');
    
    // Find the application card for Frontend Engineer and click on it
    cy.contains('.border.border-gray-300.rounded-lg', 'Frontend Engineer')
      .should('be.visible')
      .click();
    
    // Wait for application details to load
    cy.wait('@getApplicationDetails');
    
    // Verify navigation to the specific application details page
    cy.url().should('include', '/user/applications/app123');
    
    // Verify application details are displayed
    cy.contains('Application Details').should('be.visible');
    cy.contains('Frontend Engineer').should('be.visible');
    cy.contains('Tech Company').should('be.visible');
    cy.contains('I am excited to apply for this position').should('be.visible');
    
    // Check for a modal and close it if present (with flexibility for different implementations)
    cy.log('Checking for congratulations modal...');
    
    // Check for modal with different possible selectors with a short timeout to avoid long waits if not present
    cy.get('body').then($body => {
      // Check if any modal-like element containing "Congratulations" is visible
      if ($body.find('.bg-white:contains("Congratulations")').length ||
          $body.find('div[role="dialog"]').length ||
          $body.find('.modal').length ||
          $body.find(':contains("Your application status has been updated")').length) {
        
        cy.log('Modal detected, attempting to close it');
        
        // Try multiple strategies to find and close the modal
        cy.get('body').then(() => {
          // First attempt: Look for any element containing "Close" text
          cy.contains('button', 'Close', { timeout: 5000 })
            .first()
            .click({ force: true })
            .then(() => {
              cy.log('Closed modal using "Close" button');
            });
        });
      } else {
        cy.log('No modal detected, continuing with test');
      }
    });
    
    // Short pause to ensure UI stabilizes after modal interaction
    cy.wait(1000);
    
    // Verify answers to questions are displayed
    cy.contains('Questions and Answers').should('be.visible');
    
    // Check first question and answer
    cy.contains('Why do you want to work with us?')
      .should('be.visible')
      .click() // Click to expand the answer
      .then(() => {
        // Now check for the answer text within the expanded section
        cy.contains('I want to work with your company because of your innovative approach to technology and strong company culture.')
          .should('be.visible');
      });
    
    // Check second question and answer
    cy.contains('Describe your relevant experience')
      .should('be.visible')
      .click() // Click to expand the answer
      .then(() => {
        // Now check for the answer text within the expanded section
        cy.contains('I have 3 years of experience in frontend development, working with React and modern JavaScript.')
          .should('be.visible');
      });
    
    // Check third question and answer
    cy.contains('What are your strengths?')
      .should('be.visible')
      .click() // Click to expand the answer
      .then(() => {
        // Now check for the answer text within the expanded section
        cy.contains('My strengths include problem-solving, attention to detail, and strong communication skills.')
          .should('be.visible');
      });
  });

  // Clear sessions properly after tests complete
  after(() => {
    // Clear cookies
    cy.clearCookies();
    
    // Clear localStorage including session data
    cy.clearLocalStorage();
    
    // If using Firebase auth, explicitly clear that too
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });
});
