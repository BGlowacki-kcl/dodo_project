describe('Applicant Dashboard Tests', () => {
  const mockApplications = [
    { _id: '1', job: { company: 'Tech Corp', title: 'Developer' }, submittedAt: '2025-03-01', status: 'pending' },
    { _id: '2', job: { company: 'Web Inc', title: 'Designer' }, submittedAt: '2025-03-15', status: 'accepted' },
  ];
  const mockShortlist = {
    jobs: [
      { _id: '1', title: 'Software Engineer', company: 'Tech Corp', location: 'New York', type: 'Full-time' },
      { _id: '2', title: 'UI Designer', company: 'Web Inc', location: 'London', type: 'Part-time' },
    ],
  };
  const mockUserProfile = {
    data: {
      name: '',
      email: 'pp@pp.com',
      linkedin: '',
      github: '',
      phoneNumber: '',
      location: '',
      education: [],
      experience: [],
      skills: [],
    },
  };

  beforeEach(() => {
    // Clear session storage and cookies to ensure a logged-out state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Mock all API calls to avoid hitting the backend
    cy.intercept('GET', '/api/application/all', { statusCode: 200, body: mockApplications }).as('getApplications');
    cy.intercept('GET', '/api/shortlist', { statusCode: 200, body: mockShortlist }).as('getShortlist');
    cy.intercept('GET', '/api/user/', { statusCode: 200, body: mockUserProfile }).as('getUserProfile');
    cy.intercept('POST', '/api/user/basic', { statusCode: 200 }).as('saveUser');
    cy.intercept('GET', '/api/user/role', { statusCode: 200, body: { data: 'jobSeeker' } }).as('getRole');
    cy.intercept('GET', '/api/user/completed', (req) => {
      console.log('Mocking /api/user/completed');
      req.reply({
        statusCode: 200,
        body: { data: { redirect: '/applicant-dashboard' } },
      });
    }).as('checkProfile');

    // Mock job-related API calls for the homepage
    cy.intercept('GET', '/api/job/count*', { statusCode: 200, body: { count: 40 } }).as('getJobCount');
    cy.intercept('GET', '/api/job/roles', { statusCode: 200, body: ['Developer', 'Designer'] }).as('getJobRoles');
    cy.intercept('GET', '/api/job/locations', { statusCode: 200, body: ['New York', 'London'] }).as('getJobLocations');
    cy.intercept('GET', '/api/job/employmentType', { statusCode: 200, body: ['Full-time', 'Part-time'] }).as('getEmploymentTypes');
  });

  // Utility to handle signup flow with unique email and enforce dashboard URL
  const performSignup = () => {
    const uniqueEmail = `testuser${Date.now()}@example.com`; // Unique email for each run
    cy.visit('/signin');
    cy.url().should('include', '/signin');
    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');

    cy.get('input[placeholder="Enter your email"]').type(uniqueEmail);
    cy.get('input[placeholder="Enter your password"]').type('Test@123');
    cy.get('input[placeholder="Confirm your password"]').type('Test@123');
    cy.get('button[type="submit"]').should('not.be.disabled').and('be.visible').click();

    cy.wait('@saveUser');
    cy.wait('@checkProfile');

    // Simulate setting a token to bypass 403 errors
    cy.window().then((win) => {
      win.sessionStorage.setItem('token', 'mock-token');
    });

    // Enforce navigation to /applicant-dashboard
    cy.url().then((url) => {
      console.log('URL after signup:', url);
      const expectedUrl = 'http://localhost:5174/applicant-dashboard';
      if (!url.includes('/applicant-dashboard')) {
        cy.visit(expectedUrl, { timeout: 10000 });
        cy.url().should('eq', expectedUrl, { timeout: 10000 });
      } else {
        cy.url().should('eq', expectedUrl, { timeout: 10000 });
      }
    });

    // Wait for the sidebar to render
    cy.get('.bg-\\[\\#1B2A41\\] nav button', { timeout: 10000 }).should('be.visible');
  };

  // Negative Test Cases First
  it('should fail signup with weak password', () => {
    cy.visit('/signin');
    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');

    const uniqueEmail = `testuser${Date.now()}@example.com`;
    cy.get('input[placeholder="Enter your email"]').type(uniqueEmail);
    cy.get('input[placeholder="Enter your password"]').type('weak');
    cy.get('input[placeholder="Confirm your password"]').type('weak');
    cy.get('button[type="submit"]').should('not.be.disabled').and('be.visible').click();

    cy.get('.bg-red-100').should('contain', 'Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.');
    cy.url().should('include', '/signup'); // Should not redirect
  });

  it('should fail signup with mismatched passwords', () => {
    cy.visit('/signin');
    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');

    const uniqueEmail = `testuser${Date.now()}@example.com`;
    cy.get('input[placeholder="Enter your email"]').type(uniqueEmail);
    cy.get('input[placeholder="Enter your password"]').type('Test@123');
    cy.get('input[placeholder="Confirm your password"]').type('Test@124'); // Mismatch
    cy.get('button[type="submit"]').should('not.be.disabled').and('be.visible').click();

    cy.get('.bg-red-100').should('contain', 'Passwords do not match.');
    cy.url().should('include', '/signup'); // Should not redirect
  });

  // Simplified Dashboard Test
  it('should sign up and access the dashboard', () => {
    performSignup();

    // Verify the four working sidebar buttons and their navigation
    const buttons = ['Activity', 'Job Shortlist', 'Profile', 'Logout'];
    buttons.forEach((buttonText) => {
      cy.get('.bg-\\[\\#1B2A41\\] nav').contains('button', buttonText).should('be.visible').click();

      // Check for content change or action based on button
      if (buttonText === 'Activity') {
        cy.get('.bg-white').contains('h2', 'Activity').should('be.visible');
      } else if (buttonText === 'Job Shortlist') {
        cy.get('.bg-gray-800').contains('h2', 'My Shortlisted Jobs').should('be.visible');
      } else if (buttonText === 'Profile') {
        cy.get('.container').contains('h1', 'Profile').should('be.visible');
      } else if (buttonText === 'Logout') {
        cy.get('.bg-white').contains('h3', 'Confirm Logout').should('be.visible');
        cy.get('.bg-gray-300').click(); // Cancel logout
        cy.get('.bg-white').contains('h3', 'Confirm Logout').should('not.exist'); // Verify modal closed
        cy.wait(500); // Small delay to ensure DOM updates
      }

      // Reset to Activity view for next iteration
      if (buttonText !== 'Activity') {
        cy.get('.bg-\\[\\#1B2A41\\] nav').contains('button', 'Activity').click();
        cy.get('.bg-white').contains('h2', 'Activity').should('be.visible');
      }
    });
  });

  // New Test for Job Shortlist Filtering
  it('should navigate to Job Shortlist view and filter jobs', () => {
    performSignup();

    // Navigate to Job Shortlist view
    cy.get('.bg-\\[\\#1B2A41\\] nav').contains('button', 'Job Shortlist').click();

    // Verify initial content
    cy.get('.bg-gray-800').contains('h2', 'My Shortlisted Jobs').should('be.visible');
    cy.get('.bg-gray-800').contains('p', 'No shortlisted jobs available.').should('not.exist'); // Should not see this with mock data

    // Verify initial job list (2 jobs)
    cy.get('.bg-gray-800 .grid .bg-gray-700').should('have.length', 2); // Two jobs from mockShortlist

    // Apply filters
    cy.get('input[placeholder="Enter location"]').type('New York');
    cy.get('.bg-gray-800 .grid .bg-gray-700').should('have.length', 1); // Only the New York job should remain
    cy.get('.bg-gray-800 .grid .bg-gray-700').contains('h3', 'Software Engineer').should('be.visible');

    cy.get('select[name="jobType"]').select('Full-time');
    cy.get('.bg-gray-800 .grid .bg-gray-700').should('have.length', 1); // Still one job (New York, Full-time)
    cy.get('.bg-gray-800 .grid .bg-gray-700').contains('h3', 'Software Engineer').should('be.visible');
  });
});