// cypress/e2e/landingPage.cy.js

describe('Landing Page', () => {
  beforeEach(() => {
    // Mock API responses with correct format { success: true, data: ... }
    cy.intercept('GET', '/api/job/count/type?type=Internship', { 
      body: { success: true, data: 26 }
    }).as('getInternshipCount');
    cy.intercept('GET', '/api/job/count/type?type=Placement', { 
      body: { success: true, data: 17 }
    }).as('getPlacementCount');
    cy.intercept('GET', '/api/job/count/type?type=Graduate', { 
      body: { success: true, data: 23 }
    }).as('getGraduateCount');
    cy.intercept('GET', '/api/job/employmentType', { 
      body: { success: true, data: ['Internship', 'Placement', 'Graduate'] }
    }).as('getJobTypes');
    cy.intercept('GET', '/api/job/roles', { 
      body: { success: true, data: ['Frontend', 'Backend', 'Full Stack'] }
    }).as('getJobRoles');
    cy.intercept('GET', '/api/job/locations', { 
      body: { success: true, data: ['Remote', 'London', 'New York'] }
    }).as('getJobLocations');

    // Log all network requests for debugging
    cy.intercept('GET', '/api/job/*').as('apiRequest');
    cy.visit('/').then(() => cy.log('Visited landing page'));
  });

  it('renders the landing page with header and search section', () => {
    cy.get('h1').should('contain.text', 'Level Up Your Tech Career');
    cy.get('p').should('contain.text', 'Find the perfect opportunity tailored for you');
    cy.get('input[placeholder="Select a Job Type..."]').should('exist');
    cy.get('input[placeholder="Select a Role..."]').should('exist');
    cy.get('input[placeholder="Select a Location..."]').should('exist');
    cy.get('button').contains('Search Jobs').should('exist');
  });

  it('displays loading state initially and then job categories with counters', () => {
    cy.contains('Loading...').should('be.visible');

    cy.wait(['@getInternshipCount', '@getPlacementCount', '@getGraduateCount'], { timeout: 30000 }).then((interceptions) => {
      cy.log('API responses:', JSON.stringify(interceptions.map(i => i.response.body)));
    });

    cy.contains('Loading...', { timeout: 30000 }).should('not.exist');

    // Debug DOM
    cy.document().then((doc) => {
      const boxes = doc.querySelectorAll('[class*="bg-cover"][class*="rounded-3xl"]');
      cy.log('Box elements:', boxes.length, Array.from(boxes).map(el => el.outerHTML));
    });

    cy.get('[class*="bg-cover"][class*="rounded-3xl"]', { timeout: 30000 }).should('have.length', 3);

    cy.contains('Internships').closest('[class*="bg-cover"][class*="rounded-3xl"]').within(() => {
      cy.get('p').eq(0).should('have.text', '26');
      cy.get('p').eq(1).should('have.text', 'Internships');
    });
    cy.contains('Placements').closest('[class*="bg-cover"][class*="rounded-3xl"]').within(() => {
      cy.get('p').eq(0).should('have.text', '17');
      cy.get('p').eq(1).should('have.text', 'Placements');
    });
    cy.contains('Graduate').closest('[class*="bg-cover"][class*="rounded-3xl"]').within(() => {
      cy.get('p').eq(0).should('have.text', '23');
      cy.get('p').eq(1).should('have.text', 'Graduate');
    });
  });

  it('allows searching for jobs with filters using ComboBox', () => {
    cy.wait(['@getJobTypes', '@getJobRoles', '@getJobLocations'], { timeout: 30000 }).then((interceptions) => {
      cy.log('ComboBox API responses:', JSON.stringify(interceptions.map(i => i.response.body)));
    });

    cy.get('input[placeholder="Select a Job Type..."]').click().then(() => {
      cy.log('Clicked Job Type ComboBox');
    });

    cy.get('[class*="rounded-lg"][class*="shadow-lg"]', { timeout: 30000 }).should('be.visible').contains('Internship').click();
    cy.get('input[placeholder="Select a Job Type..."]').should('have.value', 'Internship');

    cy.get('input[placeholder="Select a Role..."]').click();
    cy.get('[class*="rounded-lg"][class*="shadow-lg"]', { timeout: 30000 }).contains('Frontend').click();
    cy.get('input[placeholder="Select a Role..."]').should('have.value', 'Frontend');

    cy.get('input[placeholder="Select a Location..."]').click();
    cy.get('[class*="rounded-lg"][class*="shadow-lg"]', { timeout: 30000 }).contains('Remote').click();
    cy.get('input[placeholder="Select a Location..."]').should('have.value', 'Remote');

    cy.get('button').contains('Search Jobs').click();
    cy.url().should('include', '/search-results?jobType=Internship&role=Frontend&location=Remote');
  });

  it('filters ComboBox options as user types', () => {
    cy.wait('@getJobRoles', { timeout: 30000 }).then((interception) => {
      cy.log('Role options:', JSON.stringify(interception.response.body));
    });

    cy.get('input[placeholder="Select a Role..."]').type('Fron').then(() => {
      cy.log('Typed "Fron" in Role ComboBox');
    });

    cy.get('input[placeholder="Select a Role..."]').parent().find('[class*="rounded-lg"][class*="shadow-lg"]', { timeout: 30000 })
      .children().should('have.length', 1);
    cy.get('[class*="rounded-lg"][class*="shadow-lg"]').contains('Frontend').should('be.visible');
    cy.get('[class*="rounded-lg"][class*="shadow-lg"]').contains('Backend').should('not.exist');
    cy.get('[class*="rounded-lg"][class*="shadow-lg"]').contains('Full Stack').should('not.exist');

    cy.get('[class*="rounded-lg"][class*="shadow-lg"]').contains('Frontend').click();
    cy.get('input[placeholder="Select a Role..."]').should('have.value', 'Frontend');
  });

  it('navigates to search results when clicking a job category box', () => {
    cy.wait(['@getInternshipCount', '@getPlacementCount', '@getGraduateCount'], { timeout: 30000 });
    cy.get('[class*="bg-cover"][class*="rounded-3xl"]', { timeout: 30000 }).contains('Internships').click();
    cy.url().should('include', '/search-results?jobType=Internship');

    cy.visit('/');
    cy.wait(['@getInternshipCount', '@getPlacementCount', '@getGraduateCount'], { timeout: 30000 });
    cy.get('[class*="bg-cover"][class*="rounded-3xl"]', { timeout: 30000 }).contains('Placements').click();
    cy.url().should('include', '/search-results?jobType=Placement');
  });

  it('displays footer with current year and contact link', () => {
    cy.contains(`Joborithm © ${new Date().getFullYear()}`).should('exist');
    cy.contains('Your gateway to the best career opportunities').should('exist');
    cy.contains('Contact Us').click();
    cy.url().should('include', '/contact');
  });

  it('handles API errors gracefully', () => {
    cy.intercept('GET', '/api/job/count/type?type=Internship', { 
      statusCode: 500, 
      body: { success: false, message: 'Server error' }
    }).as('getInternshipCountFail');
    cy.intercept('GET', '/api/job/count/type?type=Placement', { 
      statusCode: 500, 
      body: { success: false, message: 'Server error' }
    }).as('getPlacementCountFail');
    cy.intercept('GET', '/api/job/count/type?type=Graduate', { 
      statusCode: 500, 
      body: { success: false, message: 'Server error' }
    }).as('getGraduateCountFail');

    cy.visit('/');
    cy.contains('Loading...').should('not.exist');
    cy.get('input').should('have.length', 3);
    cy.get('[class*="bg-cover"][class*="rounded-3xl"]').should('not.exist');
  });
});