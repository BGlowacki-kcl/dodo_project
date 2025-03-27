describe('Search Results Page', () => {
  beforeEach(() => {
    // Set up auth session
    cy.window().then(win => {
      win.localStorage.setItem('token', 'fake_jwt_token');
      win.sessionStorage.setItem('token', 'fake_jwt_token');
    });
    
    // Intercept API calls with proper response format
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
      body: { success: true, message: 'Job roles retrieved', data: require('../fixtures/jobRoles.json') }
    }).as('getJobRoles');
    
    cy.intercept('GET', '**/api/job/locations', { 
      statusCode: 200,
      body: { success: true, message: 'Job locations retrieved', data: require('../fixtures/jobLocations.json') }
    }).as('getJobLocations');
    
    cy.intercept('GET', '**/api/job/employmentType', { 
      statusCode: 200,
      body: { success: true, message: 'Job types retrieved', data: require('../fixtures/jobTypes.json') }
    }).as('getJobTypes');
    
    cy.intercept('GET', '**/api/job/company', { 
      statusCode: 200,
      body: { success: true, message: 'Companies retrieved', data: require('../fixtures/companies.json') }
    }).as('getCompanies');
    
    cy.intercept('GET', '**/api/shortlist/jobs', {
      statusCode: 200,
      body: { success: true, data: { jobs: [] } }
    }).as('getShortlist');

    cy.intercept('GET', '**/api/job/salary-bounds', {
      statusCode: 200,
      body: { success: true, data: { minSalary: 30000, maxSalary: 150000 } }
    }).as('getSalaryBounds');
    
    // Visit the page
    cy.visit('/search-results');
  });

  it('should display jobs from fixtures', () => {
    // Wait for all necessary API calls
    cy.wait(['@fetchJobs', '@getJobRoles', '@getJobLocations', '@getJobTypes', '@getCompanies', '@getSalaryBounds']);
    
    // Log response for debugging
    cy.wait('@fetchJobs').then((interception) => {
      cy.log('Jobs Response:', JSON.stringify(interception.response.body));
    });
    
    // Check if jobs are rendered - using better selectors that match the actual page
    cy.get('[data-testid="job-cards-container"]').should('exist');
    cy.contains('Frontend Engineer').should('be.visible');
    cy.contains('Backend Engineer').should('be.visible');
  });

  it('should filter jobs correctly', () => {
    // Wait for initial jobs to load
    cy.wait(['@fetchJobs', '@getJobRoles', '@getJobLocations', '@getJobTypes', '@getCompanies', '@getSalaryBounds']);
    
    // Intercept filtered jobs request
    cy.intercept('GET', '**/api/job/search**', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Jobs retrieved successfully',
        data: [require('../fixtures/jobs.json')[0]] // Only return the first job
      }
    }).as('filteredJobs');
    
    // Open filters
    cy.contains('button', 'Open Filters').click();
    
    // Select a filter option (using more specific selectors)
    cy.contains('Job Types')
      .parent()
      .contains('Full-Time')
      .parent()
      .find('input[type="checkbox"]')
      .click({force: true});
    
    // Apply filters
    cy.contains('button', 'Apply').click();
    
    // Wait for filtered results
    cy.wait('@filteredJobs');
    
    // Should show only Frontend Engineer job
    cy.contains('Frontend Engineer').should('be.visible');
    cy.contains('Backend Engineer').should('not.exist');
  });

  it('shows job details when clicking on a job', () => {
    // Wait for all important API calls
    cy.wait(['@fetchJobs', '@getJobRoles', '@getJobLocations', '@getJobTypes', '@getCompanies', '@getSalaryBounds']);
    
    // Set up job details intercept for job1
    cy.intercept('GET', '**/api/job/job1', { 
      statusCode: 200,
      body: {
        success: true,
        message: 'Job retrieved successfully',
        data: require('../fixtures/jobDetails.json')
      }
    }).as('getJobDetails');

    // Since we're using React Router navigation, we need to check URL changes directly
    cy.contains('Frontend Engineer').click();
    
    // Check URL directly instead of using window.open stub
    cy.url().should('include', '/user/jobs/details/job1');
    
    // Wait for job details to load
    cy.wait('@getJobDetails');
    
    // Verify job details are displayed
    cy.contains('Frontend Engineer').should('exist');
    cy.contains('Acme Corp').should('exist');
  });
});
